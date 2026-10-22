import React, { useEffect, useState } from 'react';

interface AnimatedBarProps {
  x: number;
  y: number;
  width: number;
  height: number;
  fill: string;
  delay?: number;
  isHorizontal?: boolean;
  onMouseEnter?: (event: React.MouseEvent<SVGRectElement>) => void;
  onMouseLeave?: (event: React.MouseEvent<SVGRectElement>) => void;
}

export const AnimatedBar: React.FC<AnimatedBarProps> = ({
  x,
  y,
  width,
  height,
  fill,
  delay = 0,
  isHorizontal = false,
  onMouseEnter,
  onMouseLeave,
}) => {
  // Initial state depends on orientation
  const getInitialState = () => {
    if (isHorizontal) {
      // Grow right: width 0, x constant
      return { width: 0, height, y, x };
    } else {
      // Grow up: height 0, y at bottom
      return { width, height: 0, y: y + height, x };
    }
  };

  const [style, setStyle] = useState(getInitialState());

  useEffect(() => {
    const timer = setTimeout(() => {
      setStyle({ width, height, y, x });
    }, delay);

    return () => clearTimeout(timer);
  }, [width, height, y, x, delay, isHorizontal]);

  return (
    <rect
      x={style.x}
      y={style.y}
      width={style.width}
      height={style.height}
      fill={fill}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className="transition-all duration-700 ease-out"
    />
  );
};
