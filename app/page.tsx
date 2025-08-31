export const dynamic = 'force-dynamic'
export const revalidate = 3600 // Revalidate every hour

import { NavigationContent } from '@/components/navigation-content'
import { headers } from 'next/headers'
import { Metadata, ResolvingMetadata } from 'next/types'
import { ScrollToTop } from '@/components/ScrollToTop'
import { Container } from '@/components/ui/container'


async function getData() {
  try {
    // 使用绝对 URL，确保构建时可以访问
    const baseUrl = process.env.NEXT_PUBLIC_API_URL
    console.log('Building with base URL:', baseUrl) // 添加构建日志

    const [navigationRes, siteRes] = await Promise.all([
      fetch(new URL('/api/home/navigation', baseUrl).toString()),
      fetch(new URL('/api/home/site', baseUrl).toString())
    ])

    if (!navigationRes.ok || !siteRes.ok) {
      throw new Error(`Failed to fetch data: Navigation ${navigationRes.status}, Site ${siteRes.status}`)
    }

    const [navigationData, siteData] = await Promise.all([
      navigationRes.json(),
      siteRes.json()
    ])

    // 添加数据验证日志
    console.log('Navigation data received:', !!navigationData)
    console.log('Site data received:', !!siteData)

    return { 
      navigationData: navigationData || { navigationItems: [] }, 
      siteData: siteData || {
        basic: {
          title: 'NavSphere',
          description: '',
          keywords: ''
        },
        appearance: {
          logo: '',
          favicon: '',
          theme: 'system'
        }
      }
    }
  } catch (error) {
    console.error('Error in getData:', error)
    // 返回默认数据而不是空值
    return {
      navigationData: { navigationItems: [] },
      siteData: {
        basic: {
          title: 'NavSphere',
          description: 'Default description',
          keywords: 'default keywords'
        },
        appearance: {
          logo: '',
          favicon: '',
          theme: 'system'
        }
      }
    }
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const { siteData } = await getData()
  
  return {
    title: siteData.basic.title,
    description: siteData.basic.description,
    keywords: siteData.basic.keywords,
    icons: {
      icon: siteData.appearance.favicon,
    },
  }
}

export function generateStaticParams() {
  return [{}]
}

export default async function HomePage({ 
  searchParams 
}: { 
  searchParams: { error?: string } 
}) {
  const { navigationData, siteData } = await getData()
  
  console.log('Rendering HomePage with data:', { 
    hasNavigation: !!navigationData?.navigationItems,
    hasSiteData: !!siteData?.basic 
  })

  return (
    <Container>
      {searchParams.error === 'unauthorized' && (
        <div className="mb-4 p-4 border border-red-200 bg-red-50 rounded-lg">
          <div className="flex items-center">
            <div className="text-red-600">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">访问被拒绝</h3>
              <p className="text-sm text-red-700 mt-1">您没有访问管理后台的权限。</p>
            </div>
          </div>
        </div>
      )}
      <NavigationContent navigationData={navigationData} siteData={siteData} />
      <ScrollToTop />
    </Container>
  )
}
