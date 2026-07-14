"use client";

import { useParams, useRouter } from "next/navigation";
import { useTCById } from "@/lib/hooks/use-tc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
    FileDown,
    ArrowLeft,
    CheckCircle,
    XCircle,
    FileText,
    User,
    Calendar,
    School,
    Info
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { format } from "date-fns";
import { BASE_URL } from "@/lib/api/config";

export default function TCDetailPage() {
    const params = useParams();
    const router = useRouter();
    const tcId = params.id as string;
    const { data: tcResponse, isLoading } = useTCById(tcId);
    const tc = tcResponse?.data;

    const handleDownload = async () => {
        if (!tc) return;

        try {
            const token = window.sessionStorage.getItem("accessToken");
            const baseUrl = BASE_URL;
            const resp = await fetch(`${baseUrl}/transfer-certificates/${tc.id}/download`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "x-platform": "web",
                },
            });

            if (!resp.ok) throw new Error("Download failed");

            const blob = await resp.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `TC_${tc.tcNumber.replace(/\//g, "_")}.pdf`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            toast.success("Certificate downloaded successfully!");
        } catch (error: any) {
            toast.error(error?.message || "Failed to download certificate");
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "ISSUED":
                return <Badge className="bg-blue-100 text-blue-800">Issued</Badge>;
            case "COLLECTED":
                return <Badge className="bg-green-100 text-green-800">Collected</Badge>;
            case "CANCELLED":
                return <Badge variant="destructive">Cancelled</Badge>;
            default:
                return <Badge>{status}</Badge>;
        }
    };

    if (isLoading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-10 w-48" />
                <Card>
                    <CardHeader>
                        <Skeleton className="h-8 w-64" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (!tc) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
                <div className="bg-red-50 p-4 rounded-full mb-4">
                    <XCircle className="h-12 w-12 text-red-500" />
                </div>
                <h2 className="text-2xl font-semibold text-gray-900">TC Not Found</h2>
                <p className="text-gray-600 mt-2">The transfer certificate you are looking for does not exist or has been removed.</p>
                <Button
                    variant="outline"
                    className="mt-6"
                    onClick={() => router.push("/admin/students?tab=tc")}
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Students
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-8">
            <div className="flex items-center justify-between">
                <Button
                    variant="ghost"
                    className="gap-2"
                    onClick={() => router.push("/admin/students?tab=tc")}
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to TC List
                </Button>
                <div className="flex gap-2">
                    {tc.status !== "CANCELLED" && (
                        <Button onClick={handleDownload} className="gap-2">
                            <FileDown className="h-4 w-4" />
                            Download PDF
                        </Button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Certificate Details */}
                <div className="lg:col-span-2 space-y-6">
                    <Card className="border-t-4 border-t-primary">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-xl font-bold flex items-center gap-2">
                                <FileText className="h-5 w-5 text-primary" />
                                Certificate Overview
                            </CardTitle>
                            {getStatusBadge(tc.status)}
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                                <div className="space-y-1">
                                    <p className="text-sm text-gray-500">TC Number</p>
                                    <p className="font-semibold text-lg">{tc.tcNumber}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm text-gray-500">Date of Issue</p>
                                    <p className="font-semibold text-lg">
                                        {format(new Date(tc.createdAt), "PPP")}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm text-gray-500">Transfer Date</p>
                                    <p className="font-semibold text-lg">
                                        {format(new Date(tc.transferDate), "PPP")}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm text-gray-500">Leaving Reason</p>
                                    <p className="font-semibold">{tc.reason}</p>
                                </div>
                                {tc.destinationSchool && (
                                    <div className="space-y-1 col-span-2">
                                        <p className="text-sm text-gray-500">Destination School</p>
                                        <p className="font-semibold">{tc.destinationSchool}</p>
                                    </div>
                                )}
                                {tc.remarks && (
                                    <div className="space-y-1 col-span-2">
                                        <p className="text-sm text-gray-500">Remarks</p>
                                        <p className="font-semibold text-gray-700 italic">"{tc.remarks}"</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg font-bold flex items-center gap-2">
                                <Info className="h-5 w-5 text-primary" />
                                Print Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-blue-800 text-sm">
                                <p className="font-semibold mb-2">Notice for Printing:</p>
                                <ul className="list-disc list-inside space-y-1">
                                    <li>Ensure your printer is set to A4 paper size.</li>
                                    <li>Enable "Background Graphics" in print settings for the best result.</li>
                                    <li>Official certificates should be signed by the Principal and contain the school seal.</li>
                                </ul>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Student Sidebar */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg font-bold flex items-center gap-2">
                                <User className="h-5 w-5 text-primary" />
                                Student Profile
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="text-center pb-4 border-bottom">
                                <div className="h-20 w-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <User className="h-10 w-10 text-primary" />
                                </div>
                                <h3 className="font-bold text-lg">
                                    {tc.student.firstName} {tc.student.lastName}
                                </h3>
                                <p className="text-sm text-gray-500">
                                    {tc.student.studentProfile?.class?.grade || "N/A"}{" "}
                                    {tc.student.studentProfile?.class?.division || ""}
                                </p>
                            </div>

                            <div className="space-y-3 pt-2">
                                <div className="flex items-center gap-3 text-sm">
                                    <Calendar className="h-4 w-4 text-gray-400" />
                                    <div>
                                        <p className="text-gray-500">Date of Birth</p>
                                        <p className="font-medium">
                                            {tc.student.dateOfBirth ? format(new Date(tc.student.dateOfBirth), "PP") : "N/A"}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 text-sm">
                                    <School className="h-4 w-4 text-gray-400" />
                                    <div>
                                        <p className="text-gray-500">Admission No</p>
                                        <p className="font-medium">{tc.student.studentProfile?.admissionNumber || "N/A"}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 text-sm">
                                    <User className="h-4 w-4 text-gray-400" />
                                    <div>
                                        <p className="text-gray-500">Father's Name</p>
                                        <p className="font-medium">{tc.student.studentProfile?.fatherName || "N/A"}</p>
                                    </div>
                                </div>
                            </div>

                            <Button
                                variant="outline"
                                className="w-full mt-4"
                                onClick={() => router.push(`/admin/students/${tc.student.id}`)}
                            >
                                View Full Profile
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
