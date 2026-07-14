"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileUp, Download, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { buildCsvDocument, triggerCsvDownload } from "@/lib/bulk-upload/school-csv-templates";

interface BulkUploadDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    description: string;
    onUpload: (csvData: string) => Promise<any>;
    templateHeaders: string[];
    templateFilename: string;
    /** One example data row (same order as headers); included in the downloaded CSV. */
    templateSampleRow?: string[];
}

export function BulkUploadDialog({
    open,
    onOpenChange,
    title,
    description,
    onUpload,
    templateHeaders,
    templateFilename,
    templateSampleRow,
}: BulkUploadDialogProps) {
    const [file, setFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [results, setResults] = useState<any>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setResults(null);
        }
    };

    const handleDownloadTemplate = () => {
        const csvContent = buildCsvDocument(
            templateHeaders,
            templateSampleRow ? [templateSampleRow] : [],
        );
        triggerCsvDownload(templateFilename, csvContent);
    };

    const handleUpload = async () => {
        if (!file) return;

        setIsUploading(true);
        setResults(null);

        try {
            const reader = new FileReader();
            reader.onerror = () => {
                toast.error("Could not read the file. Try saving the CSV as UTF-8 and upload again.");
                setIsUploading(false);
            };
            reader.onload = async (e) => {
                const text = e.target?.result as string;
                try {
                    const response = await onUpload(text);
                    const data = response?.data;
                    setResults(data ?? null);
                    if (data && typeof data.success === "number" && typeof data.failed === "number") {
                        if (data.failed > 0 && data.success === 0) {
                            toast.error(
                                data.failed === 1
                                    ? "Bulk upload failed for that row."
                                    : `Bulk upload failed for all ${data.failed} rows.`,
                            );
                        } else if (data.failed > 0) {
                            toast.warning(`${data.success} row(s) succeeded, ${data.failed} failed.`);
                        } else {
                            toast.success("Bulk upload completed.");
                        }
                    } else {
                        toast.success("Bulk upload completed.");
                    }
                } catch (error: any) {
                    toast.error(error?.message || "Upload failed");
                } finally {
                    setIsUploading(false);
                }
            };
            reader.readAsText(file, "UTF-8");
        } catch (error: any) {
            toast.error("Failed to read file");
            setIsUploading(false);
        }
    };

    const reset = () => {
        setFile(null);
        setResults(null);
        setIsUploading(false);
    };

    return (
        <Dialog open={open} onOpenChange={(openNext: boolean) => {
            onOpenChange(openNext);
            if (!openNext) reset();
        }}>
            <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4 flex-1 overflow-hidden flex flex-col">
                    <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border border-dashed text-sm">
                        <div className="space-y-1">
                            <p className="font-medium">Need a sample file?</p>
                            <p className="text-muted-foreground">
                                Download CSV with headers and one example row matching the upload format.
                            </p>
                        </div>
                        <Button variant="outline" size="sm" onClick={handleDownloadTemplate} className="gap-2">
                            <Download className="h-4 w-4" />
                            Download sample
                        </Button>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="csv-file">Select CSV File</Label>
                        <div className="flex gap-2">
                            <Input
                                id="csv-file"
                                type="file"
                                accept=".csv"
                                onChange={handleFileChange}
                                disabled={isUploading}
                                className="cursor-pointer"
                            />
                            <Button
                                onClick={handleUpload}
                                disabled={!file || isUploading}
                                className="gap-2 shrink-0"
                            >
                                {isUploading ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <FileUp className="h-4 w-4" />
                                )}
                                Upload
                            </Button>
                        </div>
                    </div>

                    {results && (
                        <div className="space-y-3 flex-1 overflow-hidden flex flex-col border rounded-lg p-4 bg-muted/20">
                            <div className="flex gap-4">
                                <div className="flex items-center gap-2 text-green-600 font-medium">
                                    <CheckCircle2 className="h-4 w-4" />
                                    <span>{results.success} Succeeded</span>
                                </div>
                                <div className="flex items-center gap-2 text-red-600 font-medium">
                                    <XCircle className="h-4 w-4" />
                                    <span>{results.failed} Failed</span>
                                </div>
                            </div>

                            {results.errors.length > 0 && (
                                <div className="flex-1 overflow-hidden flex flex-col gap-2">
                                    <p className="text-sm font-medium">Errors Summary:</p>
                                    <ScrollArea className="flex-1 bg-white rounded border">
                                        <div className="p-3 space-y-2">
                                            {results.errors.map((err: any, idx: number) => (
                                                <div key={idx} className="text-xs p-2 bg-red-50 rounded border border-red-100 flex gap-2">
                                                    <span className="font-semibold">{err.row}:</span>
                                                    <span className="text-red-700">{err.error}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </ScrollArea>
                                </div>
                            )}

                            {Array.isArray(results.credentials) && results.credentials.length > 0 && (
                                <div className="flex-1 overflow-hidden flex flex-col gap-2 border-t pt-3">
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                        <p className="text-sm font-medium">Mobile app login (one-time)</p>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            className="gap-1 shrink-0"
                                            onClick={() => {
                                                const creds = results.credentials as {
                                                    email: string;
                                                    publicUserId: string;
                                                    password: string;
                                                }[];
                                                const esc = (v: string) =>
                                                    `"${String(v).replace(/"/g, '""')}"`;
                                                const lines = creds.map((c) =>
                                                    [esc(c.email), esc(c.publicUserId), esc(c.password)].join(","),
                                                );
                                                const csv = ["Email,LoginId,Password", ...lines].join("\n");
                                                const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
                                                const url = URL.createObjectURL(blob);
                                                const a = document.createElement("a");
                                                a.href = url;
                                                a.download = "teacher_login_credentials.csv";
                                                a.click();
                                                URL.revokeObjectURL(url);
                                                toast.success("Credentials CSV downloaded");
                                            }}
                                        >
                                            <Download className="h-4 w-4" />
                                            Download CSV
                                        </Button>
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        Use email or Login ID with password; app header{" "}
                                        <span className="font-mono">x-platform: android</span> or{" "}
                                        <span className="font-mono">ios</span>. Save now — passwords are not shown again.
                                    </p>
                                    <ScrollArea className="max-h-52 bg-white rounded border">
                                        <div className="p-3 space-y-2 text-xs font-mono">
                                            {(results.credentials as { email: string; publicUserId: string; password: string }[]).map(
                                                (c, idx) => (
                                                    <div
                                                        key={`${c.email}-${idx}`}
                                                        className="p-2 rounded border bg-muted/30 space-y-1"
                                                    >
                                                        <div>
                                                            <span className="text-muted-foreground">Email </span>
                                                            {c.email}
                                                        </div>
                                                        <div>
                                                            <span className="text-muted-foreground">ID </span>
                                                            {c.publicUserId}
                                                        </div>
                                                        <div>
                                                            <span className="text-muted-foreground">Pass </span>
                                                            {c.password}
                                                        </div>
                                                    </div>
                                                ),
                                            )}
                                        </div>
                                    </ScrollArea>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isUploading}>
                        {results ? "Close" : "Cancel"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
