import React from 'react';
import { useEthereum } from '../contexts/EthereumContext';

const ConnectWallet: React.FC = () => {
  const { account, connectWallet } = useEthereum();

  const handleConnect = async () => {
    // Trigger wallet connection
    await connectWallet();
  };

  if (!account) {
    // Show connect button if no account connected
    return <button onClick={handleConnect}>Connect Wallet</button>;
  }

  // If connected, display a shortened wallet address
  const shortAddress = account.substring(0, 6) + '...' + account.substring(account.length - 4);
  return <span>Connected: {shortAddress}</span>;
};

export default ConnectWallet;
