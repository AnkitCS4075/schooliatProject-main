"use client";

import { useDashboard } from "@/lib/hooks/use-dashboard";
import { useAcademicYear } from "@/lib/context/academic-year-context";
import { PremiumLoadingSkeleton } from "@/components/dashboard/premium-loading-skeleton";
import { PremiumStatCard } from "@/components/dashboard/premium-stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  GraduationCap,
  BookOpen,
  FileCheck,
  Calendar,
  Clock,
  Users,
  AlertCircle,
  RefreshCw,
  CheckCircle2,
  ClipboardList,
  Award,
  Bell,
  ArrowRight,
  Plus,
  Edit
} from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

export default function TeacherDashboardPage() {
  const { selectedYear } = useAcademicYear();
  const { data, isLoading, isError, refetch } = useDashboard({ academicYear: selectedYear });
  const router = useRouter();
  const stats = data?.data || {};

  const timetableSlots = stats.timetableSlots || [];
  const pendingHomeworks = stats.pendingHomeworks || [];
  const submittedHomeworks = stats.submittedHomeworks || [];
  const upcomingExams = stats.upcomingExams || [];
  const recentNotices = stats.recentNotices || [];

  // Calculate statistics
  const totalClasses = new Set(timetableSlots.map((slot: any) => slot.timetable?.class?.id).filter(Boolean)).size;
  const totalSubjects = new Set(timetableSlots.map((slot: any) => slot.subject?.id).filter(Boolean)).size;
  const pendingEvaluations = pendingHomeworks.reduce((sum: number, hw: any) => sum + (hw._count?.submissions || 0), 0);
  const submittedCount = submittedHomeworks.length;

  // Get today's timetable
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
  const todayTimetable = timetableSlots.filter((slot: any) => slot.dayOfWeek === dayOfWeek);

  // Sort today's timetable by period number
  todayTimetable.sort((a: any, b: any) => a.periodNumber - b.periodNumber);

  // Get upcoming exams (next 7 days)
  const nextWeek = new Date();
  nextWeek.setDate(today.getDate() + 7);
  const upcomingExamsNextWeek = upcomingExams.filter((exam: any) => {
    const examDate = exam.examCalendar?.examCalendarItems?.[0]?.date;
    if (!examDate) return false;
    const date = new Date(examDate);
    return date >= today && date <= nextWeek;
  });

  if (isLoading) {
    return <PremiumLoadingSkeleton />;
  }

  if (isError) {
    return (
      <Card className="border-amber-200 bg-amber-50/50">
        <CardContent className="flex flex-col items-center justify-center gap-4 py-12">
          <AlertCircle className="h-12 w-12 text-amber-600" />
          <p className="text-center text-sm text-amber-800">
            Could not load dashboard. Please try again.
          </p>
          <Button onClick={() => refetch()} variant="outline" size="sm" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Welcome Card */}
      <Card
        className={cn(
          "bg-gradient-to-r from-blue-600 via-blue-500 to-blue-400 text-white",
          "relative overflow-hidden shadow-lg",
          "animate-slide-up"
        )}
      >
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 animate-pulse" />
        <div className="absolute bottom-0 left-0 w-36 h-36 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2 animate-pulse" style={{ animationDelay: "1s" }} />

        <CardContent className="p-4 relative z-10">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3">
            <div className="flex-1 animate-slide-in-left">
              <h1 className="text-lg font-bold mb-1.5 animate-fade-in">
                Welcome, Teacher! 👋
              </h1>
              <p className="text-white/90 text-xs leading-relaxed">
                Manage your classes, track homework, and stay updated on academic activities.
              </p>
            </div>
            <div className="flex gap-2 animate-slide-in-right">
              <Button
                onClick={() => router.push("/admin/attendance")}
                variant="secondary"
                size="sm"
                className="bg-white/20 hover:bg-white/30 text-white border-white/30"
              >
                <CheckCircle2 className="h-4 w-4 mr-1.5" />
                Mark Attendance
              </Button>
              <Button
                onClick={() => router.push("/admin/homework")}
                variant="secondary"
                size="sm"
                className="bg-white/20 hover:bg-white/30 text-white border-white/30"
              >
                <Plus className="h-4 w-4 mr-1.5" />
                Create Homework
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <PremiumStatCard
          title="Classes Assigned"
          value={totalClasses}
          icon={GraduationCap}
          gradient="from-green-500 to-green-600"
          delay={0.1}
        />
        <PremiumStatCard
          title="Subjects"
          value={totalSubjects}
          icon={BookOpen}
          gradient="from-blue-500 to-blue-600"
          delay={0.2}
        />
        <PremiumStatCard
          title="Pending Evaluations"
          value={pendingEvaluations}
          icon={FileCheck}
          gradient="from-amber-500 to-amber-600"
          delay={0.3}
        />
        <PremiumStatCard
          title="Submitted"
          value={submittedCount}
          icon={CheckCircle2}
          gradient="from-purple-500 to-purple-600"
          delay={0.4}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Today's Timetable */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                Today's Schedule
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/admin/timetable")}
                className="text-xs"
              >
                View All
                <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {todayTimetable.length > 0 ? (
              <div className="space-y-2">
                {todayTimetable.map((slot: any, index: number) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-blue-700 font-semibold text-sm">
                        {slot.periodNumber}
                      </div>
                      <div>
                        <p className="font-medium text-sm text-gray-900">
                          {slot.subject?.name || "Subject"}
                        </p>
                        <p className="text-xs text-gray-500">
                          {slot.timetable?.class?.name || "Class"} • {slot.startTime} - {slot.endTime}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">{slot.room || "Room TBD"}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">No classes scheduled for today</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <ClipboardList className="h-4 w-4 text-purple-600" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => router.push("/admin/attendance")}
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Mark Attendance
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => router.push("/admin/homework")}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Homework
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => router.push("/admin/marks/entry")}
            >
              <Edit className="h-4 w-4 mr-2" />
              Enter Marks
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => router.push("/admin/notes")}
            >
              <BookOpen className="h-4 w-4 mr-2" />
              Upload Notes
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => router.push("/admin/timetable")}
            >
              <Calendar className="h-4 w-4 mr-2" />
              View Timetable
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Homework Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Pending Homework Evaluations */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <FileCheck className="h-4 w-4 text-amber-600" />
                Pending Evaluations
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/admin/homework")}
                className="text-xs"
              >
                View All
                <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {pendingHomeworks.length > 0 ? (
              <div className="space-y-3">
                {pendingHomeworks.slice(0, 5).map((hw: any) => (
                  <div
                    key={hw.id}
                    className="p-3 bg-amber-50 rounded-lg border border-amber-200 hover:bg-amber-100 transition-colors cursor-pointer"
                    onClick={() => router.push(`/admin/homework/${hw.id}`)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-sm text-gray-900 mb-1">
                          {hw.title}
                        </p>
                        <p className="text-xs text-gray-600 mb-2">
                          {hw.subject?.name || "Subject"} • Due: {format(new Date(hw.dueDate), "MMM dd, yyyy")}
                        </p>
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-200 text-amber-800">
                            {hw._count?.submissions || 0} pending
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <FileCheck className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">No pending evaluations</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recently Submitted Homework */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                Recently Submitted
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/admin/homework")}
                className="text-xs"
              >
                View All
                <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {submittedHomeworks.length > 0 ? (
              <div className="space-y-3">
                {submittedHomeworks.slice(0, 5).map((submission: any) => (
                  <div
                    key={submission.id}
                    className="p-3 bg-schooliat-tint/50 rounded-lg border border-primary/20 hover:bg-schooliat-tint transition-colors cursor-pointer"
                    onClick={() => router.push(`/admin/homework/${submission.homework?.id}`)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-sm text-gray-900 mb-1">
                          {submission.homework?.title || "Homework"}
                        </p>
                        <p className="text-xs text-gray-600 mb-1">
                          {submission.student?.firstName} {submission.student?.lastName}
                        </p>
                        <p className="text-xs text-gray-500">
                          Submitted: {submission.submittedAt ? format(new Date(submission.submittedAt), "MMM dd, yyyy HH:mm") : "N/A"}
                        </p>
                      </div>
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-schooliat-tint text-primary">
                        Submitted
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <CheckCircle2 className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">No recent submissions</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Exams and Notices */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Upcoming Exams */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Award className="h-4 w-4 text-purple-600" />
                Upcoming Exams
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/admin/calendar")}
                className="text-xs"
              >
                View All
                <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {upcomingExamsNextWeek.length > 0 ? (
              <div className="space-y-3">
                {upcomingExamsNextWeek.slice(0, 5).map((exam: any, index: number) => {
                  const examDate = exam.examCalendar?.examCalendarItems?.[0]?.date;
                  return (
                    <div
                      key={exam.id || index}
                      className="p-3 bg-purple-50 rounded-lg border border-purple-200"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-sm text-gray-900 mb-1">
                            {exam.name || "Exam"}
                          </p>
                          {examDate && (
                            <p className="text-xs text-gray-600">
                              {format(new Date(examDate), "MMM dd, yyyy")}
                            </p>
                          )}
                          {exam.examCalendar?.examCalendarItems?.[0]?.startTime && (
                            <p className="text-xs text-gray-500 mt-1">
                              Time: {exam.examCalendar.examCalendarItems[0].startTime}
                            </p>
                          )}
                        </div>
                        <Clock className="h-4 w-4 text-purple-400" />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Award className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">No upcoming exams this week</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Notices */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Bell className="h-4 w-4 text-primary" />
                Recent Notices
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/admin/circulars")}
                className="text-xs"
              >
                View All
                <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {recentNotices.length > 0 ? (
              <div className="space-y-3">
                {recentNotices.map((notice: any) => (
                  <div
                    key={notice.id}
                    className="p-3 bg-blue-50 rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors cursor-pointer"
                    onClick={() => router.push(`/admin/circulars/${notice.id}`)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-sm text-gray-900 mb-1">
                          {notice.title || "Notice"}
                        </p>
                        <p className="text-xs text-gray-600 line-clamp-2">
                          {notice.description || "No description"}
                        </p>
                        {notice.createdAt && (
                          <p className="text-xs text-gray-500 mt-1">
                            {format(new Date(notice.createdAt), "MMM dd, yyyy")}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Bell className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">No recent notices</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
