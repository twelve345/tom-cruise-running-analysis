import React from 'react';
import { ParentSize } from '@visx/responsive';

interface ChartWrapperProps {
  children: (size: { width: number; height: number }) => React.ReactNode;
  height?: number | string;
  className?: string;
  minHeight?: number;
}

export const ChartWrapper: React.FC<ChartWrapperProps> = ({
  children,
  height = 400,
  className = '',
  minHeight = 300,
}) => {
  return (
    <div
      className={`relative w-full overflow-hidden rounded-lg bg-slate-800/50 border border-slate-700/50 shadow-sm ${className}`}
      style={{ height, minHeight }}
    >
      <ParentSize debounceTime={10}>
        {({ width, height }) => (width > 0 && height > 0 ? children({ width, height }) : null)}
      </ParentSize>
    </div>
  );
};
