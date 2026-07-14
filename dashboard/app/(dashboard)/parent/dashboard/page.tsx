"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  useChildren,
  useParentDashboard,
  useChildrenAttendance,
  useChildrenFees,
} from "@/lib/hooks/use-parent";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GraduationCap, Calendar, DollarSign, BookOpen, Award } from "lucide-react";
import { format } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function ParentDashboardPage() {
  const router = useRouter();
  const [selectedChildId, setSelectedChildId] = useState<string>("");

  const { data: childrenData, isLoading: childrenLoading } = useChildren();
  const { data: dashboardData, isLoading: dashboardLoading } = useParentDashboard();
  const { data: attendanceData } = useChildrenAttendance({
    startDate: format(new Date(new Date().setMonth(new Date().getMonth() - 1)), "yyyy-MM-dd"),
    endDate: format(new Date(), "yyyy-MM-dd"),
  });
  const { data: feesData } = useChildrenFees();

  const children = childrenData?.data || [];
  const dashboard = dashboardData?.data || {};
  const attendance = attendanceData?.data || [];
  const fees = feesData?.data || [];

  // Auto-select first child if available
  if (!selectedChildId && children.length > 0) {
    setSelectedChildId(children[0].id);
  }

  const selectedChild = children.find((c: any) => c.id === selectedChildId);

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Parent Dashboard</h1>
        {children.length > 1 && (
          <Select value={selectedChildId} onValueChange={setSelectedChildId}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Select Child" />
            </SelectTrigger>
            <SelectContent>
              {children.map((child: any) => (
                <SelectItem key={child.id} value={child.id}>
                  {child.firstName} {child.lastName} - {child.studentProfile?.class?.grade || "N/A"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {childrenLoading || dashboardLoading ? (
        <Skeleton className="h-64 w-full" />
      ) : children.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12 text-gray-500">
              <GraduationCap className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p>No children linked to this account</p>
              <p className="text-sm mt-2">Please contact the school administrator to link your child's account</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Children</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{children.length}</div>
                <p className="text-xs text-gray-500 mt-1">Total children</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-primary">Attendance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">
                  {selectedChild?.attendance?.percentage || 0}%
                </div>
                <p className="text-xs text-gray-500 mt-1">This month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-primary">Fees Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">
                  {selectedChild?.fees?.status || "N/A"}
                </div>
                <p className="text-xs text-gray-500 mt-1">Current status</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-purple-600">Homework</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">
                  {selectedChild?.homework?.pending || 0}
                </div>
                <p className="text-xs text-gray-500 mt-1">Pending assignments</p>
              </CardContent>
            </Card>
          </div>

          {/* Child Details */}
          {selectedChild && (
            <Tabs defaultValue="overview" onValueChange={() => {}} className="space-y-6">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="attendance">Attendance</TabsTrigger>
                <TabsTrigger value="fees">Fees</TabsTrigger>
                <TabsTrigger value="homework">Homework</TabsTrigger>
                <TabsTrigger value="results">Results</TabsTrigger>
              </TabsList>

              <TabsContent value="overview">
                <Card>
                  <CardHeader>
                    <CardTitle>
                      {selectedChild.firstName} {selectedChild.lastName}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Class</p>
                        <p className="font-medium">
                          {selectedChild.studentProfile?.class?.grade || "N/A"}
                          {selectedChild.studentProfile?.class?.division
                            ? `-${selectedChild.studentProfile.class.division}`
                            : ""}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Roll Number</p>
                        <p className="font-medium">
                          {selectedChild.studentProfile?.rollNumber || "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Email</p>
                        <p className="font-medium">{selectedChild.email || "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Contact</p>
                        <p className="font-medium">{selectedChild.contact || "N/A"}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="attendance">
                <Card>
                  <CardHeader>
                    <CardTitle>Attendance Records</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {attendance.length === 0 ? (
                        <p className="text-gray-500 text-center py-4">No attendance records found</p>
                      ) : (
                        attendance
                          .filter((a: any) => a.studentId === selectedChildId)
                          .map((record: any) => (
                            <div
                              key={record.id}
                              className="flex items-center justify-between p-3 border rounded-lg"
                            >
                              <div>
                                <p className="font-medium">
                                  {format(new Date(record.date), "MMM dd, yyyy")}
                                </p>
                                <p className="text-sm text-gray-500">
                                  {record.status === "PRESENT" ? "Present" : "Absent"}
                                </p>
                              </div>
                              <Badge
                                className={
                                  record.status === "PRESENT"
                                    ? "bg-primary hover:bg-schooliat-primary-dark"
                                    : "bg-red-500 hover:bg-red-600"
                                }
                              >
                                {record.status}
                              </Badge>
                            </div>
                          ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="fees">
                <Card>
                  <CardHeader>
                    <CardTitle>Fee Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {fees.length === 0 ? (
                        <p className="text-gray-500 text-center py-4">No fee records found</p>
                      ) : (
                        fees
                          .filter((f: any) => f.studentId === selectedChildId)
                          .map((fee: any) => (
                            <div
                              key={fee.id}
                              className="flex items-center justify-between p-3 border rounded-lg"
                            >
                              <div>
                                <p className="font-medium">{fee.installmentName || "Fee Installment"}</p>
                                <p className="text-sm text-gray-500">
                                  Due: {fee.dueDate ? format(new Date(fee.dueDate), "MMM dd, yyyy") : "N/A"}
                                </p>
                              </div>
                              <Badge
                                className={
                                  fee.status === "PAID"
                                    ? "bg-primary hover:bg-schooliat-primary-dark"
                                    : "bg-red-500 hover:bg-red-600"
                                }
                              >
                                {fee.status}
                              </Badge>
                            </div>
                          ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="homework">
                <Card>
                  <CardHeader>
                    <CardTitle>Homework & Assignments</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-500 text-center py-4">
                      Homework details will be displayed here
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="results">
                <Card>
                  <CardHeader>
                    <CardTitle>Exam Results</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-500 text-center py-4">
                      Exam results will be displayed here
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </>
      )}
    </div>
  );
}

