import React from 'react'
import Header from './Header'
import BottomNav from './BottomNav'
import RoleSwitcher from '@/components/ui/RoleSwitcher'

interface PageWrapperProps {
  children: React.ReactNode
  title?: string
  showBackButton?: boolean
  headerRight?: React.ReactNode
}

const PageWrapper: React.FC<PageWrapperProps> = ({
  children,
  title,
  showBackButton = false,
  headerRight,
}) => (
  <div className="min-h-screen bg-gray-50">
    <div className="max-w-md mx-auto bg-white min-h-screen relative">
      {title && (
        <Header title={title} showBackButton={showBackButton} rightElement={headerRight} />
      )}
      <main className={['pb-24', title ? 'pt-14' : ''].join(' ')}>
        <div className="pt-2">
          <RoleSwitcher />
        </div>
        {children}
      </main>
      <BottomNav />
    </div>
  </div>
)

export default PageWrapper
