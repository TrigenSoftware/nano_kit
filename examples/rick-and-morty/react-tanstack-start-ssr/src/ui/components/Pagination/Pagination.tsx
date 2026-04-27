/* DISCLAIMER! VIBECODED! */
import { Link } from '@tanstack/react-router'
import { useMemo } from 'react'
import clsx from 'clsx'
import styles from './Pagination.module.css'

export interface PaginationProps {
  current: number
  total: number
  to: string
  showSiblings?: number
  previousLabel: string
  nextLabel: string
  formatPageLabel(page: number): string
  label: string
}

export function Pagination({
  current,
  total,
  to,
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
      className={styles.pagination}
    >
      <ul className={styles.list}>
        {/* Previous button */}
        {current > 1 && (
          <li>
            <Link
              to={to}
              search={{
                page: current - 1
              }}
              aria-label={previousLabel}
              className={clsx(styles.link, styles.prevNext)}
            >
              <span aria-hidden='true'>‹</span>
              <span className={styles.srOnly}>{previousLabel}</span>
            </Link>
          </li>
        )}

        {/* Page numbers */}
        {pages.map((pageNumber, index) => (
          <li key={`${pageNumber}-${index}`}>
            {typeof pageNumber === 'number'
              ? (
                <Link
                  to={to}
                  search={{
                    page: pageNumber
                  }}
                  aria-current={pageNumber === current ? 'page' : undefined}
                  aria-label={formatPageLabel(pageNumber)}
                  className={clsx(
                    styles.link,
                    pageNumber === current ? styles.current : styles.page
                  )}
                >
                  {pageNumber}
                </Link>
              )
              : (
                <span
                  className={styles.ellipsis}
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
              to={to}
              search={{
                page: current + 1
              }}
              aria-label={nextLabel}
              className={clsx(styles.link, styles.prevNext)}
            >
              <span aria-hidden='true'>›</span>
              <span className={styles.srOnly}>{nextLabel}</span>
            </Link>
          </li>
        )}
      </ul>
    </nav>
  )
}
