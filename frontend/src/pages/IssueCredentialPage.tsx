import React, { useState } from "react";
import { useEthereum } from "../contexts/EthereumContext";
import { Upload, Loader2 } from "lucide-react";
import { pinPDF } from "../lib/ipfs";
import { toast } from "sonner";

const IssueCredentialPage: React.FC = () => {
  const { contract, account, isIssuer } = useEthereum();
  const [title, setTitle] = useState("");
  const [student, setStudent] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) =>
    setFile(e.target.files?.[0] ?? null);

  const issue = async () => {
    if (!contract || !isIssuer) {
      toast.error("Connect with an issuer wallet");
      return;
    }
    if (!file || !title || !student) {
      toast.warning("Fill all fields & choose a PDF");
      return;
    }
    try {
      setLoading(true);
      toast.info("Uploading PDF to IPFS…");
      const uri = await pinPDF(file);

      toast.info("Minting NFT on‑chain…");
      const tx = await contract.issueCredential(student, uri);
      await tx.wait();

      toast.success(`Credential issued to ${student.slice(0, 6)}… 🎉`);
      setTitle(""); setStudent(""); setFile(null);
    } catch (err: any) {
      console.error(err);
      toast.error(err.reason ?? "Issue failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-16 shadow-card rounded-xl bg-white/60 backdrop-blur-md p-8 fade-in">
      <h1 className="text-2xl font-semibold mb-6 text-center">Issue Credential</h1>

      <input
        className="w-full mb-4 input"
        placeholder="Credential name (e.g. BSc Computer Science 2025)"
        value={title}
        onChange={e => setTitle(e.target.value)}
      />

      <input
        className="w-full mb-4 input"
        placeholder="Student wallet address"
        value={student}
        onChange={e => setStudent(e.target.value)}
      />

      {/* dropzone ‑‑ keeps same look on drag / click */}
      <label className="flex flex-col items-center justify-center gap-2 mb-6 border-2 border-dashed rounded-lg py-10 text-slate-500 hover:bg-slate-50 transition-colors cursor-pointer">
        <Upload className="w-8 h-8" />
        {file ? (
          <span className="font-medium text-slate-700">{file.name}</span>
        ) : (
          <>
            <span className="text-sm">Drag & drop a PDF or <span className="underline">browse</span></span>
            <span className="text-xs text-slate-400">Max 10 MB</span>
          </>
        )}
        <input type="file" accept="application/pdf" className="hidden" onChange={handleFile} />
      </label>

      <button
        disabled={loading}
        onClick={issue}
        className="btn-primary w-full flex items-center justify-center"
      >
        {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
        Issue
      </button>

      {!isIssuer && account && (
        <p className="text-center text-xs mt-4 text-rose-500">
          You are not an authorised issuer.
        </p>
      )}
    </div>
  );
};

export default IssueCredentialPage;
