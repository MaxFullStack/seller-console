import { useLocation } from "@tanstack/react-router"
import { capitalizeFirst } from "@/lib/utils"

export interface BreadcrumbItem {
  label: string
  path: string
  isCurrentPage?: boolean
}

function getBreadcrumbItems(pathname: string): BreadcrumbItem[] {
  const pathSegments = pathname.split('/').filter(Boolean)
  
  const items: BreadcrumbItem[] = [
    {
      label: 'Dashboard',
      path: '/',
      isCurrentPage: pathname === '/'
    }
  ]

  if (pathname === '/') {
    return items
  }

  const routeLabels: Record<string, string> = {
    'leads': 'Leads',
    'opportunities': 'Opportunities'
  }

  let currentPath = ''
  pathSegments.forEach((segment, index) => {
    currentPath += `/${segment}`
    const isCurrentPage = index === pathSegments.length - 1
    
    items.push({
      label: routeLabels[segment] || capitalizeFirst(segment),
      path: currentPath,
      isCurrentPage
    })
  })

  return items
}

export function useBreadcrumb() {
  const location = useLocation()
  const breadcrumbItems = getBreadcrumbItems(location.pathname)
  
  return { breadcrumbItems }
}