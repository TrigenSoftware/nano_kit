'use client'

export interface SpinnerProps {
  children: React.ReactNode
}

export function Spinner({ children }: SpinnerProps) {
  return (
    <div className='spinner-loading'>
      <div className='spinner-spinner' />
      {children}
    </div>
  )
}
