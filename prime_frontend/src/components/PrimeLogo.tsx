import React from 'react';
import { Logo } from './Logo';

export const PrimeLogo: React.FC<{ size?: number; className?: string }> = ({ size, className = "" }) => {
  return (
    <Logo size="md" className={className} />
  );
};
