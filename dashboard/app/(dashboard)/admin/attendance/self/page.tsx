"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Loader2, CheckCircle, AlertTriangle, Navigation } from "lucide-react";
import { useGeofenceConfig, useSelfMarkAttendance } from "@/lib/hooks/use-staff-attendance";
import { toast } from "sonner";

function haversineDistance(
  lat1: number, lon1: number,
  lat2: number, lon2: number,
): number {
  const R = 6371e3;
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;
  const a = Math.sin(deltaPhi / 2) ** 2 + Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export default function SelfAttendancePage() {
  const [location, setLocation] = useState<GeolocationCoordinates | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [locating, setLocating] = useState(false);

  const { data: geofenceData, isLoading: configLoading } = useGeofenceConfig();
  const selfMark = useSelfMarkAttendance();

  const geofence = geofenceData?.data;

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser");
      return;
    }
    setLocating(true);
    setLocationError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation(pos.coords);
        setLocating(false);
      },
      (err) => {
        setLocationError(err.message || "Failed to get location");
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 },
    );
  };

  useEffect(() => {
    requestLocation();
  }, []);

  const distance =
    location && geofence?.geoFenceEnabled && geofence.geoFenceLatitude && geofence.geoFenceLongitude
      ? haversineDistance(
          location.latitude,
          location.longitude,
          geofence.geoFenceLatitude,
          geofence.geoFenceLongitude,
        )
      : null;

  const isWithin =
    distance !== null && geofence?.geoFenceRadiusMeters
      ? distance <= geofence.geoFenceRadiusMeters
      : true;

  const handleMarkAttendance = async () => {
    try {
      const result = await selfMark.mutateAsync({
        latitude: location?.latitude,
        longitude: location?.longitude,
        accuracy: location?.accuracy,
      });
      if (result.data?.isWithinGeofence === false) {
        toast.warning("Attendance marked but you are outside the school geofence");
      } else {
        toast.success("Attendance marked successfully!");
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to mark attendance");
    }
  };

  return (
    <div className="container mx-auto py-6 px-4 max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Self Attendance</h1>
        <p className="text-muted-foreground text-sm">
          Mark your attendance using your device location
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Navigation className="h-5 w-5" />
            Location Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {locating ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Getting your location...
            </div>
          ) : locationError ? (
            <div className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-4 w-4" />
              {locationError}
            </div>
          ) : location ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium">Location acquired</span>
              </div>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>Latitude: {location.latitude.toFixed(6)}</p>
                <p>Longitude: {location.longitude.toFixed(6)}</p>
                <p>Accuracy: {Math.round(location.accuracy)}m</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              Click the button to get your location
            </div>
          )}

          {geofence?.geoFenceEnabled && distance !== null && (
            <div className="pt-2 border-t space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Distance from school:</span>
                <Badge variant={isWithin ? "default" : "destructive"}>
                  {Math.round(distance)}m / {geofence.geoFenceRadiusMeters}m
                </Badge>
              </div>
              <Badge variant={isWithin ? "default" : "destructive"} className="w-full justify-center py-1">
                {isWithin ? "Within school premises" : "Outside school premises"}
              </Badge>
            </div>
          )}

          {!geofence?.geoFenceEnabled && !configLoading && (
            <Badge variant="secondary" className="w-full justify-center py-1">
              Geo-fencing is not enabled
            </Badge>
          )}
        </CardContent>
      </Card>

      <div className="flex gap-2">
        <Button
          variant="outline"
          className="flex-1"
          onClick={requestLocation}
          disabled={locating}
        >
          <MapPin className="h-4 w-4 mr-2" />
          Refresh Location
        </Button>
        <Button
          className="flex-1"
          onClick={handleMarkAttendance}
          disabled={selfMark.isPending || locating}
        >
          {selfMark.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <CheckCircle className="h-4 w-4 mr-2" />
          )}
          Mark Attendance
        </Button>
      </div>
    </div>
  );
}
