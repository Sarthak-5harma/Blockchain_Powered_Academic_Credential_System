import React from 'react';
import clsx from 'clsx';

/** glassy white container */
const Card:React.FC<React.HTMLAttributes<HTMLDivElement>>=({className,...rest})=>(
  <div
    {...rest}
    className={clsx(
      'rounded-xl bg-surface/80 backdrop-blur-xs shadow-card ring-1 ring-slate-900/5',
      'p-6', className
    )}
  />
);
export default Card;
