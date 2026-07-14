"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Bell, Loader2, Send, Search } from "lucide-react";
import { post, get } from "@/lib/api/client";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";

function fetchSchools() {
    return get("/schools", { limit: 200 });
}

export default function PaymentReminderPage() {
    const [selectedSchools, setSelectedSchools] = useState<Set<string>>(new Set());
    const [searchQuery, setSearchQuery] = useState("");
    const [message, setMessage] = useState(
        "Dear School Admin,\n\nThis is a friendly reminder regarding pending payment(s) for your school. Please ensure the dues are cleared at the earliest to avoid any service disruption.\n\nThank you,\nSchooliAT Team"
    );
    const [subject, setSubject] = useState("Payment Reminder");
    const [sending, setSending] = useState(false);

    const { data: schoolsData, isLoading } = useQuery({
        queryKey: ["schools", "list"],
        queryFn: fetchSchools,
        staleTime: 60 * 1000,
    });

    const schools = schoolsData?.data || [];

    const filteredSchools = schools.filter((school: any) => {
        const q = searchQuery.toLowerCase();
        return (
            !q ||
            school.name?.toLowerCase().includes(q) ||
            school.code?.toLowerCase().includes(q)
        );
    });

    const toggleSchool = (id: string) => {
        const newSet = new Set(selectedSchools);
        if (newSet.has(id)) {
            newSet.delete(id);
        } else {
            newSet.add(id);
        }
        setSelectedSchools(newSet);
    };

    const toggleAll = () => {
        if (selectedSchools.size === filteredSchools.length) {
            setSelectedSchools(new Set());
        } else {
            setSelectedSchools(new Set(filteredSchools.map((s: any) => s.id)));
        }
    };

    const handleSend = async () => {
        if (selectedSchools.size === 0) {
            toast.error("Please select at least one school");
            return;
        }
        if (!message.trim()) {
            toast.error("Please enter a message");
            return;
        }

        setSending(true);
        try {
            // Send announcement to selected schools
            await post("/communication/announcements", {
                request: {
                    title: subject,
                    content: message,
                    targetSchoolIds: Array.from(selectedSchools),
                    type: "PAYMENT_REMINDER",
                },
            });
            toast.success(`Payment reminder sent to ${selectedSchools.size} school(s)!`);
            setSelectedSchools(new Set());
        } catch (error: any) {
            toast.error(error?.message || "Failed to send reminders");
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold flex items-center gap-2">
                        <Bell className="w-6 h-6" />
                        Payment Reminders
                    </h1>
                    <p className="text-sm text-gray-600 mt-1">
                        Send payment reminders to specific schools
                    </p>
                </div>
                <Button
                    onClick={handleSend}
                    disabled={sending || selectedSchools.size === 0}
                    className="gap-2"
                >
                    {sending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        <Send className="w-4 h-4" />
                    )}
                    Send Reminder ({selectedSchools.size})
                </Button>
            </div>

            {/* Message composition */}
            <div className="border rounded-lg p-4 space-y-4">
                <div className="grid gap-2">
                    <Label>Subject</Label>
                    <Input
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        placeholder="Reminder subject..."
                    />
                </div>
                <div className="grid gap-2">
                    <Label>Message</Label>
                    <Textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Enter your reminder message..."
                        rows={5}
                    />
                </div>
            </div>

            {/* School selection */}
            <div className="space-y-4">
                <div className="flex items-center gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                            placeholder="Search schools..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9"
                        />
                    </div>
                    {selectedSchools.size > 0 && (
                        <Badge variant="secondary" className="bg-primary/10 text-primary px-3 py-1">
                            {selectedSchools.size} selected
                        </Badge>
                    )}
                </div>

                <div className="border rounded-lg overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-schooliat-tint">
                                <TableHead className="w-12">
                                    <Checkbox
                                        checked={filteredSchools.length > 0 && selectedSchools.size === filteredSchools.length}
                                        onCheckedChange={toggleAll}
                                    />
                                </TableHead>
                                <TableHead>School Name</TableHead>
                                <TableHead className="w-32">Code</TableHead>
                                <TableHead className="w-48">Email</TableHead>
                                <TableHead className="w-36">Phone</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-8">
                                        <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                                    </TableCell>
                                </TableRow>
                            ) : filteredSchools.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                                        No schools found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredSchools.map((school: any) => (
                                    <TableRow
                                        key={school.id}
                                        className={selectedSchools.has(school.id) ? "bg-blue-50" : "hover:bg-gray-50"}
                                    >
                                        <TableCell>
                                            <Checkbox
                                                checked={selectedSchools.has(school.id)}
                                                onCheckedChange={() => toggleSchool(school.id)}
                                            />
                                        </TableCell>
                                        <TableCell className="font-medium">{school.name}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline">{school.code}</Badge>
                                        </TableCell>
                                        <TableCell className="text-sm text-gray-600">{school.email || "—"}</TableCell>
                                        <TableCell className="text-sm text-gray-600">{school.phone || "—"}</TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    );
}
