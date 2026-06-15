'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export type ProductState = {
  error?: string
} | undefined

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
    const fileExt = imageFile.name.split('.').pop()?.toLowerCase()
    const allowed = ['jpg', 'jpeg', 'png', 'webp', 'gif']
    if (!fileExt || !allowed.includes(fileExt)) {
      return { error: '이미지는 JPG, PNG, WebP, GIF만 가능합니다.' }
    }
    if (imageFile.size > 5 * 1024 * 1024) {
      return { error: '이미지 크기는 5MB 이하여야 합니다.' }
    }

    const fileName = `${user.id}/${Date.now()}.${fileExt}`
    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(fileName, imageFile)

    if (uploadError) {
      // 스토리지 버킷이 없어도 상품 등록은 계속 진행
      console.error('이미지 업로드 실패:', uploadError.message)
    } else {
      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(fileName)
      image_url = publicUrl
    }
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

  if (error) return { error: '상품 등록에 실패했습니다. 다시 시도해주세요.' }

  revalidatePath('/')
  redirect('/?listed=1')
}

export async function deleteProduct(productId: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', productId)
    .eq('user_id', user.id) // 본인 상품만 삭제 가능

  if (error) throw new Error('삭제에 실패했습니다.')

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
