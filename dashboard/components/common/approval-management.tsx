"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, CheckCircle, XCircle, Image, Calendar, AlertCircle } from "lucide-react";
import {
  usePendingGalleryApprovals,
  useApproveGallery,
  useRejectGallery,
  usePendingEventApprovals,
  useApproveEvent,
  useRejectEvent,
} from "@/lib/hooks/use-approvals";
import { toast } from "sonner";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function GalleryApprovalCard({ gallery, onApprove, onReject, isProcessing }: {
  gallery: any;
  onApprove: () => void;
  onReject: () => void;
  isProcessing: boolean;
}) {
  return (
    <Card>
      <CardContent className="pt-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <Image className="h-4 w-4 text-muted-foreground" />
              <h3 className="font-semibold">{gallery.title}</h3>
            </div>
            {gallery.description && <p className="text-sm text-muted-foreground mt-1">{gallery.description}</p>}
            <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
              <span>{gallery.images?.length || 0} images</span>
              <span>Created {formatDate(gallery.createdAt)}</span>
              {gallery.class && <span>Class {gallery.class.grade} {gallery.class.division}</span>}
              {gallery.event && <span>Event: {gallery.event.title}</span>}
            </div>
          </div>
          <div className="flex gap-2 ml-4">
            <Button size="sm" variant="default" onClick={onApprove} disabled={isProcessing}>
              <CheckCircle className="mr-1 h-4 w-4" /> Approve
            </Button>
            <Button size="sm" variant="destructive" onClick={onReject} disabled={isProcessing}>
              <XCircle className="mr-1 h-4 w-4" /> Reject
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function EventApprovalCard({ event, onApprove, onReject, isProcessing }: {
  event: any;
  onApprove: () => void;
  onReject: () => void;
  isProcessing: boolean;
}) {
  return (
    <Card>
      <CardContent className="pt-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <h3 className="font-semibold">{event.title}</h3>
            </div>
            {event.description && <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{event.description}</p>}
            <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
              <span>{formatDate(event.from)} — {formatDate(event.till)}</span>
              <Badge variant="outline" className="text-xs">{event.dateType}</Badge>
            </div>
          </div>
          <div className="flex gap-2 ml-4">
            <Button size="sm" variant="default" onClick={onApprove} disabled={isProcessing}>
              <CheckCircle className="mr-1 h-4 w-4" /> Approve
            </Button>
            <Button size="sm" variant="destructive" onClick={onReject} disabled={isProcessing}>
              <XCircle className="mr-1 h-4 w-4" /> Reject
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function RejectDialog({ open, onOpenChange, onConfirm, title }: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (reason: string) => void;
  title: string;
}) {
  const [reason, setReason] = useState("");
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Reject {title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Reason (optional)</Label>
            <Textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={3} placeholder="Why is this being rejected?" />
          </div>
          <Button variant="destructive" onClick={() => { onConfirm(reason); setReason(""); }} className="w-full">
            Confirm Rejection
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function ApprovalManagement() {
  const [rejectDialog, setRejectDialog] = useState<{ type: "gallery" | "event"; id: string } | null>(null);

  const { data: pendingGalleriesData, isLoading: loadingGalleries } = usePendingGalleryApprovals();
  const approveGallery = useApproveGallery();
  const rejectGallery = useRejectGallery();

  const { data: pendingEventsData, isLoading: loadingEvents } = usePendingEventApprovals();
  const approveEvent = useApproveEvent();
  const rejectEvent = useRejectEvent();

  const pendingGalleries = (pendingGalleriesData as any)?.data || [];
  const pendingEvents = (pendingEventsData as any)?.data || [];
  const totalPending = pendingGalleries.length + pendingEvents.length;

  const handleRejectConfirm = async (reason: string) => {
    if (!rejectDialog) return;
    try {
      if (rejectDialog.type === "gallery") {
        await rejectGallery.mutateAsync({ id: rejectDialog.id, reason });
        toast.success("Gallery rejected");
      } else {
        await rejectEvent.mutateAsync({ id: rejectDialog.id, reason });
        toast.success("Event rejected");
      }
      setRejectDialog(null);
    } catch (err: any) {
      toast.error(err?.message || "Failed to reject");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Pending Approvals</h1>
          <p className="text-muted-foreground text-sm">Review and approve gallery albums and events</p>
        </div>
        {totalPending > 0 && (
          <Badge variant="destructive" className="text-sm px-3 py-1">
            <AlertCircle className="mr-1 h-4 w-4" /> {totalPending} pending
          </Badge>
        )}
      </div>

      <Tabs defaultValue="galleries">
        <TabsList>
          <TabsTrigger value="galleries">
            Gallery Albums ({pendingGalleries.length})
          </TabsTrigger>
          <TabsTrigger value="events">
            Events ({pendingEvents.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="galleries" className="space-y-4 mt-4">
          {loadingGalleries ? (
            <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div>
          ) : pendingGalleries.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500 opacity-50" />
                <p>No gallery albums pending approval</p>
              </CardContent>
            </Card>
          ) : (
            pendingGalleries.map((g: any) => (
              <GalleryApprovalCard
                key={g.id}
                gallery={g}
                isProcessing={approveGallery.isPending || rejectGallery.isPending}
                onApprove={() => {
                  if (confirm(`Approve "${g.title}"?`)) {
                    approveGallery.mutate(g.id, {
                      onSuccess: () => toast.success("Gallery approved"),
                      onError: (err: any) => toast.error(err?.message || "Failed"),
                    });
                  }
                }}
                onReject={() => setRejectDialog({ type: "gallery", id: g.id })}
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="events" className="space-y-4 mt-4">
          {loadingEvents ? (
            <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div>
          ) : pendingEvents.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500 opacity-50" />
                <p>No events pending approval</p>
              </CardContent>
            </Card>
          ) : (
            pendingEvents.map((e: any) => (
              <EventApprovalCard
                key={e.id}
                event={e}
                isProcessing={approveEvent.isPending || rejectEvent.isPending}
                onApprove={() => {
                  if (confirm(`Approve event "${e.title}"?`)) {
                    approveEvent.mutate(e.id, {
                      onSuccess: () => toast.success("Event approved"),
                      onError: (err: any) => toast.error(err?.message || "Failed"),
                    });
                  }
                }}
                onReject={() => setRejectDialog({ type: "event", id: e.id })}
              />
            ))
          )}
        </TabsContent>
      </Tabs>

      <RejectDialog
        open={!!rejectDialog}
        onOpenChange={() => setRejectDialog(null)}
        onConfirm={handleRejectConfirm}
        title={rejectDialog?.type === "gallery" ? "Gallery Album" : "Event"}
      />
    </div>
  );
}
