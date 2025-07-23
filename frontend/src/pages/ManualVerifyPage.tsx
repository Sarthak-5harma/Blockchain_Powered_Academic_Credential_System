import React, { useState } from "react";
import { useEthereum } from "../contexts/EthereumContext";
import { toast } from "sonner";

const ManualVerifyPage: React.FC = () => {
  const { contract } = useEthereum();
  const [tokenId, setTokenId] = useState("");
  const [student, setStudent] = useState("");
  const [university, setUniversity] = useState("");

  const verify = async () => {
    if (!contract) {
      toast.error("Connect wallet");
      return;
    }
    try {
      const owner  = await contract.ownerOf(tokenId);
      const issuer = await contract.credentialIssuer(tokenId);

      const okOwner  = owner.toLowerCase() === student.toLowerCase();
      const okIssuer = issuer.toLowerCase() === university.toLowerCase();

      if (okOwner && okIssuer) toast.success("✅ Credential is VALID");
      else toast.error("❌ Credential mismatch / revoked");
    } catch {
      toast.error("❌ Verification failed (token may be revoked)");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 fade-in">
      <div className="shadow-card bg-white/60 rounded-xl backdrop-blur-md p-8">
        <h1 className="text-xl font-semibold mb-6 text-center">Manual Verification</h1>

        <input className="input mb-4" placeholder="Token ID"
          value={tokenId} onChange={e => setTokenId(e.target.value)} />

        <input className="input mb-4" placeholder="Student address"
          value={student} onChange={e => setStudent(e.target.value)} />

        <input className="input mb-6" placeholder="University address"
          value={university} onChange={e => setUniversity(e.target.value)} />

        <button onClick={verify} className="btn-primary w-full">Verify</button>
      </div>
    </div>
  );
};

export default ManualVerifyPage;
