import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useEthereum } from '../contexts/EthereumContext';
import Card from '../components/ui/Card';

const VerifyPage:React.FC = () => {
  const { contract } = useEthereum();
  const { tokenId }  = useParams();
  const [q] = useSearchParams();
  const expectedOwner = (q.get('owner')||'').toLowerCase();

  const [status,setStatus]   = useState('Checking…');
  const [title,setTitle]     = useState<string|null>(null);
  const [issuer,setIssuer]   = useState<{addr:string,name:string}|null>(null);

  useEffect(()=>{
    const run=async()=>{
      if(!contract){setStatus('Connect wallet');return;}
      try{
        const [owner,iss,title] = await Promise.all([
          contract.ownerOf(tokenId),
          contract.credentialIssuer(tokenId),
          contract.certificateTitle(tokenId)
        ]);
        const uniName = await contract.universityNames(iss);
        setTitle(title); setIssuer({addr:iss,name:uniName});
        const ok = expectedOwner? owner.toLowerCase()===expectedOwner : true;
        setStatus(ok?'✅ Credential VALID':'❌ Owner mismatch / revoked');
      }catch{ setStatus('❌ Invalid or revoked');}
    };
    if(tokenId) run();
  },[contract,tokenId,expectedOwner]);

  return(
    <Card className="mx-auto max-w-lg fade-in text-center space-y-2">
      <h2 className="text-2xl font-semibold">{status}</h2>
      <p>Token ID: <code>{tokenId}</code></p>
      {title && <p>Title: <strong>{title}</strong></p>}
      {issuer && (
        <p>
          Issuer: <strong>{issuer.name||'(unnamed)'}</strong>
          &nbsp;<code>{issuer.addr.slice(0,6)}…</code>
        </p>
      )}
      {expectedOwner && <p>Expected owner: <code>{expectedOwner.slice(0,6)}…</code></p>}
    </Card>
  );
};
export default VerifyPage;
