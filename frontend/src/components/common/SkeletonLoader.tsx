import React from 'react';
import clsx from 'clsx';

const baseSkeleton =
  'relative overflow-hidden bg-[#f3e7dd] rounded-md before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.5s_infinite] before:bg-gradient-to-r before:from-transparent before:via-[#e3d0c0] before:to-transparent';

const shimmerKeyframes = `
@keyframes shimmer {
  100% {
    transform: translateX(100%);
  }
}
`;

interface SkeletonCommonProps {
  className?: string;
}

type SkeletonTableProps = SkeletonCommonProps & {
  rows?: number;
  columns?: number;
};

type SkeletonListProps = SkeletonCommonProps & {
  items?: number;
};

export const SkeletonText: React.FC<SkeletonCommonProps & { width?: string; height?: string }> = ({
  className,
  width = 'w-32',
  height = 'h-4',
}) => (
  <>
    <style>{shimmerKeyframes}</style>
    <div className={clsx(baseSkeleton, width, height, className)} aria-hidden="true" />
  </>
);

export const SkeletonAvatar: React.FC<SkeletonCommonProps & { size?: string }> = ({
  className,
  size = 'h-10 w-10',
}) => (
  <>
    <style>{shimmerKeyframes}</style>
    <div
      className={clsx(baseSkeleton, size, 'rounded-full', className)}
      aria-hidden="true"
    />
  </>
);

export const SkeletonCard: React.FC<SkeletonCommonProps> = ({ className }) => (
  <>
    <style>{shimmerKeyframes}</style>
    <div
      className={clsx(
        'bg-white rounded-2xl shadow-sm border border-[#e5d4c5] p-4 sm:p-6',
        'flex flex-col gap-3',
        className,
      )}
      aria-hidden="true"
    >
      <div className="flex items-center gap-3">
        <SkeletonAvatar />
        <div className="flex-1 space-y-2">
          <SkeletonText width="w-32" />
          <SkeletonText width="w-20" />
        </div>
      </div>
      <div className="space-y-2 mt-2">
        <SkeletonText width="w-full" />
        <SkeletonText width="w-5/6" />
        <SkeletonText width="w-2/3" />
      </div>
    </div>
  </>
);

export const SkeletonList: React.FC<SkeletonListProps> = ({ items = 5, className }) => (
  <>
    <style>{shimmerKeyframes}</style>
    <ul className={clsx('space-y-3', className)} aria-hidden="true">
      {Array.from({ length: items }).map((_, idx) => (
        <li
          key={idx}
          className="flex items-center gap-3 bg-white rounded-xl border border-[#e5d4c5] px-4 py-3"
        >
          <SkeletonAvatar />
          <div className="flex-1 space-y-2">
            <SkeletonText width="w-40" />
            <SkeletonText width="w-24" />
          </div>
        </li>
      ))}
    </ul>
  </>
);

export const SkeletonTable: React.FC<SkeletonTableProps> = ({
  rows = 5,
  columns = 5,
  className,
}) => (
  <>
    <style>{shimmerKeyframes}</style>
    <div
      className={clsx(
        'w-full overflow-x-auto bg-white rounded-2xl border border-[#e5d4c5]',
        className,
      )}
      aria-hidden="true"
    >
      <table className="min-w-full">
        <thead className="bg-[#fdf8f6]">
          <tr>
            {Array.from({ length: columns }).map((_, idx) => (
              <th key={idx} className="px-4 sm:px-6 py-3">
                <SkeletonText width="w-20" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[#f0e0d2]">
          {Array.from({ length: rows }).map((_, rIdx) => (
            <tr key={rIdx}>
              {Array.from({ length: columns }).map((_, cIdx) => (
                <td key={cIdx} className="px-4 sm:px-6 py-3">
                  <SkeletonText width="w-full" />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </>
);

// New form skeleton variants

type SkeletonFormProps = SkeletonCommonProps & {
  fields?: number;
};

export const SkeletonForm: React.FC<SkeletonFormProps> = ({ fields = 4, className }) => (
  <>
    <style>{shimmerKeyframes}</style>
    <form
      className={clsx(
        'space-y-4 bg-white rounded-2xl p-4 sm:p-6 border border-[#e5d4c5]',
        className,
      )}
      aria-hidden="true"
    >
      {Array.from({ length: fields }).map((_, idx) => (
        <div key={idx} className="space-y-1">
          <SkeletonText width="w-24" height="h-3" /> {/* Label */}
          <SkeletonText height="h-10" /> {/* Input */}
        </div>
      ))}
      <SkeletonText width="w-32" height="h-10" className="mt-4" /> {/* Button */}
    </form>
  </>
);

type SkeletonFormFieldProps = SkeletonCommonProps & {
  labelWidth?: string;
  inputHeight?: string;
};

export const SkeletonFormField: React.FC<SkeletonFormFieldProps> = ({
  className,
  labelWidth = 'w-24',
  inputHeight = 'h-10',
}) => (
  <>
    <style>{shimmerKeyframes}</style>
    <div className={clsx('space-y-1', className)} aria-hidden="true">
      <SkeletonText width={labelWidth} height="h-3" /> {/* Label */}
      <SkeletonText height={inputHeight} /> {/* Input */}
    </div>
  </>
);

// New checkbox skeleton variants

type SkeletonCheckboxProps = SkeletonCommonProps & {
  labelWidth?: string;
};

export const SkeletonCheckbox: React.FC<SkeletonCheckboxProps> = ({
  className,
  labelWidth = 'w-32',
}) => (
  <>
    <style>{shimmerKeyframes}</style>
    <div className={clsx('flex items-center gap-2', className)} aria-hidden="true">
      <div className={clsx(baseSkeleton, 'h-4 w-4 rounded-sm')} /> {/* Checkbox */}
      <SkeletonText width={labelWidth} height="h-4" /> {/* Label */}
    </div>
  </>
);

type SkeletonCheckboxGroupProps = SkeletonCommonProps & {
  items?: number;
  labelWidth?: string;
};

export const SkeletonCheckboxGroup: React.FC<SkeletonCheckboxGroupProps> = ({
  items = 3,
  labelWidth = 'w-32',
  className,
}) => (
  <>
    <style>{shimmerKeyframes}</style>
    <div className={clsx('space-y-2', className)} aria-hidden="true">
      {Array.from({ length: items }).map((_, idx) => (
        <SkeletonCheckbox key={idx} labelWidth={labelWidth} />
      ))}
    </div>
  </>
);

// New radio button skeleton variants

type SkeletonRadioProps = SkeletonCommonProps & {
  labelWidth?: string;
};

export const SkeletonRadio: React.FC<SkeletonRadioProps> = ({
  className,
  labelWidth = 'w-32',
}) => (
  <>
    <style>{shimmerKeyframes}</style>
    <div className={clsx('flex items-center gap-2', className)} aria-hidden="true">
      <div className={clsx(baseSkeleton, 'h-4 w-4 rounded-full')} /> {/* Radio button */}
      <SkeletonText width={labelWidth} height="h-4" /> {/* Label */}
    </div>
  </>
);

type SkeletonRadioGroupProps = SkeletonCommonProps & {
  items?: number;
  labelWidth?: string;
};

export const SkeletonRadioGroup: React.FC<SkeletonRadioGroupProps> = ({
  items = 3,
  labelWidth = 'w-32',
  className,
}) => (
  <>
    <style>{shimmerKeyframes}</style>
    <div className={clsx('space-y-2', className)} aria-hidden="true">
      {Array.from({ length: items }).map((_, idx) => (
        <SkeletonRadio key={idx} labelWidth={labelWidth} />
      ))}
    </div>
  </>
);

// New dropdown skeleton variants

type SkeletonDropdownProps = SkeletonCommonProps & {
  labelWidth?: string;
  dropdownWidth?: string;
};

export const SkeletonDropdown: React.FC<SkeletonDropdownProps> = ({
  className,
  labelWidth = 'w-24',
  dropdownWidth = 'w-full',
}) => (
  <>
    <style>{shimmerKeyframes}</style>
    <div className={clsx('space-y-1', className)} aria-hidden="true">
      <SkeletonText width={labelWidth} height="h-3" /> {/* Label */}
      <div className={clsx(baseSkeleton, dropdownWidth, 'h-10 rounded-md')} /> {/* Dropdown */}
    </div>
  </>
);

type SkeletonDropdownGroupProps = SkeletonCommonProps & {
  items?: number;
  labelWidth?: string;
  dropdownWidth?: string;
};

export const SkeletonDropdownGroup: React.FC<SkeletonDropdownGroupProps> = ({
  items = 3,
  labelWidth = 'w-24',
  dropdownWidth = 'w-full',
  className,
}) => (
  <>
    <style>{shimmerKeyframes}</style>
    <div className={clsx('space-y-4', className)} aria-hidden="true">
      {Array.from({ length: items }).map((_, idx) => (
        <SkeletonDropdown key={idx} labelWidth={labelWidth} dropdownWidth={dropdownWidth} />
      ))}
    </div>
  </>
);
