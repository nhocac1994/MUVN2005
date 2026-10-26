'use client';

import React from 'react';
import { getMuClassIcon, getMuClassShort, getMuClassName } from '@/lib/mu-classes';

type ClassIconProps = {
  classId: number;
  size?: number;
  className?: string;
};

/** Hiển thị icon class (dw/dk/ef/mg/dl.png). Không có icon thì dùng badge chữ. */
export default function ClassIcon({ classId, size = 24, className }: ClassIconProps) {
  const icon = getMuClassIcon(classId);
  const short = getMuClassShort(classId);
  const title = getMuClassName(classId);

  if (icon) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={icon}
        alt={short}
        title={title}
        className={`we-class-icon${className ? ` ${className}` : ''}`}
        width={size}
        height={size}
        loading="lazy"
        decoding="async"
      />
    );
  }

  return (
    <span className={`we-class-badge${className ? ` ${className}` : ''}`} title={title}>
      {short}
    </span>
  );
}
