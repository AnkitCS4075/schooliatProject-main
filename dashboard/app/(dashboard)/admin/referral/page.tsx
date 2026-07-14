"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Copy,
  Share2,
  Users,
  Gift,
  CheckCircle,
  Info,
  QrCode,
  Mail,
  MessageSquare,
} from "lucide-react";
import { toast } from "sonner";
import { useMySchool } from "@/lib/hooks/use-my-school";

export default function ReferralPage() {
  const { data: school } = useMySchool();
  const [copied, setCopied] = useState(false);

  const schoolCode = school?.code || "SCHOOL";
  const referralCode = `REF-${schoolCode}`;
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
  const referralLink = `${baseUrl}/register?ref=${referralCode}`;

  const handleCopy = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success(`${label} copied to clipboard!`);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  };

  const handleShareWhatsApp = () => {
    const message = encodeURIComponent(
      `Join ${school?.name || "our school"} on SchooliAT! Use referral code: ${referralCode}\n\nRegister here: ${referralLink}`
    );
    window.open(`https://wa.me/?text=${message}`, "_blank");
  };

  const handleShareEmail = () => {
    const subject = encodeURIComponent(`Join ${school?.name || "Our School"} on SchooliAT`);
    const body = encodeURIComponent(
      `Hello,\n\nYou have been referred to join ${school?.name || "our school"} on SchooliAT - a complete school management platform.\n\nReferral Code: ${referralCode}\nRegistration Link: ${referralLink}\n\nRegards,\n${school?.name || "School Administration"}`
    );
    window.open(`mailto:?subject=${subject}&body=${body}`, "_self");
  };

  return (
    <div className="space-y-6 pb-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Referral Program</h1>
          <p className="text-sm text-gray-600 mt-1">
            Share your referral code to invite parents and grow your school community
          </p>
        </div>
        <Badge variant="outline" className="text-primary border-primary gap-1">
          <Gift className="h-3.5 w-3.5" />
          Active
        </Badge>
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Share your school&apos;s referral code with parents and guardians. When new families register using your
          referral code, both the referrer and the new family benefit from the SchooliAT referral program.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Referral Code Card */}
        <Card className="border-t-4 border-t-primary">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5 text-primary" />
              Your Referral Code
            </CardTitle>
            <CardDescription>
              Share this code with prospective parents for new admissions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex-1 relative">
                <Input
                  value={referralCode}
                  readOnly
                  className="text-lg font-bold text-center tracking-wider pr-12"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
                  onClick={() => handleCopy(referralCode, "Referral code")}
                >
                  {copied ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">Referral Link</p>
              <div className="flex items-center gap-2">
                <Input
                  value={referralLink}
                  readOnly
                  className="text-sm text-gray-600"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopy(referralLink, "Referral link")}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Share Options Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Share2 className="h-5 w-5 text-primary" />
              Share Via
            </CardTitle>
            <CardDescription>
              Quickly share your referral code through these channels
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              variant="outline"
              className="w-full justify-start gap-3 h-12"
              onClick={handleShareWhatsApp}
            >
              <MessageSquare className="h-5 w-5 text-green-600" />
              Share via WhatsApp
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start gap-3 h-12"
              onClick={handleShareEmail}
            >
              <Mail className="h-5 w-5 text-blue-600" />
              Share via Email
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start gap-3 h-12"
              onClick={() => handleCopy(referralLink, "Referral link")}
            >
              <Copy className="h-5 w-5 text-gray-600" />
              Copy Link to Clipboard
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* How It Works */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            How the Referral Program Works
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center space-y-3">
              <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <Share2 className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold">1. Share Code</h3>
              <p className="text-sm text-gray-600">
                Share your referral code or link with parents and guardians who may be interested in enrolling their children.
              </p>
            </div>
            <div className="text-center space-y-3">
              <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold">2. New Registration</h3>
              <p className="text-sm text-gray-600">
                When new families register using your referral code, they are linked to your school in the system.
              </p>
            </div>
            <div className="text-center space-y-3">
              <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <Gift className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold">3. Grow Together</h3>
              <p className="text-sm text-gray-600">
                Build your school community and help more families discover the benefits of the SchooliAT platform.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
