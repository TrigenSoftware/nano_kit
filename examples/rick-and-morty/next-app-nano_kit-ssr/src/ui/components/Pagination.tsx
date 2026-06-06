/* DISCLAIMER! VIBECODED! */
'use client'
import { useMemo } from 'react'
import clsx from 'clsx'
import { Link } from '@nano_kit/next-router'

export interface PaginationProps {
  current: number
  total: number
  formatUrl: (page: number) => string
  showSiblings?: number
  previousLabel: string
  nextLabel: string
  formatPageLabel: (page: number) => string
  label: string
}

export function Pagination({
  current,
  total,
  formatUrl,
  showSiblings = 2,
  previousLabel,
  nextLabel,
  formatPageLabel,
  label
}: PaginationProps) {
  const pages = useMemo(() => {
    const delta = showSiblings
    const range = []
    const rangeWithDots = []
    const start = Math.max(2, current - delta)
    const end = Math.min(total - 1, current + delta)

    for (let i = start; i <= end; i++) {
      range.push(i)
    }

    // Add first page
    if (start > 2) {
      rangeWithDots.push(1, '...')
    } else if (start === 2) {
      rangeWithDots.push(1)
    } else {
      rangeWithDots.push(1)
    }

    // Add calculated range
    rangeWithDots.push(...range)

    // Add last page
    if (end < total - 1) {
      rangeWithDots.push('...', total)
    } else if (end === total - 1) {
      rangeWithDots.push(total)
    } else if (total > 1) {
      // Only add last page if it's different from first
      if (total !== 1) {
        rangeWithDots.push(total)
      }
    }

    // Remove duplicates and filter out invalid entries
    return rangeWithDots.filter((item, index, arr) => {
      if (typeof item === 'number') {
        return item <= total && arr.indexOf(item) === index
      }

      return true
    })
  }, [
    current,
    total,
    showSiblings
  ])

  if (total <= 1) {
    return null
  }

  return (
    <nav
      role='navigation'
      aria-label={label}
      className='pagination-pagination'
    >
      <ul className='pagination-list'>
        {/* Previous button */}
        {current > 1 && (
          <li>
            <Link
              href={formatUrl(current - 1)}
              aria-label={previousLabel}
              className={clsx('pagination-link', 'pagination-prev-next')}
            >
              <span aria-hidden='true'>‹</span>
              <span className='pagination-sr-only'>{previousLabel}</span>
            </Link>
          </li>
        )}

        {/* Page numbers */}
        {pages.map((pageNumber, index) => (
          <li key={`${pageNumber}-${index}`}>
            {typeof pageNumber === 'number'
              ? (
                <Link
                  href={formatUrl(pageNumber)}
                  aria-current={pageNumber === current ? 'page' : undefined}
                  aria-label={formatPageLabel(pageNumber)}
                  className={clsx(
                    'pagination-link',
                    pageNumber === current ? 'pagination-current' : 'pagination-page'
                  )}
                >
                  {pageNumber}
                </Link>
              )
              : (
                <span
                  className='pagination-ellipsis'
                  aria-hidden='true'
                >
                  {pageNumber}
                </span>
              )}
          </li>
        ))}

        {/* Next button */}
        {current < total && (
          <li>
            <Link
              href={formatUrl(current + 1)}
              aria-label={nextLabel}
              className={clsx('pagination-link', 'pagination-prev-next')}
            >
              <span aria-hidden='true'>›</span>
              <span className='pagination-sr-only'>{nextLabel}</span>
            </Link>
          </li>
        )}
      </ul>
    </nav>
  )
}
