"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BASE_URL } from "@/lib/api/client";
import { AlertCircle, CheckCircle2, Loader2, FileText, Building2, ShieldCheck } from "lucide-react";

interface ContractData {
  onboardingId: string;
  schoolName: string;
  pointOfContactName?: string | null;
  concernedEmail: string;
  status: string;
  contractStatus?: string | null;
  contractAccepted: boolean;
  contractAcceptedAt?: string | null;
  acceptedByEmail?: string | null;
  acceptedByIp?: string | null;
  contractHtml: string;
}

function ContractAcceptContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [loading, setLoading] = useState(() => !token);
  const [error, setError] = useState(() =>
    token ? "" : "Missing contract token. Please use the link from your email.",
  );
  const [contract, setContract] = useState<ContractData | null>(null);
  const [accepting, setAccepting] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [acceptError, setAcceptError] = useState("");
  const [confirmEmail, setConfirmEmail] = useState("");
  const [confirmName, setConfirmName] = useState("");

  useEffect(() => {
    if (!token) return;

    const base = BASE_URL.endsWith("/") ? BASE_URL.slice(0, -1) : BASE_URL;
    fetch(`${base}/api/v1/public/contracts/${encodeURIComponent(token)}`, {
      headers: { "x-platform": "web" },
    })
      .then(async (res) => {
        const json = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(json?.message || "Contract not found");
        }
        return json;
      })
      .then((json) => {
        const d = json?.data;
        setContract(d);
        setConfirmEmail(d?.concernedEmail || "");
        if (d?.contractAccepted) {
          setAccepted(true);
        }
        setLoading(false);
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "Failed to load contract");
        setLoading(false);
      });
  }, [token]);

  const handleAccept = async () => {
    setAcceptError("");
    const base = BASE_URL.endsWith("/") ? BASE_URL.slice(0, -1) : BASE_URL;
    setAccepting(true);
    try {
      const res = await fetch(
        `${base}/api/v1/public/contracts/${encodeURIComponent(token)}/accept`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-platform": "web" },
          body: JSON.stringify({
            request: { email: confirmEmail, name: confirmName },
          }),
        },
      );
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(json?.message || "Failed to accept contract");
      }
      setAccepted(true);
    } catch (err: unknown) {
      setAcceptError(
        err instanceof Error ? err.message : "Failed to accept contract. Please try again.",
      );
    } finally {
      setAccepting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 p-4">
        <Card className="w-full max-w-md shadow-lg border-0">
          <CardContent className="py-10 text-center">
            <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading your service contract...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !contract) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 p-4">
        <Card className="w-full max-w-md shadow-lg border-0">
          <CardHeader className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-red-500" />
              </div>
            </div>
            <CardTitle className="text-2xl">Contract Not Found</CardTitle>
            <CardDescription>{error || "This link may be invalid or expired."}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Please use the link sent to you in the onboarding email, or contact the SchooliAT team.
            </p>
            <Button asChild className="w-full">
              <Link href="/login">Go to Login</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (accepted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 p-4">
        <Card className="w-full max-w-md shadow-lg border-0">
          <CardHeader className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
            </div>
            <CardTitle className="text-2xl">Contract Accepted 🎉</CardTitle>
            <CardDescription>
              Thank you for accepting the service contract for{" "}
              <strong>{contract.schoolName}</strong>.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {contract.contractAcceptedAt && (
              <div className="text-sm text-muted-foreground space-y-1 border rounded-lg p-3 bg-white">
                <p>
                  <strong>Accepted on:</strong>{" "}
                  {new Date(contract.contractAcceptedAt).toLocaleString("en-IN")}
                </p>
                {contract.acceptedByEmail && (
                  <p>
                    <strong>Accepted by:</strong> {contract.acceptedByEmail}
                  </p>
                )}
                {contract.acceptedByIp && (
                  <p>
                    <strong>IP address:</strong> {contract.acceptedByIp}
                  </p>
                )}
              </div>
            )}
            <p className="text-sm text-muted-foreground">
              The SchooliAT team has been notified and will{" "}
              <strong>activate your school ID</strong> shortly. You will receive a
              confirmation email with your login credentials once your account is
              active.
            </p>
            <Button asChild className="w-full">
              <Link href="/login">Go to Login</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const pending = contract.status === "CONTRACT_SENT" && !contract.contractAccepted;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 py-10 px-4">
      <div className="max-w-4xl mx-auto space-y-4">
        <Card className="shadow-lg border-0">
          <CardHeader className="text-center space-y-3">
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <ShieldCheck className="w-8 h-8 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl">
              SchooliAT Service Contract — {contract.schoolName}
            </CardTitle>
            <CardDescription className="flex items-center justify-center gap-2">
              <Building2 className="w-4 h-4" /> Please review the agreement below and
              accept it to complete your onboarding.
            </CardDescription>
          </CardHeader>
        </Card>

        <div className="border rounded-lg bg-white shadow overflow-auto max-h-[70vh] p-6">
          <div dangerouslySetInnerHTML={{ __html: contract.contractHtml }} />
        </div>

        {pending && (
          <Card className="shadow-lg border-0">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-start gap-2 text-sm text-muted-foreground">
                <FileText className="w-4 h-4 mt-0.5" />
                <p>
                  By clicking <strong>I Accept</strong> you digitally sign this
                  agreement on behalf of <strong>{contract.schoolName}</strong>. Your
                  acceptance (email, IP address and time) is recorded and stored.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label>Accepting on behalf of (name)</Label>
                  <Input
                    placeholder="e.g. Principal / Director"
                    value={confirmName}
                    onChange={(e) => setConfirmName(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label>Confirm email</Label>
                  <Input
                    type="email"
                    value={confirmEmail}
                    onChange={(e) => setConfirmEmail(e.target.value)}
                  />
                </div>
              </div>
              {acceptError && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" /> {acceptError}
                </p>
              )}
              <Button
                onClick={handleAccept}
                disabled={accepting || !confirmEmail}
                className="w-full"
              >
                {accepting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" /> Accepting...
                  </>
                ) : (
                  "I Accept — Digitally Sign Contract"
                )}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

export default function ContractAcceptPage() {
  return (
    <Suspense fallback={null}>
      <ContractAcceptContent />
    </Suspense>
  );
}
