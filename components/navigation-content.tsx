'use client'

import { useState, useMemo } from 'react'
import { useSession } from 'next-auth/react'
import type { NavigationData } from '@/types/navigation'
import type { SiteConfig } from '@/types/site'
import { NavigationCard } from '@/components/navigation-card'
import { Sidebar } from '@/components/sidebar'
import { SearchBar } from '@/components/search-bar'
import { ModeToggle } from '@/components/mode-toggle'
import { Footer } from '@/components/footer'
import { Github, HelpCircle } from 'lucide-react'
import { Button } from "@/registry/new-york/ui/button"
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Menu } from 'lucide-react'

interface NavigationContentProps {
  navigationData: NavigationData
  siteData: SiteConfig
}

export function NavigationContent({ navigationData, siteData }: NavigationContentProps) {
  const { data: session } = useSession()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  // 过滤私密项目的函数
  const filterPrivateItems = useMemo(() => {
    const isLoggedIn = !!session?.user
    
    // 调试日志
    console.log('Navigation Content - Session:', session)
    console.log('Navigation Content - Is Logged In:', isLoggedIn)
    console.log('Navigation Content - Original Data:', navigationData)
    
    const filteredNavigationData = {
      ...navigationData,
      navigationItems: navigationData.navigationItems
        .filter(category => {
          const shouldShow = !category.private || isLoggedIn
          console.log(`Category "${category.title}" - private: ${category.private}, shouldShow: ${shouldShow}`)
          return shouldShow
        })
        .map(category => ({
          ...category,
          items: (category.items || []).filter(item => !item.private || isLoggedIn),
          subCategories: (category.subCategories || [])
            .filter(sub => !sub.private || isLoggedIn) // 过滤子分类
            .map(sub => ({
              ...sub,
              items: (sub.items || []).filter(item => !item.private || isLoggedIn)
            }))
        }))
    }
    
    console.log('Navigation Content - Filtered Data:', filteredNavigationData)
    return filteredNavigationData
  }, [navigationData, session])

  // 修复类型检查
  const searchResults = useMemo(() => {
    const query = searchQuery.toLowerCase().trim()
    if (!query) return []
    
    const isLoggedIn = !!session?.user

    return filterPrivateItems.navigationItems.map(category => {
      // 搜索主分类下的项目
      const items = (category.items || []).filter(item => {
        const titleMatch = item.title.toLowerCase().includes(query)
        const descMatch = item.description?.toLowerCase().includes(query)
        const isVisible = !item.private || isLoggedIn
        return (titleMatch || descMatch) && isVisible
      })

      // 搜索子分类下的项目
      const subResults = (category.subCategories || []).map(sub => {
        const subItems = (sub.items || []).filter(item => {
          const titleMatch = item.title.toLowerCase().includes(query)
          const descMatch = item.description?.toLowerCase().includes(query)
          const isVisible = !item.private || isLoggedIn
          return (titleMatch || descMatch) && isVisible
        })
        return { ...sub, items: subItems }
      }).filter(sub => sub.items.length > 0)

      return {
        category,
        items,
        subCategories: subResults
      }
    }).filter(result => result.items.length > 0 || result.subCategories.length > 0)
  }, [filterPrivateItems, searchQuery, session])

  const handleSearch = (query: string) => {
    setSearchQuery(query)
  }

  return (
    <div className="flex flex-col sm:flex-row min-h-screen">
      <div className="hidden sm:block">
        <Sidebar
          navigationData={filterPrivateItems}
          siteInfo={siteData}
          className="sticky top-0 h-screen"
        />
      </div>

      <div className={cn(
        "fixed inset-0 z-50 bg-background/80 backdrop-blur-sm transition-all sm:hidden",
        isSidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
      )}>
        <div className={cn(
          "fixed inset-y-0 right-0 sm:left-0 w-3/4 max-w-xs bg-background shadow-lg transform transition-transform duration-200 ease-in-out",
          isSidebarOpen ? "translate-x-0" : "translate-x-full sm:-translate-x-full"
        )}>
          <Sidebar
            navigationData={filterPrivateItems}
            siteInfo={siteData}
            onClose={() => setIsSidebarOpen(false)}
          />
        </div>
      </div>

      <main className="flex-1">
        <div className="sticky top-0 bg-background/90 backdrop-blur-sm z-10 px-3 sm:px-6 py-2">
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <SearchBar
                navigationData={filterPrivateItems}
                onSearch={handleSearch}
                searchResults={searchResults}
                searchQuery={searchQuery}
              />
            </div>
            <div className="flex items-center gap-1">
              <ModeToggle />
              <Link
                href="https://github.com/tianyaxiang/NavSphere"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="访问 GitHub 仓库"
              >
                <Button
                  variant="ghost"
                  size="icon"
                  className="hover:bg-accent hover:text-accent-foreground"
                >
                  <Github className="h-5 w-5" />
                </Button>
              </Link>
              <Link
                href="https://mp.weixin.qq.com/s/90LUmKilfLZfc5L63Ej3Sg"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="查看帮助文档"
              >
                <Button
                  variant="ghost"
                  size="icon"
                  className="hover:bg-accent hover:text-accent-foreground"
                >
                  <HelpCircle className="h-5 w-5" />
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                className="sm:hidden"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              >
                <Menu className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>

        <div className="px-3 sm:px-6 py-3 sm:py-6">
          <div className="space-y-6">
            {filterPrivateItems.navigationItems.map((category) => (
              <section key={category.id} id={category.id} className="scroll-m-16">
                <div className="space-y-4">
                  <h2 className="text-base font-medium tracking-tight">
                    {category.title}
                  </h2>

                  {category.subCategories && category.subCategories.length > 0 ? (
                    category.subCategories.map((subCategory) => (
                      <div key={subCategory.id} id={subCategory.id} className="space-y-3">
                        <h3 className="text-sm font-medium text-muted-foreground">
                          {subCategory.title}
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                          {(subCategory.items || []).map((item) => (
                            <NavigationCard key={item.id} item={item} />
                          ))}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {(category.items || []).map((item) => (
                        <NavigationCard key={item.id} item={item} />
                      ))}
                    </div>
                  )}
                </div>
              </section>
            ))}
          </div>
        </div>
        {/* 页脚 */}
        <Footer siteInfo={siteData} />
      </main>
    </div>
  )
}
