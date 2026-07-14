"use client";

import { useLeaveHistory } from "@/lib/hooks/use-leave";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, User, Clock } from "lucide-react";
import { format } from "date-fns";

export function AdminLeaveTracker() {
    // Fetch all leaves globally
    const { data: historyData, isLoading } = useLeaveHistory({
        userId: "all",
        page: 1,
        limit: 100, // Fetch a reasonable chunk
    });

    const leaves = historyData?.data || [];

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Determine current leaves (starts before or today, and ends today or later) and approved
    const currentlyOnLeave = leaves.filter((leave: any) => {
        if (leave.status !== "APPROVED") return false;
        const start = new Date(leave.startDate);
        const end = new Date(leave.endDate);
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        return today >= start && today <= end;
    });

    // Determine upcoming leaves (starts after today) and approved
    const upcomingLeaves = leaves.filter((leave: any) => {
        if (leave.status !== "APPROVED") return false;
        const start = new Date(leave.startDate);
        start.setHours(0, 0, 0, 0);
        return start > today;
    });

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Currently On Leave */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-primary">
                            <Calendar className="h-5 w-5" />
                            Currently on Leave
                        </CardTitle>
                        <CardDescription>Staff and teachers currently absent.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <Skeleton className="h-40 w-full" />
                        ) : currentlyOnLeave.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                <User className="h-10 w-10 mx-auto mb-2 opacity-20" />
                                <p>No one is currently on leave</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {currentlyOnLeave.map((leave: any) => (
                                    <div key={leave.id} className="flex items-center justify-between p-3 border rounded-lg bg-schooliat-tint/20">
                                        <div>
                                            <p className="font-semibold text-sm">{leave.requesterName}</p>
                                            <p className="text-xs text-gray-500">{leave.leaveType?.name}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-medium">Until {format(new Date(leave.endDate), "MMM dd, yyyy")}</p>
                                            <Badge variant="outline" className="mt-1 bg-white">{leave.reason || "No reason"}</Badge>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Upcoming Leaves */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-schooliat-secondary">
                            <Clock className="h-5 w-5" />
                            Upcoming Leaves
                        </CardTitle>
                        <CardDescription>Approved upcoming absences.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <Skeleton className="h-40 w-full" />
                        ) : upcomingLeaves.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                <Clock className="h-10 w-10 mx-auto mb-2 opacity-20" />
                                <p>No upcoming leaves scheduled</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {upcomingLeaves.map((leave: any) => (
                                    <div key={leave.id} className="flex items-center justify-between p-3 border rounded-lg">
                                        <div>
                                            <p className="font-semibold text-sm">{leave.requesterName}</p>
                                            <p className="text-xs text-gray-500">{leave.leaveType?.name}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-medium">
                                                {format(new Date(leave.startDate), "MMM dd")} - {format(new Date(leave.endDate), "MMM dd")}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* All Leave Records Tracker (Global Admin) */}
            <Card>
                <CardHeader>
                    <CardTitle>All leave interactions</CardTitle>
                    <CardDescription>
                        Recent leave requests for the school (up to 100 rows from the API). Use filters on other tabs or
                        export if you need full history.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        {isLoading ? (
                            <Skeleton className="h-64 w-full" />
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-schooliat-tint">
                                        <TableHead>Staff Name</TableHead>
                                        <TableHead>Leave Type</TableHead>
                                        <TableHead>Dates</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Applied On</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {leaves.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center py-6 text-gray-500">
                                                No records found
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        leaves.map((leave: any) => (
                                            <TableRow key={leave.id}>
                                                <TableCell className="font-medium">{leave.requesterName}</TableCell>
                                                <TableCell>{leave.leaveType?.name}</TableCell>
                                                <TableCell>
                                                    {format(new Date(leave.startDate), "MMM dd")} - {format(new Date(leave.endDate), "MMM dd, yyyy")}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge
                                                        variant={leave.status === "APPROVED" ? "default" : leave.status === "REJECTED" ? "destructive" : "secondary"}
                                                        className={leave.status === "APPROVED" ? "bg-primary" : ""}
                                                    >
                                                        {leave.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>{format(new Date(leave.createdAt), "MMM dd, yyyy")}</TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
