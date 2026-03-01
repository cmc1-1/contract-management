"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";

interface ContractInfo {
  id: string;
  title: string;
  status: string;
  signedAt?: string;
  signerName?: string;
  counterpartyName?: string;
}

export default function SigningPage() {
  const { token } = useParams<{ token: string }>();
  const [info, setInfo] = useState<ContractInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [signerName, setSignerName] = useState("");
  const [signing, setSigning] = useState(false);
  const [signed, setSigned] = useState(false);

  useEffect(() => {
    fetch(`/api/sign/${token}`)
      .then((r) => {
        if (!r.ok) throw new Error("Invalid signing link");
        return r.json();
      })
      .then(setInfo)
      .catch((e) => setError(e.message));
  }, [token]);

  async function handleSign(e: React.FormEvent) {
    e.preventDefault();
    if (!signerName.trim()) return;
    setSigning(true);
    try {
      const res = await fetch(`/api/sign/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ signerName: signerName.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Signing failed");
        return;
      }
      setSigned(true);
    } finally {
      setSigning(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">
            Contract Manager
          </h1>
          <p className="text-sm text-gray-500 mt-1">Electronic Signature</p>
        </div>

        {error && (
          <div className="bg-white rounded-xl border border-red-200 p-6 text-center">
            <XCircle className="h-10 w-10 text-red-400 mx-auto mb-3" />
            <h2 className="font-semibold text-gray-900">Invalid Link</h2>
            <p className="text-sm text-gray-500 mt-1">{error}</p>
          </div>
        )}

        {!error && !info && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400 mx-auto" />
          </div>
        )}

        {info && info.status === "SIGNED" && !signed && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
            <CheckCircle2 className="h-10 w-10 text-green-500 mx-auto mb-3" />
            <h2 className="font-semibold text-gray-900">Already Signed</h2>
            <p className="text-sm text-gray-500 mt-1">
              This contract was signed by{" "}
              <span className="font-medium">{info.signerName}</span>.
            </p>
          </div>
        )}

        {signed && (
          <div className="bg-white rounded-xl border border-green-200 p-6 text-center">
            <CheckCircle2 className="h-10 w-10 text-green-500 mx-auto mb-3" />
            <h2 className="font-semibold text-gray-900">
              Contract Signed Successfully
            </h2>
            <p className="text-sm text-gray-500 mt-2">
              Thank you, <span className="font-medium">{signerName}</span>. Your
              signature has been recorded.
            </p>
          </div>
        )}

        {info && info.status === "SENT_FOR_SIGNING" && !signed && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="font-semibold text-gray-900 mb-1">
              {info.title}
            </h2>
            {info.counterpartyName && (
              <p className="text-sm text-gray-500 mb-4">
                For: {info.counterpartyName}
              </p>
            )}
            <p className="text-sm text-gray-600 mb-6">
              By signing below, you acknowledge that you have read and agree to
              the terms of this contract.
            </p>
            <form onSubmit={handleSign} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="signerName">Your Full Name</Label>
                <Input
                  id="signerName"
                  value={signerName}
                  onChange={(e) => setSignerName(e.target.value)}
                  placeholder="Type your full name to sign"
                  required
                  className="h-11"
                />
              </div>
              {signerName && (
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <p className="text-xs text-gray-500 mb-1">Signature preview</p>
                  <p className="font-serif text-2xl text-gray-900 italic">
                    {signerName}
                  </p>
                </div>
              )}
              <Button
                type="submit"
                className="w-full h-11"
                disabled={signing || !signerName.trim()}
              >
                {signing && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Sign Contract
              </Button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
