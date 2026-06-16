'use server'

import { createClient } from '@/lib/supabase/server'
import type { SupabaseClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export type ProductState = {
  error?: string
} | undefined

const BUCKET = 'product-images'
const ALLOWED_EXT = ['jpg', 'jpeg', 'png', 'webp', 'gif']
const MAX_SIZE = 5 * 1024 * 1024 // 5MB

// 업로드된 이미지의 공개 주소(URL)에서 저장소 안의 파일 경로만 뽑아낸다.
// 예: https://...supabase.co/storage/v1/object/public/product-images/<userId>/123.jpg
//      → <userId>/123.jpg
function storagePathFromUrl(url: string | null): string | null {
  if (!url) return null
  const marker = `/${BUCKET}/`
  const idx = url.indexOf(marker)
  if (idx === -1) return null
  return url.slice(idx + marker.length)
}

// 이미지 파일을 검사하고 저장소에 올린 뒤 공개 주소를 돌려준다.
async function uploadImage(
  supabase: SupabaseClient,
  userId: string,
  file: File,
): Promise<{ url?: string; error?: string }> {
  const fileExt = file.name.split('.').pop()?.toLowerCase()
  if (!fileExt || !ALLOWED_EXT.includes(fileExt)) {
    return { error: '이미지는 JPG, PNG, WebP, GIF만 가능합니다.' }
  }
  if (file.size > MAX_SIZE) {
    return { error: '이미지 크기는 5MB 이하여야 합니다.' }
  }

  const fileName = `${userId}/${Date.now()}.${fileExt}`
  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(fileName, file)

  if (uploadError) {
    console.error('이미지 업로드 실패:', uploadError.message)
    return { error: '사진 업로드에 실패했습니다. 다시 시도해주세요.' }
  }

  const { data: { publicUrl } } = supabase.storage.from(BUCKET).getPublicUrl(fileName)
  return { url: publicUrl }
}

// 저장소에서 이미지 파일을 지운다(있을 때만, 실패해도 흐름은 막지 않음).
async function removeImage(supabase: SupabaseClient, imageUrl: string | null) {
  const path = storagePathFromUrl(imageUrl)
  if (!path) return
  const { error } = await supabase.storage.from(BUCKET).remove([path])
  if (error) console.error('이미지 삭제 실패:', error.message)
}

export async function createProduct(_prevState: ProductState, formData: FormData): Promise<ProductState> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const title = (formData.get('title') as string)?.trim()
  const description = (formData.get('description') as string)?.trim()
  const priceStr = formData.get('price') as string
  const category = formData.get('category') as string
  const imageFile = formData.get('image') as File | null

  if (!title) return { error: '상품명을 입력해주세요.' }
  if (!priceStr || isNaN(parseInt(priceStr))) return { error: '가격을 올바르게 입력해주세요.' }

  const price = parseInt(priceStr, 10)
  if (price < 0) return { error: '가격은 0원 이상이어야 합니다.' }

  let image_url: string | null = null

  // 이미지 업로드 (파일이 있는 경우)
  if (imageFile && imageFile.size > 0) {
    const result = await uploadImage(supabase, user.id, imageFile)
    if (result.error) return { error: result.error }
    image_url = result.url!
  }

  const { error } = await supabase.from('products').insert({
    user_id: user.id,
    title,
    description: description || null,
    price,
    category: category || '기타',
    image_url,
    status: 'active',
  })

  if (error) {
    // 등록에 실패하면 방금 올린 사진은 정리한다.
    await removeImage(supabase, image_url)
    return { error: '상품 등록에 실패했습니다. 다시 시도해주세요.' }
  }

  revalidatePath('/')
  redirect('/?listed=1')
}

export async function updateProduct(_prevState: ProductState, formData: FormData): Promise<ProductState> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const id = formData.get('id') as string
  const title = (formData.get('title') as string)?.trim()
  const description = (formData.get('description') as string)?.trim()
  const priceStr = formData.get('price') as string
  const category = formData.get('category') as string
  const imageFile = formData.get('image') as File | null
  const removeImageFlag = formData.get('remove_image') === '1'

  if (!id) return { error: '잘못된 접근입니다.' }
  if (!title) return { error: '상품명을 입력해주세요.' }
  if (!priceStr || isNaN(parseInt(priceStr))) return { error: '가격을 올바르게 입력해주세요.' }

  const price = parseInt(priceStr, 10)
  if (price < 0) return { error: '가격은 0원 이상이어야 합니다.' }

  // 본인 상품인지, 기존 사진은 무엇인지 먼저 확인한다.
  const { data: existing } = await supabase
    .from('products')
    .select('image_url, user_id')
    .eq('id', id)
    .single()

  if (!existing) return { error: '상품을 찾을 수 없습니다.' }
  if (existing.user_id !== user.id) return { error: '본인 상품만 수정할 수 있습니다.' }

  const oldImageUrl: string | null = existing.image_url
  let image_url: string | null = oldImageUrl
  let imageToDelete: string | null = null

  if (imageFile && imageFile.size > 0) {
    // 새 사진으로 교체
    const result = await uploadImage(supabase, user.id, imageFile)
    if (result.error) return { error: result.error }
    image_url = result.url!
    imageToDelete = oldImageUrl // 기존 사진은 나중에 정리
  } else if (removeImageFlag) {
    // 사진만 삭제
    image_url = null
    imageToDelete = oldImageUrl
  }

  const { error } = await supabase
    .from('products')
    .update({
      title,
      description: description || null,
      price,
      category: category || '기타',
      image_url,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('user_id', user.id) // 본인 상품만 수정 가능

  if (error) {
    // 수정 실패 시, 새로 올렸던 사진이 있으면 정리
    if (imageFile && imageFile.size > 0 && image_url !== oldImageUrl) {
      await removeImage(supabase, image_url)
    }
    return { error: '수정에 실패했습니다. 다시 시도해주세요.' }
  }

  // 교체/삭제로 더 이상 쓰지 않는 옛 사진을 저장소에서 정리한다.
  if (imageToDelete && imageToDelete !== image_url) {
    await removeImage(supabase, imageToDelete)
  }

  revalidatePath('/')
  revalidatePath(`/products/${id}`)
  redirect(`/products/${id}`)
}

export async function deleteProduct(productId: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // 삭제 전에 사진 주소를 확보 (본인 상품만)
  const { data: existing } = await supabase
    .from('products')
    .select('image_url')
    .eq('id', productId)
    .eq('user_id', user.id)
    .single()

  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', productId)
    .eq('user_id', user.id) // 본인 상품만 삭제 가능

  if (error) throw new Error('삭제에 실패했습니다.')

  // 상품과 함께 저장소의 사진 파일도 정리한다.
  await removeImage(supabase, existing?.image_url ?? null)

  revalidatePath('/')
  redirect('/')
}

export async function markAsSold(productId: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  await supabase
    .from('products')
    .update({ status: 'sold' })
    .eq('id', productId)
    .eq('user_id', user.id)

  revalidatePath('/')
  revalidatePath(`/products/${productId}`)
}
