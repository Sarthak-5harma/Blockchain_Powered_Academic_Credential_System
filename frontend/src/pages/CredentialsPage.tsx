import React, { useEffect, useState } from 'react';
import { BigNumber } from 'ethers';
import { useEthereum } from '../contexts/EthereumContext';
import Card   from '../components/ui/Card';
import Button from '../components/ui/Button';
import QrModal from '../components/QrModal';

interface Credential {
  tokenId: string;
  uri:     string;
  title:   string;
  uniName: string;
}

const ipfsToGW = (u:string)=> u.startsWith('ipfs://')
  ? `https://ipfs.io/ipfs/${u.slice(7)}` : u;

const CredentialsPage:React.FC = () => {
  const { contract, account } = useEthereum();

  const [myCreds, setMyCreds]           = useState<Credential[]>([]);
  const [loadingMine, setLoadingMine]   = useState(false);

  const [addr,setAddr]                  = useState('');
  const [otherCreds,setOtherCreds]      = useState<Credential[]>([]);
  const [loadingOther,setLoadingOther]  = useState(false);
  const [err,setErr]                    = useState('');

  const [qrUrl,setQrUrl]                = useState<string|null>(null);

  /* helper to fetch all creds for an owner */
  const fetchAll = async(owner:string):Promise<Credential[]>=>{
    if(!contract) return [];
    const bal:BigNumber = await contract.balanceOf(owner);
    const total = bal.toNumber();
    const out:Credential[] = [];
    for(let i=0;i<total;i++){
      const idBN:BigNumber = await contract.tokenOfOwnerByIndex(owner,i);
      const id              = idBN.toString();
      try{
        const [uri,issuer,title] = await Promise.all([
          contract.tokenURI(id),
          contract.credentialIssuer(id),
          contract.certificateTitle(id)
        ]);
        const uni = await contract.universityNames(issuer);
        out.push({tokenId:id,uri,title,uniName:uni});
      }catch{ /* revoked */ }
    }
    return out;
  };

  /* auto‑load mine */
  useEffect(()=>{
    if(!contract||!account){setMyCreds([]);return;}
    setLoadingMine(true);
    fetchAll(account).then(setMyCreds).finally(()=>setLoadingMine(false));
  },[contract,account]);

  /* search others */
  const handleSearch=async()=>{
    if(!addr){setErr('Enter address');return;}
    setErr(''); setLoadingOther(true);
    fetchAll(addr).then(setOtherCreds)
                  .catch(()=>setErr('Fetch failed'))
                  .finally(()=>setLoadingOther(false));
  };

  /* table component */
  const Table:React.FC<{list:Credential[],owner:string}> = ({list,owner})=>(
    <table className="w-full text-sm border">
      <thead className="bg-gray-100 text-left">
        <tr>
          <th className="px-2 py-1">ID</th>
          <th className="px-2 py-1">Title</th>
          <th className="px-2 py-1">University</th>
          <th className="px-2 py-1">Doc</th>
          <th className="px-2 py-1"> </th>
        </tr>
      </thead>
      <tbody>
        {list.map(c=>(
          <tr key={c.tokenId} className="border-t">
            <td className="px-2 py-1">{c.tokenId}</td>
            <td className="px-2 py-1">{c.title}</td>
            <td className="px-2 py-1">{c.uniName}</td>
            <td className="px-2 py-1">
              <a href={ipfsToGW(c.uri)} target="_blank" rel="noreferrer"
                 className="text-brand-600 hover:underline">View</a>
            </td>
            <td className="px-2 py-1">
              <Button variant="ghost" onClick={()=>
                setQrUrl(`${location.origin}/verify/${c.tokenId}?owner=${owner}`)}>
                QR
              </Button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  return(
    <div className="space-y-12 fade-in">
      {/* ----- My creds ----- */}
      <Card>
        <h2 className="text-xl font-semibold mb-4">My Credentials</h2>
        {!account ? <p>Connect wallet.</p> :
         loadingMine ? <p>Loading…</p> :
         myCreds.length===0 ? <p>No credentials found.</p> :
         <Table list={myCreds} owner={account}/>}
      </Card>

      {/* ----- Search section ----- */}
      <Card>
        <h2 className="text-xl font-semibold mb-4">Search Another Address</h2>
        <div className="flex gap-2 mb-4">
          <input className="flex-1 border rounded px-3 py-2"
                 value={addr} onChange={e=>setAddr(e.target.value.trim())}
                 placeholder="0xABC…" />
          <Button onClick={handleSearch} disabled={loadingOther}>
            {loadingOther?'Loading…':'Search'}
          </Button>
        </div>
        {err && <p className="text-red-600 mb-3">{err}</p>}
        {otherCreds.length>0 && !err && <Table list={otherCreds} owner={addr}/>}
        {(!loadingOther && otherCreds.length===0 && addr && !err) &&
          <p>No credentials found.</p>}
      </Card>

      {qrUrl && <QrModal url={qrUrl} onClose={()=>setQrUrl(null)}/>}
    </div>
  );
};
export default CredentialsPage;
