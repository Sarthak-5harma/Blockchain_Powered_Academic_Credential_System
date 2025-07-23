import React, { useEffect, useState } from "react";
import { useEthereum } from "../contexts/EthereumContext";
import { toast } from "sonner";

interface Row { id: string; title: string; student: string }

const RevokeCredentialPage: React.FC = () => {
  const { contract, account, isIssuer } = useEthereum();
  const [tokenId, setTokenId] = useState("");
  const [searchAddr, setSearchAddr] = useState("");
  const [rows, setRows] = useState<Row[]>([]);

  // fetch tokens issued by this issuer (optionally filtered)
  const load = async () => {
    if (!contract || !isIssuer) return;
    const logs = await contract.queryFilter(contract.filters.CredentialIssued());
    const mine = logs.filter(l => l.args?.issuer.toLowerCase() === account!.toLowerCase());

    const list: Row[] = [];
    for (const l of mine) {
      const id = l.args?.tokenId.toString();
      try {
        const meta = await contract.credentialMeta(id);
        if (searchAddr && meta.student.toLowerCase() !== searchAddr.toLowerCase()) continue;
        list.push({ id, student: meta.student, title: meta.title });
      } catch {/* ignore revoked */}
    }
    setRows(list.reverse());
  };
  useEffect(() => { load(); }, [contract, isIssuer]);

  const revoke = async () => {
    if (!contract || !isIssuer) return;
    try {
      toast.info("Revoking credential…");
      const tx = await contract.revokeCredential(tokenId);
      await tx.wait();
      toast.success("Credential revoked");
      setTokenId("");
      load();
    } catch (e: any) {
      toast.error(e.reason ?? "Revoke failed");
    }
  };

  return (
    <div className="max-w-3xl mx-auto mt-12 fade-in">
      {/* revoke box */}
      <div className="shadow-card bg-white/60 rounded-xl backdrop-blur-md p-8 mb-10">
        <h1 className="text-xl font-semibold mb-6 text-center">Revoke Credential</h1>
        <input className="input mb-4" placeholder="Token ID to revoke"
          value={tokenId} onChange={e => setTokenId(e.target.value)} />
        <button className="btn-danger w-full" onClick={revoke}>Revoke</button>
      </div>

      {/* table */}
      <h2 className="text-lg font-semibold mb-4">Tokens You Issued</h2>
      <div className="flex items-center gap-2 mb-4">
        <input className="input flex-1" placeholder="Student address (optional)"
          value={searchAddr} onChange={e => setSearchAddr(e.target.value)} />
        <button className="btn-primary" onClick={load}>Search</button>
        <button className="underline text-sm" onClick={() => { setSearchAddr(""); load(); }}>Clear</button>
      </div>

      {rows.length === 0 ? (
        <p className="text-slate-500">No issued credentials found.</p>
      ) : (
        <table className="w-full text-sm bg-white/70 rounded-md overflow-hidden">
          <thead className="bg-slate-100/60">
            <tr className="text-left">
              <th className="px-4 py-2">TokenID</th>
              <th className="px-4 py-2">Student</th>
              <th className="px-4 py-2">Title</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.id} className="hover:bg-slate-50">
                <td className="px-4 py-2">{r.id}</td>
                <td className="px-4 py-2 truncate max-w-[160px]">{r.student.slice(0, 6)}…{r.student.slice(-4)}</td>
                <td className="px-4 py-2">{r.title}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default RevokeCredentialPage;
