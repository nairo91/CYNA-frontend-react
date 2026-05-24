import { useEffect, useState } from 'react'
import { getCategories, getFeaturedProducts } from '../api/catalogApi'
import { Carousel } from '../components/Carousel'
import { CategoriesGrid } from '../components/CategoriesGrid'
import { Hero } from '../components/Hero'
import { IosInstallBanner } from '../components/IosInstallBanner'
import { TopProducts } from '../components/TopProducts'
import { useIosInstallPrompt } from '../hooks/useIosInstallPrompt'

export function HomePage() {
  const { shouldShow, dismiss } = useIosInstallPrompt()
  const [categories, setCategories] = useState([])
  const [featuredProducts, setFeaturedProducts] = useState([])
  const [categoriesError, setCategoriesError] = useState(false)
  const [productsError, setProductsError] = useState(false)
  const [isCategoriesLoading, setIsCategoriesLoading] = useState(true)
  const [isProductsLoading, setIsProductsLoading] = useState(true)

  useEffect(() => {
    let isCancelled = false

    getCategories()
      .then((data) => {
        if (!isCancelled) {
          setCategoriesError(false)
          setCategories(data)
        }
      })
      .catch(() => {
        if (!isCancelled) {
          setCategoriesError(true)
        }
      })
      .finally(() => {
        if (!isCancelled) {
          setIsCategoriesLoading(false)
        }
      })

    getFeaturedProducts()
      .then((data) => {
        if (!isCancelled) {
          setProductsError(false)
          setFeaturedProducts(data)
        }
      })
      .catch(() => {
        if (!isCancelled) {
          setProductsError(true)
        }
      })
      .finally(() => {
        if (!isCancelled) {
          setIsProductsLoading(false)
        }
      })

    return () => {
      isCancelled = true
    }
  }, [])

  return (
    <>
      <Carousel />
      <Hero />
      {shouldShow ? <IosInstallBanner onDismiss={dismiss} /> : null}
      <CategoriesGrid categories={categories} isLoading={isCategoriesLoading} error={categoriesError} />
      <TopProducts products={featuredProducts} isLoading={isProductsLoading} error={productsError} />
    </>
  )
}
