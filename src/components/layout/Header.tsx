'use client'

import { Search, ChevronRight } from 'lucide-react'
import { usePathname } from 'next/navigation'

export default function Header() {
  const pathname = usePathname()
  const pathSegments = pathname.split('/').filter(Boolean)

  return (
    <header className="h-16 border-b border-gray-800 bg-[#13111A] flex items-center justify-between px-6">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-sm">
        <span className="text-white">Beam Onboarding Agent</span>
        <ChevronRight className="w-4 h-4 text-gray-400" />
        <span className="text-gray-400">Tasks</span>
        <ChevronRight className="w-4 h-4 text-gray-400" />
        <span className="text-gray-400">ID-04339</span>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search..."
          className="bg-gray-800 text-white pl-10 pr-4 py-2 rounded-lg text-sm w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </header>
  )
} 