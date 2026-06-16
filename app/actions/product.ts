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
const MAX_IMAGES = 5

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

// 여러 이미지 파일을 검사하고 저장소에 올린 뒤 공개 주소 목록을 돌려준다.
async function uploadImages(
  supabase: SupabaseClient,
  userId: string,
  files: File[],
): Promise<{ urls?: string[]; error?: string }> {
  const urls: string[] = []

  for (const file of files) {
    const fileExt = file.name.split('.').pop()?.toLowerCase()
    if (!fileExt || !ALLOWED_EXT.includes(fileExt)) {
      await removeImages(supabase, urls) // 이미 올린 건 정리
      return { error: '이미지는 JPG, PNG, WebP, GIF만 가능합니다.' }
    }
    if (file.size > MAX_SIZE) {
      await removeImages(supabase, urls)
      return { error: '이미지 크기는 한 장당 5MB 이하여야 합니다.' }
    }

    const fileName = `${userId}/${Date.now()}-${urls.length}.${fileExt}`
    const { error: uploadError } = await supabase.storage.from(BUCKET).upload(fileName, file)
    if (uploadError) {
      console.error('이미지 업로드 실패:', uploadError.message)
      await removeImages(supabase, urls)
      return { error: '사진 업로드에 실패했습니다. 다시 시도해주세요.' }
    }

    const { data: { publicUrl } } = supabase.storage.from(BUCKET).getPublicUrl(fileName)
    urls.push(publicUrl)
  }

  return { urls }
}

// 저장소에서 이미지 파일들을 지운다(있을 때만, 실패해도 흐름은 막지 않음).
async function removeImages(supabase: SupabaseClient, urls: (string | null)[]) {
  const paths = urls.map(storagePathFromUrl).filter((p): p is string => !!p)
  if (paths.length === 0) return
  const { error } = await supabase.storage.from(BUCKET).remove(paths)
  if (error) console.error('이미지 삭제 실패:', error.message)
}

// 폼에서 첨부된 실제 이미지 파일만 골라낸다(빈 파일 제외).
function getImageFiles(formData: FormData): File[] {
  return formData.getAll('image').filter(
    (v): v is File => v instanceof File && v.size > 0,
  )
}

export async function createProduct(_prevState: ProductState, formData: FormData): Promise<ProductState> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const title = (formData.get('title') as string)?.trim()
  const description = (formData.get('description') as string)?.trim()
  const priceStr = formData.get('price') as string
  const category = formData.get('category') as string
  const files = getImageFiles(formData)

  if (!title) return { error: '상품명을 입력해주세요.' }
  if (!priceStr || isNaN(parseInt(priceStr))) return { error: '가격을 올바르게 입력해주세요.' }
  if (files.length > MAX_IMAGES) return { error: `사진은 최대 ${MAX_IMAGES}장까지 올릴 수 있습니다.` }

  const price = parseInt(priceStr, 10)
  if (price < 0) return { error: '가격은 0원 이상이어야 합니다.' }

  let image_urls: string[] = []
  if (files.length > 0) {
    const result = await uploadImages(supabase, user.id, files)
    if (result.error) return { error: result.error }
    image_urls = result.urls!
  }

  const { error } = await supabase.from('products').insert({
    user_id: user.id,
    title,
    description: description || null,
    price,
    category: category || '기타',
    image_url: image_urls[0] ?? null, // 목록 썸네일용 대표 사진
    image_urls: image_urls.length > 0 ? image_urls : null,
    status: 'active',
  })

  if (error) {
    await removeImages(supabase, image_urls)
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
  const files = getImageFiles(formData)
  // 사용자가 지우지 않고 그대로 둔 기존 사진들의 주소
  const keptImages = formData.getAll('existing_images').filter((v): v is string => typeof v === 'string')

  if (!id) return { error: '잘못된 접근입니다.' }
  if (!title) return { error: '상품명을 입력해주세요.' }
  if (!priceStr || isNaN(parseInt(priceStr))) return { error: '가격을 올바르게 입력해주세요.' }

  const price = parseInt(priceStr, 10)
  if (price < 0) return { error: '가격은 0원 이상이어야 합니다.' }
  if (keptImages.length + files.length > MAX_IMAGES) {
    return { error: `사진은 최대 ${MAX_IMAGES}장까지 올릴 수 있습니다.` }
  }

  // 본인 상품인지, 기존 사진 목록은 무엇인지 확인한다.
  const { data: existing } = await supabase
    .from('products')
    .select('image_url, image_urls, user_id')
    .eq('id', id)
    .single()

  if (!existing) return { error: '상품을 찾을 수 없습니다.' }
  if (existing.user_id !== user.id) return { error: '본인 상품만 수정할 수 있습니다.' }

  const oldImages: string[] = existing.image_urls ?? (existing.image_url ? [existing.image_url] : [])

  // 새로 올린 사진 업로드
  let uploadedUrls: string[] = []
  if (files.length > 0) {
    const result = await uploadImages(supabase, user.id, files)
    if (result.error) return { error: result.error }
    uploadedUrls = result.urls!
  }

  const finalImages = [...keptImages, ...uploadedUrls]
  // 더 이상 쓰지 않는(지워진) 기존 사진
  const removedImages = oldImages.filter(url => !keptImages.includes(url))

  const { error } = await supabase
    .from('products')
    .update({
      title,
      description: description || null,
      price,
      category: category || '기타',
      image_url: finalImages[0] ?? null,
      image_urls: finalImages.length > 0 ? finalImages : null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('user_id', user.id) // 본인 상품만 수정 가능

  if (error) {
    // 수정 실패 시, 새로 올렸던 사진 정리
    await removeImages(supabase, uploadedUrls)
    return { error: '수정에 실패했습니다. 다시 시도해주세요.' }
  }

  // 지워진 기존 사진을 저장소에서 정리
  await removeImages(supabase, removedImages)

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
    .select('image_url, image_urls')
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
  const images: string[] = existing?.image_urls ?? (existing?.image_url ? [existing.image_url] : [])
  await removeImages(supabase, images)

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
