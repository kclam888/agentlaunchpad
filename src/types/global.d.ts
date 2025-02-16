declare module '@/contexts/NotificationContext' {
  export interface Notification {
    id: string
    type: 'success' | 'error' | 'info' | 'warning'
    title: string
    message: string
  }

  export interface NotificationContextType {
    addNotification: (notification: Omit<Notification, 'id'>) => void
    removeNotification: (id: string) => void
  }

  export function useNotification(): NotificationContextType
  export function NotificationProvider({ children }: { children: React.ReactNode }): JSX.Element
}

declare module '@/lib/prisma' {
  import { PrismaClient } from '@prisma/client'
  export const prisma: PrismaClient
}

declare module '@/components/notifications/NotificationContainer' {
  export function NotificationContainer(): JSX.Element
}

declare module '@/components/layout/Sidebar' {
  export default function Sidebar(): JSX.Element
}

declare module '@/components/layout/Header' {
  export default function Header(): JSX.Element
} 