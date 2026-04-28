/** Max-width content wrapper for consistent horizontal rhythm (8px grid). */
export function PageContainer({ children, className = '' }) {
  return (
    <div className={`mx-auto w-full max-w-[1800px] px-4 sm:px-6 lg:px-10 ${className}`}>
      {children}
    </div>
  )
}
