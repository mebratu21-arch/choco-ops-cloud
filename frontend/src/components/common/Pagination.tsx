import React from 'react';
import clsx from 'clsx';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { Button } from '../ui/Button';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  pageSize: number;
  totalItems: number;
  className?: string;
  onPageSizeChange?: (size: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  pageSize,
  totalItems,
  className,
  onPageSizeChange,
}) => {
  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, '...', totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }
    return pages;
  };

  const showingStart = Math.min((currentPage - 1) * pageSize + 1, totalItems);
  const showingEnd = Math.min(currentPage * pageSize, totalItems);

  return (
    <div
      className={clsx(
        'flex flex-col sm:flex-row items-center justify-between gap-4 py-4',
        'text-sm text-[#5d4037]', // Chocolate text color
        className
      )}
      aria-label="Pagination"
    >
      {/* Items count & Page Size */}
      <div className="flex items-center gap-4 text-[#8a6d65]">
        <span>
          Showing <span className="font-semibold text-[#4B2E2A]">{showingStart}</span> to{' '}
          <span className="font-semibold text-[#4B2E2A]">{showingEnd}</span> of{' '}
          <span className="font-semibold text-[#4B2E2A]">{totalItems}</span> results
        </span>
        
        {onPageSizeChange && (
            <div className="hidden sm:flex items-center gap-2 ml-4">
                <span className="whitespace-nowrap">Show:</span>
                <select
                    value={pageSize}
                    onChange={(e) => onPageSizeChange(Number(e.target.value))}
                    className="bg-[#fdf8f6] border border-[#e5d4c5] rounded-md px-2 py-1 text-[#4B2E2A] focus:outline-none focus:ring-1 focus:ring-[#c7a47e]"
                >
                    {[10, 20, 50, 100].map(size => (
                        <option key={size} value={size}>{size}</option>
                    ))}
                </select>
            </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          aria-label="Previous page"
          className="border-[#e5d4c5] text-[#5d4037] hover:bg-[#f3e7dd] hover:text-[#4B2E2A]"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <div className="flex items-center gap-1">
          {getPageNumbers().map((page, idx) => (
            <React.Fragment key={idx}>
              {page === '...' ? (
                <span className="px-2 text-[#8a6d65]">
                  <MoreHorizontal className="h-4 w-4" />
                </span>
              ) : (
                <button
                  onClick={() => onPageChange(page as number)}
                  aria-current={currentPage === page ? 'page' : undefined}
                  className={clsx(
                    'h-8 w-8 flex items-center justify-center rounded-md text-sm font-medium transition-colors',
                    currentPage === page
                      ? 'bg-[#4B2E2A] text-white shadow-sm'
                      : 'text-[#5d4037] hover:bg-[#f3e7dd] hover:text-[#4B2E2A]'
                  )}
                >
                  {page}
                </button>
              )}
            </React.Fragment>
          ))}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          aria-label="Next page"
          className="border-[#e5d4c5] text-[#5d4037] hover:bg-[#f3e7dd] hover:text-[#4B2E2A]"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default Pagination;
