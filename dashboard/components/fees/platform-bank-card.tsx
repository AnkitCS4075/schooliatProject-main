"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Building2, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePlatformBank } from "@/lib/hooks/use-settings";
import { useState } from "react";

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleCopy} title="Copy">
      {copied ? <Check className="h-3 w-3 text-green-600" /> : <Copy className="h-3 w-3" />}
    </Button>
  );
}

interface PlatformBankData {
  bankName?: string;
  accountNumber?: string;
  ifscCode?: string;
  branchName?: string;
  upiId?: string;
  companyName?: string;
}

export function PlatformBankCard() {
  const { data: bank, isLoading } = usePlatformBank() as { data?: PlatformBankData; isLoading: boolean };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Pay SchooliAT
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    );
  }

  const hasBank =
    bank &&
    (bank.bankName || bank.accountNumber || bank.ifscCode || bank.branchName || bank.upiId);

  if (!hasBank) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Platform Bank Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground italic">
            Platform bank details have not been configured by the administrator yet.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Pay SchooliAT {bank.companyName ? `– ${bank.companyName}` : ""}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 text-sm">
          {bank.bankName && (
            <div>
              <span className="text-muted-foreground">Bank: </span>
              <span className="font-medium">{bank.bankName}</span>
            </div>
          )}
          {bank.accountNumber && (
            <div className="flex items-center justify-between gap-2">
              <div>
                <span className="text-muted-foreground">A/C No: </span>
                <span className="font-mono font-medium">{bank.accountNumber}</span>
              </div>
              <CopyButton text={bank.accountNumber} />
            </div>
          )}
          {bank.ifscCode && (
            <div className="flex items-center justify-between gap-2">
              <div>
                <span className="text-muted-foreground">IFSC: </span>
                <span className="font-mono font-medium">{bank.ifscCode}</span>
              </div>
              <CopyButton text={bank.ifscCode} />
            </div>
          )}
          {bank.branchName && (
            <div>
              <span className="text-muted-foreground">Branch: </span>
              <span className="font-medium">{bank.branchName}</span>
            </div>
          )}
          {bank.upiId && (
            <div className="flex items-center justify-between gap-2">
              <div>
                <span className="text-muted-foreground">UPI: </span>
                <span className="font-mono font-medium">{bank.upiId}</span>
              </div>
              <CopyButton text={bank.upiId} />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
