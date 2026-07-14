"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, Server, Database, Clock, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { useSystemHealth } from "@/lib/hooks/use-super-admin";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

export default function SystemHealthPage() {
  const { data, isLoading } = useSystemHealth();

  const healthStatus = data?.status === "healthy" ? "healthy" : "unhealthy";
  const timestamp = data?.timestamp ? new Date(data.timestamp) : new Date();

  const getStatusBadge = (status: string) => {
    if (status === "healthy") {
      return (
        <Badge className="bg-primary">
          <CheckCircle2 className="w-3 h-3 mr-1" />
          Healthy
        </Badge>
      );
    }
    return (
      <Badge variant="destructive">
        <XCircle className="w-3 h-3 mr-1" />
        Unhealthy
      </Badge>
    );
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold">System Health Monitoring</h1>
        <p className="text-sm text-gray-600 mt-1">
          Monitor system status, API health, and server performance
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Overall Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="space-y-2">
                {getStatusBadge(healthStatus)}
                <p className="text-xs text-gray-600">
                  Last checked: {format(timestamp, "HH:mm:ss")}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Server className="w-4 h-4" />
              API Server
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="space-y-2">
                {getStatusBadge(healthStatus)}
                <p className="text-xs text-gray-600">
                  Environment: {data?.environment || "N/A"}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Database className="w-4 h-4" />
              Database
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="space-y-2">
                {getStatusBadge(healthStatus)}
                <p className="text-xs text-gray-600">Connection: Active</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Uptime
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="space-y-2">
                <Badge variant="outline">Monitoring</Badge>
                <p className="text-xs text-gray-600">
                  Version: {data?.version || "1.0.0"}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>System Information</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Status</span>
                <span className="text-sm font-medium">{data?.status || "Unknown"}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Environment</span>
                <span className="text-sm font-medium">{data?.environment || "N/A"}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Version</span>
                <span className="text-sm font-medium">{data?.version || "1.0.0"}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Last Check</span>
                <span className="text-sm font-medium">
                  {format(timestamp, "MMM dd, yyyy HH:mm:ss")}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Message</span>
                <span className="text-sm font-medium">{data?.message || "N/A"}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            Health Check Endpoints
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
              <code className="text-xs">GET /health</code>
              <Badge variant="outline">Public</Badge>
            </div>
            <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
              <code className="text-xs">GET /api/v1/health</code>
              <Badge variant="outline">Versioned</Badge>
            </div>
            <p className="text-xs text-gray-600 mt-4">
              Health checks are performed automatically every 30 seconds. The system status is
              updated in real-time.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

