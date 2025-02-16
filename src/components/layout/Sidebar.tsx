'use client'

import { 
  Home, 
  Inbox, 
  ListTodo, 
  Layout, 
  Tool, 
  Link2, 
  Bot,
  MessageSquare,
  Settings
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const mainNavItems = [
  { icon: Home, label: 'Home', href: '/' },
  { icon: Inbox, label: 'Inbox', href: '/inbox' },
  { icon: ListTodo, label: 'Tasks', href: '/tasks' },
  { icon: Layout, label: 'Templates', href: '/templates' },
  { icon: Tool, label: 'Tools', href: '/tools' },
  { icon: Link2, label: 'Integrations', href: '/integrations' },
  { icon: Bot, label: 'Beam AI', href: '/beam-ai' },
]

const agentNavItems = [
  { icon: Bot, label: 'Beam Onboarding Agent', href: '/agents/onboarding' },
  { icon: Layout, label: 'Dashboard', href: '/dashboard' },
  { icon: ListTodo, label: 'Tasks', href: '/tasks' },
  { icon: Settings, label: 'Configuration', href: '/configuration' },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-[250px] min-h-screen bg-[#1A1721] text-white flex flex-col">
      {/* Logo Section */}
      <div className="p-4 flex items-center gap-2 border-b border-gray-800">
        <Bot className="w-6 h-6 text-blue-500" />
        <span className="font-medium">Beam Internal</span>
      </div>

      {/* Main Navigation */}
      <nav className="p-4 space-y-1">
        {mainNavItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm
              ${pathname === item.href 
                ? 'bg-gray-800 text-white' 
                : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
          >
            <item.icon className="w-5 h-5" />
            {item.label}
          </Link>
        ))}
      </nav>

      {/* Agents Section */}
      <div className="mt-6 p-4">
        <h3 className="text-xs font-medium text-gray-400 px-3 mb-3">Your Agents</h3>
        <nav className="space-y-1">
          {agentNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm
                ${pathname === item.href 
                  ? 'bg-gray-800 text-white' 
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </Link>
          ))}
        </nav>
      </div>

      {/* Support Section */}
      <div className="mt-auto p-4">
        <Link
          href="/support"
          className="flex items-center gap-3 px-3 py-2 text-sm text-gray-400 hover:bg-gray-800 hover:text-white rounded-lg"
        >
          <MessageSquare className="w-5 h-5" />
          Chat & support
        </Link>
      </div>
    </aside>
  )
} 