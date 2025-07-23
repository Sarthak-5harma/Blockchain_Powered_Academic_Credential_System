import React from 'react';
import clsx from 'clsx';

type Variant = 'primary' | 'danger' | 'ghost';
const style: Record<Variant,string> = {
  primary: 'bg-brand text-white hover:bg-brand-700',
  danger:  'bg-danger text-white hover:bg-danger-700',
  ghost:   'bg-transparent hover:bg-surface-100',
};

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement>{
  variant?: Variant;
}
const Button:React.FC<Props>=({variant='primary',className,...rest})=>(
  <button
    {...rest}
    className={clsx(
      'px-4 py-2 rounded-md font-medium transition-all duration-150',
      'hover:shadow-md active:scale-[.97]', style[variant], className
    )}
  />
);
export default Button;
