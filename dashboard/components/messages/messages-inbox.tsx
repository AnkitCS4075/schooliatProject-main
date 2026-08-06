"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MessageSquare, Send, Loader2, ArrowLeft, Users, User, Plus } from "lucide-react";
import {
  useConversations,
  useMessages,
  useSendMessage,
  useSendTargetedMessage,
  useRecipients,
  type Conversation,
  type Message,
  type SendToTargetType,
} from "@/lib/hooks/use-communication";
import { useAllClasses } from "@/lib/hooks/use-classes";
import { getUserId } from "@/lib/auth/storage";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

function formatTime(iso: string): string {
  try {
    const d = new Date(iso);
    const now = new Date();
    if (d.toDateString() === now.toDateString()) {
      return d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
    }
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  } catch {
    return "";
  }
}

function getConversationTitle(conv: Conversation): string {
  if (conv.title) return conv.title;
  if (conv.type === "DIRECT") return "Direct Message";
  if (conv.type === "CLASS") return "Class Chat";
  if (conv.type === "SCHOOL") return "School Announcements";
  return conv.type;
}

function getConversationIcon(conv: Conversation) {
  if (conv.type === "DIRECT") return <User className="h-4 w-4" />;
  return <Users className="h-4 w-4" />;
}

const TARGET_LABELS: Record<SendToTargetType, string> = {
  INDIVIDUAL: "Individual",
  CLASS: "Class",
  ALL_TEACHERS: "All Teachers",
  ALL_STAFF: "All Staff",
  WHOLE_SCHOOL: "Whole School",
};

function NewMessageDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [targetType, setTargetType] = useState<SendToTargetType>("INDIVIDUAL");
  const [search, setSearch] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [classId, setClassId] = useState<string>("");
  const [content, setContent] = useState("");
  const send = useSendTargetedMessage();

  const { data: recipientsData, isLoading: loadingRecipients } = useRecipients(search);
  const recipients: any[] = recipientsData?.data || [];
  const { data: classesData } = useAllClasses();
  const classes: any[] = classesData?.data || [];

  const needsUser = targetType === "INDIVIDUAL";
  const needsClass = targetType === "CLASS";

  const handleSend = async () => {
    if (!content.trim()) return;
    try {
      await send.mutateAsync({
        content: content.trim(),
        target: {
          type: targetType,
          userId: needsUser && selectedUserId ? selectedUserId : undefined,
          classId: needsClass && classId ? classId : undefined,
        },
      });
      toast.success("Message sent");
      setContent("");
      setSearch("");
      setSelectedUserId("");
      setClassId("");
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err?.message || "Failed to send message");
    }
  };

  const selectedRecipient = recipients.find((r) => r.id === selectedUserId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" /> New Message
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Send To</Label>
            <Select value={targetType} onValueChange={(v) => setTargetType(v as SendToTargetType)}>
              <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                {(Object.keys(TARGET_LABELS) as SendToTargetType[]).map((t) => (
                  <SelectItem key={t} value={t}>{TARGET_LABELS[t]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {needsUser && (
            <div className="space-y-2">
              <Label>Recipient</Label>
              <Input
                placeholder="Search by name, email or ID..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setSelectedUserId(""); }}
              />
              <div className="border rounded-md max-h-40 overflow-y-auto">
                {loadingRecipients ? (
                  <div className="flex items-center justify-center py-6">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  </div>
                ) : recipients.length === 0 ? (
                  <p className="text-sm text-muted-foreground p-3">No users found</p>
                ) : (
                  recipients.map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      className={cn(
                        "w-full flex items-center gap-2 px-3 py-2 text-left text-sm hover:bg-muted/50 transition-colors",
                        selectedUserId === r.id && "bg-muted",
                      )}
                      onClick={() => { setSelectedUserId(r.id); setSearch(""); }}
                    >
                      <span className="flex-1 font-medium truncate">
                        {r.firstName} {r.lastName}
                      </span>
                      <span className="text-xs text-muted-foreground uppercase">{r.role?.name?.replaceAll("_", " ")}</span>
                    </button>
                  ))
                )}
              </div>
              {selectedUserId && (
                <p className="text-sm text-muted-foreground">
                  Selected: <span className="font-medium">{selectedRecipient?.firstName} {selectedRecipient?.lastName}</span>
                </p>
              )}
            </div>
          )}

          {needsClass && (
            <div className="space-y-2">
              <Label>Class</Label>
              <Select value={classId} onValueChange={setClassId}>
                <SelectTrigger className="w-full"><SelectValue placeholder="Select class" /></SelectTrigger>
                <SelectContent>
                  {classes.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      Class {c.grade}{c.division ? `-${c.division}` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label>Message</Label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
              placeholder="Write your message..."
            />
          </div>

          <Button
            className="w-full"
            onClick={handleSend}
            disabled={
              send.isPending ||
              !content.trim() ||
              (needsUser && !selectedUserId) ||
              (needsClass && !classId)
            }
          >
            {send.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
            Send
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function MessagesInbox() {
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [composerOpen, setComposerOpen] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: conversationsData, isLoading: loadingConversations } = useConversations();
  const { data: messagesData, isLoading: loadingMessages } = useMessages(selectedConversation || "");
  const sendMessage = useSendMessage();

  useEffect(() => {
    getUserId().then((id) => setCurrentUserId(id));
  }, []);

  const conversations: Conversation[] = conversationsData?.data?.conversations || [];
  const messages: Message[] = messagesData?.data?.messages || [];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!newMessage.trim() || !selectedConversation) return;
    try {
      await sendMessage.mutateAsync({
        conversationId: selectedConversation,
        content: newMessage.trim(),
      });
      setNewMessage("");
    } catch {
      // Error handled by mutation
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Conversation list view
  if (!selectedConversation) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Messages</h1>
            <p className="text-muted-foreground text-sm">Your conversations and messages</p>
          </div>
          <Button onClick={() => setComposerOpen(true)}>
            <Plus className="h-4 w-4 mr-2" /> New Message
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Conversations
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingConversations ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : conversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <MessageSquare className="h-8 w-8 mb-2" />
                <p>No conversations yet</p>
              </div>
            ) : (
              <div className="divide-y">
                {conversations.map((conv) => (
                  <button
                    key={conv.id}
                    className="w-full flex items-center gap-3 p-3 hover:bg-muted/50 transition-colors text-left"
                    onClick={() => setSelectedConversation(conv.id)}
                  >
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                      {getConversationIcon(conv)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-medium truncate">{getConversationTitle(conv)}</p>
                        {conv.lastMessage && (
                          <span className="text-xs text-muted-foreground flex-shrink-0 ml-2">
                            {formatTime(conv.lastMessage.sentAt)}
                          </span>
                        )}
                      </div>
                      {conv.lastMessage && (
                        <p className="text-sm text-muted-foreground truncate">
                          {conv.lastMessage.senderFirstName && (
                            <span className="font-medium">
                              {conv.lastMessage.senderFirstName}:{" "}
                            </span>
                          )}
                          {conv.lastMessage.content}
                        </p>
                      )}
                    </div>
                    {conv.unreadCount > 0 && (
                      <Badge variant="default" className="flex-shrink-0">
                        {conv.unreadCount}
                      </Badge>
                    )}
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <NewMessageDialog open={composerOpen} onOpenChange={setComposerOpen} />
      </div>
    );
  }

  // Chat view
  const selectedConv = conversations.find((c) => c.id === selectedConversation);

  return (
    <div className="flex flex-col h-[calc(100vh-120px)]">
      <Card className="flex-1 flex flex-col overflow-hidden">
        <CardHeader className="border-b py-3">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedConversation(null)}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <CardTitle className="text-base">
                {selectedConv ? getConversationTitle(selectedConv) : "Chat"}
              </CardTitle>
              {selectedConv?.type && (
                <p className="text-xs text-muted-foreground capitalize">
                  {selectedConv.type.toLowerCase()} conversation
                </p>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-hidden p-0">
          <ScrollArea className="h-full px-4">
            <div className="py-4 space-y-3">
              {loadingMessages ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <MessageSquare className="h-8 w-8 mb-2" />
                  <p>No messages yet. Start the conversation!</p>
                </div>
              ) : (
                messages.map((msg) => {
                  const isOwn = currentUserId != null && msg.senderId === currentUserId;
                  return (
                    <div
                      key={msg.id}
                      className={cn(
                        "flex flex-col max-w-[75%] rounded-lg p-3",
                        isOwn
                          ? "ml-auto bg-primary text-primary-foreground"
                          : "bg-muted",
                      )}
                    >
                      {!isOwn && msg.senderFirstName && (
                        <p className="text-xs font-medium mb-1 opacity-80">
                          {msg.senderFirstName} {msg.senderLastName}
                        </p>
                      )}
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                      <p className={cn(
                        "text-xs mt-1",
                        isOwn ? "text-primary-foreground/70" : "text-muted-foreground",
                      )}>
                        {formatTime(msg.sentAt)}
                      </p>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
        </CardContent>
        <div className="border-t p-4">
          <div className="flex gap-2">
            <Input
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={sendMessage.isPending}
            />
            <Button
              onClick={handleSend}
              disabled={!newMessage.trim() || sendMessage.isPending}
            >
              {sendMessage.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
