import React from 'react'
import Header from './Header'
import BottomNav from './BottomNav'

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
        {children}
      </main>
      <BottomNav />
    </div>
  </div>
)

export default PageWrapper
