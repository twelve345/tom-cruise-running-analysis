import React from 'react';
import { animated, useSpring } from '@react-spring/web';

interface AnimatedBarProps {
  x: number;
  y: number;
  width: number;
  height: number;
  fill: string;
  delay?: number;
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
  onMouseEnter,
  onMouseLeave,
}) => {
  const spring = useSpring({
    from: { height: 0, y: y + height },
    to: { height, y },
    delay,
    config: { tension: 120, friction: 14 },
  });

  return (
    <animated.rect
      x={x}
      width={width}
      fill={fill}
      style={spring}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    />
  );
};
