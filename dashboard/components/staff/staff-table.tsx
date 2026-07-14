"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Edit, Trash2, Key, Plus, Eye } from "lucide-react";
import { cn } from "@/lib/utils";

const STAFF_COLUMNS = [
    { key: "no", title: "No", width: "w-16" },
    { key: "staff", title: "Staff Member", width: "w-64" },
    { key: "email", title: "Email", width: "w-64" },
    { key: "contact", title: "Contact", width: "w-40" },
    { key: "gender", title: "Gender", width: "w-28" },
    { key: "action", title: "Action", width: "w-32" },
];

interface StaffTableProps {
    staff: any[];
    onAddNew: () => void;
    onEdit: (staffMember: any) => void;
    onDelete: (staffId: string) => void;
    onBulkDelete: (ids: string[]) => void;
    page: number;
    onPageChange: (page: number) => void;
    serverTotalPages: number;
    loading: boolean;
    onRefresh: () => void;
}

// Format phone number for display
const formatPhoneNumber = (phone: string | null | undefined): string => {
    if (!phone) return "N/A";
    const cleaned = phone.replace(/\D/g, "");
    if (cleaned.length === 10) {
        return `${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
    }
    return phone;
};

// Get initials for avatar fallback
const getInitials = (firstName: string, lastName?: string): string => {
    const first = firstName?.charAt(0)?.toUpperCase() || "";
    const last = lastName?.charAt(0)?.toUpperCase() || "";
    return `${first}${last}` || "S";
};

import { PasswordResetModal } from "../students/password-reset-modal";

export function StaffTable({
    staff,
    onAddNew,
    onEdit,
    onDelete,
    onBulkDelete,
    page,
    onPageChange,
    serverTotalPages,
    loading,
}: StaffTableProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
    const [passwordResetVisible, setPasswordResetVisible] = useState(false);
    const [resetStaff, setResetStaff] = useState<any>(null);

    // Search filter
    const filteredStaff = searchQuery.trim()
        ? staff.filter(s =>
            `${s.firstName} ${s.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.email?.toLowerCase().includes(searchQuery.toLowerCase())
        )
        : staff;

    const toggleRowSelection = (staffId: string) => {
        const newSelected = new Set(selectedRows);
        if (newSelected.has(staffId)) {
            newSelected.delete(staffId);
        } else {
            newSelected.add(staffId);
        }
        setSelectedRows(newSelected);
    };

    const toggleSelectAll = () => {
        if (selectedRows.size === filteredStaff.length) {
            setSelectedRows(new Set());
        } else {
            setSelectedRows(new Set(filteredStaff.map((s) => s.id)));
        }
    };

    const handleBulkDelete = () => {
        if (selectedRows.size > 0 && confirm(`Are you sure you want to delete ${selectedRows.size} staff member(s)?`)) {
            onBulkDelete(Array.from(selectedRows));
            setSelectedRows(new Set());
        }
    };

    const allSelected = filteredStaff.length > 0 && selectedRows.size === filteredStaff.length;

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-semibold">Staff</h1>
                    <p className="text-sm text-gray-600 mt-1">All Staff Members List</p>
                </div>
                <Button onClick={onAddNew} className="gap-2">
                    <Plus className="w-4 h-4" />
                    Add New Member
                </Button>
            </div>

            {/* Search */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
                <div className="flex-1 max-w-md">
                    <Input
                        placeholder="Search by Name or Email"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full"
                    />
                </div>
            </div>

            {/* Bulk Actions */}
            {selectedRows.size > 0 && (
                <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                    <span className="text-sm text-red-700 font-medium">
                        {selectedRows.size} staff member(s) selected
                    </span>
                    <Button
                        variant="destructive"
                        size="sm"
                        onClick={handleBulkDelete}
                        disabled={loading}
                    >
                        Delete Selected
                    </Button>
                </div>
            )}

            {/* Table */}
            <div className="border rounded-lg overflow-hidden bg-white shadow-sm">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-primary/5 hover:bg-primary/5">
                                <TableHead className="w-12">
                                    <Checkbox
                                        checked={allSelected}
                                        onCheckedChange={toggleSelectAll}
                                        aria-label="Select all"
                                    />
                                </TableHead>
                                {STAFF_COLUMNS.map((column) => (
                                    <TableHead key={column.key} className={cn(column.width, "font-semibold")}>
                                        {column.title}
                                    </TableHead>
                                ))}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading && filteredStaff.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={STAFF_COLUMNS.length + 1} className="text-center py-8">
                                        Loading...
                                    </TableCell>
                                </TableRow>
                            ) : filteredStaff.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={STAFF_COLUMNS.length + 1} className="text-center py-8">
                                        No staff members found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredStaff.map((staffMember, index) => {
                                    const isSelected = selectedRows.has(staffMember.id);
                                    const photoUrl = staffMember.registrationPhotoUrl || null;

                                    return (
                                        <TableRow
                                            key={staffMember.id}
                                            className={cn(
                                                isSelected && "bg-primary/5",
                                                "hover:bg-gray-50 transition-colors"
                                            )}
                                        >
                                            <TableCell>
                                                <Checkbox
                                                    checked={isSelected}
                                                    onCheckedChange={() => toggleRowSelection(staffMember.id)}
                                                    aria-label={`Select ${staffMember.firstName} ${staffMember.lastName}`}
                                                />
                                            </TableCell>
                                            <TableCell className="font-medium text-gray-500">
                                                {String((page * 15) + index + 1).padStart(2, "0")}
                                            </TableCell>
                                            <TableCell>
                                                <Link
                                                    href={`/admin/staff/${staffMember.id}`}
                                                    className="flex items-center gap-3 font-semibold text-gray-900 hover:text-primary hover:underline"
                                                >
                                                    <Avatar className="h-9 w-9 border border-gray-100 shadow-sm">
                                                        {photoUrl ? (
                                                            <AvatarImage src={photoUrl} alt={`${staffMember.firstName} ${staffMember.lastName}`} />
                                                        ) : null}
                                                        <AvatarFallback className="bg-primary/10 text-primary font-bold">
                                                            {getInitials(staffMember.firstName, staffMember.lastName)}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <span>
                                                        {staffMember.firstName} {staffMember.lastName}
                                                    </span>
                                                </Link>
                                            </TableCell>
                                            <TableCell className="text-gray-600 font-medium">{staffMember.email}</TableCell>
                                            <TableCell className="text-gray-600">{formatPhoneNumber(staffMember.contact)}</TableCell>
                                            <TableCell>
                                                <span className={cn(
                                                    "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider",
                                                    staffMember.gender === "MALE" ? "bg-blue-100 text-blue-700" : "bg-pink-100 text-pink-700"
                                                )}>
                                                    {staffMember.gender || "N/A"}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1.5">
                                                    <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                                                        <Link
                                                            href={`/admin/staff/${staffMember.id}`}
                                                            aria-label="View staff profile"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </Link>
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => onEdit(staffMember)}
                                                        className="h-8 w-8 hover:bg-primary/10 hover:text-primary"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => {
                                                            if (confirm(`Are you sure you want to delete ${staffMember.firstName}?`)) {
                                                                onDelete(staffMember.id)
                                                            }
                                                        }}
                                                        disabled={loading}
                                                        className="h-8 w-8 hover:bg-red-50 hover:text-red-600"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => {
                                                            setResetStaff(staffMember);
                                                            setPasswordResetVisible(true);
                                                        }}
                                                        className="h-8 w-8 hover:bg-amber-50 hover:text-amber-600"
                                                        title="Reset Password / Create Login"
                                                    >
                                                        <Key className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {/* Pagination */}
            {serverTotalPages > 1 && (
                <div className="flex items-center justify-between py-2">
                    <div className="text-sm text-gray-500 font-medium">
                        Showing Page <span className="text-gray-900 font-bold">{page + 1}</span> of <span className="text-gray-900 font-bold">{serverTotalPages}</span>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onPageChange(Math.max(0, page - 1))}
                            disabled={page === 0 || loading}
                            className="h-9 px-4 font-bold"
                        >
                            Previous
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onPageChange(Math.min(serverTotalPages - 1, page + 1))}
                            disabled={page >= serverTotalPages - 1 || loading}
                            className="h-9 px-4 font-bold"
                        >
                            Next
                        </Button>
                    </div>
                </div>
            )}

            <PasswordResetModal
                visible={passwordResetVisible}
                onClose={() => {
                    setResetStaff(null);
                    setPasswordResetVisible(false);
                }}
                userId={resetStaff?.id}
                userName={`${resetStaff?.firstName || ""} ${resetStaff?.lastName || ""}`}
                onSuccess={() => {
                    // Modal handles toast
                }}
            />
        </div>
    );
}
