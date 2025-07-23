import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import ConnectWallet from './ConnectWallet';
import { useEthereum } from '../contexts/EthereumContext';

const NavItem:React.FC<{to:string}> = ({to,children}) => (
  <NavLink
    to={to}
    className={({isActive}) =>
      `px-3 py-2 rounded-md text-sm font-medium ${
        isActive ? 'bg-brand/10 text-brand-700' : 'hover:bg-surface-100'
      }`
    }
  >
    {children}
  </NavLink>
);

const Navbar:React.FC=()=>{
  const { isAdmin,isIssuer } = useEthereum();
  return(
    <nav className="bg-surface sticky top-0 z-20 shadow-sm ring-1 ring-slate-900/5">
      <div className="mx-auto max-w-6xl flex items-center justify-between px-4 py-2">
        <Link to="/" className="text-lg font-semibold">CredChain</Link>
        <div className="flex gap-1">
          <NavItem to="/view">View</NavItem>
          <NavItem to="/verify">Verify</NavItem>
          {(isIssuer||isAdmin)&&(
            <>
              <NavItem to="/issue">Issue</NavItem>
              <NavItem to="/revoke">Revoke</NavItem>
            </>
          )}
          {isAdmin&&<NavItem to="/universities">Universities</NavItem>}
        </div>
        <ConnectWallet/>
      </div>
    </nav>
  );
};
export default Navbar;
