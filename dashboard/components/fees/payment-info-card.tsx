"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Building2, CreditCard, Smartphone, QrCode, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMySchool } from "@/lib/hooks/use-my-school";
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

export function PaymentInfoCard() {
    const { data: school, isLoading } = useMySchool();

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <CreditCard className="h-5 w-5" />
                        Payment Information
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-32 w-full" />
                </CardContent>
            </Card>
        );
    }

    const hasBankDetails = school?.bankName || school?.bankAccountNumber;
    const hasUpi = school?.upiId;

    if (!hasBankDetails && !hasUpi) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <CreditCard className="h-5 w-5" />
                        Payment Information
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">
                        No payment details configured. Go to{" "}
                        <a href="/admin/settings" className="text-primary underline">
                            Settings → General
                        </a>{" "}
                        to add bank details and UPI ID.
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Payment Information for Manual Payments
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Bank Details */}
                    {hasBankDetails && (
                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <Building2 className="h-4 w-4 text-muted-foreground" />
                                <h4 className="text-sm font-semibold">Bank Transfer</h4>
                            </div>
                            <div className="space-y-2 text-sm">
                                {school.bankName && (
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <span className="text-muted-foreground">Bank: </span>
                                            <span className="font-medium">{school.bankName}</span>
                                        </div>
                                    </div>
                                )}
                                {school.bankAccountNumber && (
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <span className="text-muted-foreground">A/C No: </span>
                                            <span className="font-mono font-medium">{school.bankAccountNumber}</span>
                                        </div>
                                        <CopyButton text={school.bankAccountNumber} />
                                    </div>
                                )}
                                {school.bankIfscCode && (
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <span className="text-muted-foreground">IFSC: </span>
                                            <span className="font-mono font-medium">{school.bankIfscCode}</span>
                                        </div>
                                        <CopyButton text={school.bankIfscCode} />
                                    </div>
                                )}
                                {school.bankBranchName && (
                                    <div>
                                        <span className="text-muted-foreground">Branch: </span>
                                        <span className="font-medium">{school.bankBranchName}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* UPI */}
                    {hasUpi && (
                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <Smartphone className="h-4 w-4 text-muted-foreground" />
                                <h4 className="text-sm font-semibold">UPI Payment</h4>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <Badge variant="outline" className="font-mono text-sm px-3 py-1">
                                    {school.upiId}
                                </Badge>
                                <CopyButton text={school.upiId!} />
                            </div>
                        </div>
                    )}

                    {/* QR Code */}
                    {hasUpi && (
                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <QrCode className="h-4 w-4 text-muted-foreground" />
                                <h4 className="text-sm font-semibold">Scan to Pay</h4>
                            </div>
                            <div className="flex items-center justify-center p-3 bg-white rounded-lg border">
                                <img
                                    src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=upi://pay?pa=${encodeURIComponent(school.upiId!)}&pn=${encodeURIComponent(school.name || "School")}`}
                                    alt="UPI QR Code"
                                    className="h-[150px] w-[150px]"
                                />
                            </div>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
