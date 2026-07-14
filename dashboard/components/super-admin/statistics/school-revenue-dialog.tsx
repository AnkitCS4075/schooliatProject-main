"use client";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { useSchoolRevenue, SchoolRevenueData } from "@/lib/hooks/use-super-admin";
import { IndianRupee } from "lucide-react";

interface SchoolRevenueDialogProps {
    schoolId: string;
    schoolName: string;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
}

const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
    }).format(amount);

export function SchoolRevenueDialog({
    schoolId,
    schoolName,
    isOpen,
    onOpenChange,
}: SchoolRevenueDialogProps) {
    const { data, isLoading, error } = useSchoolRevenue(isOpen ? schoolId : "");

    const revenueData = data?.data as SchoolRevenueData | undefined;

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Revenue Details — {schoolName}</DialogTitle>
                    <DialogDescription>
                        Year-wise revenue breakdown from receipts
                    </DialogDescription>
                </DialogHeader>

                {isLoading && (
                    <div className="flex items-center justify-center py-12">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                            <p className="mt-4 text-gray-600">Loading revenue data...</p>
                        </div>
                    </div>
                )}

                {error && (
                    <div className="py-8 text-center">
                        <p className="text-red-600">Failed to load revenue data</p>
                        <p className="text-sm text-gray-600 mt-2">
                            {(error as Error).message}
                        </p>
                    </div>
                )}

                {revenueData && (
                    <div className="space-y-6 py-2">
                        {/* Grand Total Card */}
                        <div
                            className="p-6 border rounded-lg"
                            style={{ backgroundColor: "#e8f5e9" }}
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Total Revenue</p>
                                    <p
                                        className="text-3xl font-bold mt-1"
                                        style={{ color: "var(--primary)" }}
                                    >
                                        {formatCurrency(revenueData.grandTotal)}
                                    </p>
                                </div>
                                <IndianRupee
                                    className="w-10 h-10"
                                    style={{ color: "var(--primary)" }}
                                />
                            </div>
                        </div>

                        {/* Yearly Breakdown Table */}
                        <div className="border rounded-lg overflow-hidden">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-schooliat-tint">
                                        <TableHead>Academic Year</TableHead>
                                        <TableHead className="text-right">Receipts</TableHead>
                                        <TableHead className="text-right">Base Amount</TableHead>
                                        <TableHead className="text-right">GST</TableHead>
                                        <TableHead className="text-right">Total Revenue</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {revenueData.yearly.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center py-8">
                                                No receipts found for this school
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        revenueData.yearly.map((year) => (
                                            <TableRow key={year.academicYear} className="hover:bg-gray-50">
                                                <TableCell className="font-semibold">
                                                    {year.academicYear}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {year.receiptCount}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {formatCurrency(year.totalBase)}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {formatCurrency(year.totalGst)}
                                                </TableCell>
                                                <TableCell className="text-right font-medium text-green-700">
                                                    {formatCurrency(year.totalRevenue)}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
