"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { UserAvatar } from "@/components/UserAvatar";
import { formatDate, formatTime } from "@/lib/formatters";
import { sendMessageToEvent } from "@/services/chat";
import {
  deleteAttendeeFromEvent,
  deleteEventById,
  getEventById,
  joinEvent,
} from "@/services/event";
import { EventDTO } from "@repo/shared-types";
import {
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  Crown,
  Edit,
  Globe,
  Loader2,
  Lock,
  MapPin,
  MessageSquare,
  MoreVertical,
  Share2,
  Shield,
  Sparkles,
  Trash2,
  UserX,
} from "lucide-react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function EventPage() {
  const router = useRouter();
  const [event, setEvent] = useState<EventDTO | undefined | null>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { eventId } = useParams();
  const { status, data: session } = useSession();
  useEffect(() => {
    if (!eventId) return;
    const fetchEvent = async () => {
      try {
        const result = await getEventById(eventId as string);
        setEvent(result.data);
      } catch (error) {
        console.error(error);
        setEvent(null);
      }
    };
    fetchEvent();
  }, [eventId]);

  const [showAttendeesModal, setShowAttendeesModal] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [messageToAll, setMessageToAll] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);

  if (event === undefined || status === "loading") {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center gap-4 bg-slate-50">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
        <p className="text-slate-500 font-medium animate-pulse">
          Loading experience...
        </p>
      </div>
    );
  }

  if (!event || !session) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <Card className="max-w-md w-full border-none shadow-2xl rounded-3xl p-8 text-center">
          <div className="mx-auto w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mb-6">
            <AlertCircle className="h-8 w-8 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            Event Not Found
          </h2>
          <p className="text-slate-500 mb-8">
            This event may have been cancelled or moved. Please check with the
            community organizer.
          </p>
          <Button
            onClick={() => router.push("/events")}
            className="w-full rounded-xl bg-slate-900"
          >
            Back to Calendar
          </Button>
        </Card>
      </div>
    );
  }

  const handleDeleteEvent = async () => {
    await deleteEventById(event.id);
    router.push(`/communities/${event.community.id}`);
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin":
        return (
          <Badge className="bg-linear-to-r from-yellow-500 to-orange-500 text-white border-0 text-xs">
            <Crown className="w-3 h-3 mr-1" />
            Admin
          </Badge>
        );
      case "moderator":
        return (
          <Badge className="bg-linear-to-r from-blue-500 to-cyan-500 text-white border-0 text-xs">
            <Shield className="w-3 h-3 mr-1" />
            Moderator
          </Badge>
        );
      default:
        return null;
    }
  };

  const handleRemoveAttendee = async (attendeeId: string) => {
    const result = await deleteAttendeeFromEvent(event.id, attendeeId);
    if (result) {
      setEvent((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          participants: {
            ...prev.participants.filter((p) => p.id !== attendeeId),
          },
        };
      });
    }
  };

  const handleSendMessageToAll = async () => {
    if (!messageToAll.trim()) return;

    setSendingMessage(true);

    const res = await sendMessageToEvent(messageToAll, event, session.user.id);
    if (!res) {
      toast.error("Error sending the mass message");
      return;
    }
    setSendingMessage(false);
    setShowMessageModal(false);
  };

  const isMember = event.community.members.some(
    (m) => m.userId === session.user.id
  );
  if (!event.public && !isMember) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50">
        <Card className="max-w-lg w-full border-none shadow-2xl rounded-3xl overflow-hidden bg-white">
          <div className="h-2 bg-amber-500" />
          <CardContent className="p-10 text-center">
            <div className="mx-auto w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mb-6">
              <Lock className="h-10 w-10 text-amber-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-3">
              Private Event
            </h2>
            <p className="text-slate-500 mb-8 leading-relaxed">
              This experience is exclusive to members of{" "}
              <span className="font-bold text-slate-900">
                {event.community.name}
              </span>
              . Join the community to access event details and RSVP.
            </p>
            <div className="flex flex-col gap-3">
              <Button
                asChild
                className="w-full h-12 rounded-xl bg-blue-600 shadow-lg shadow-blue-200"
              >
                <Link href={`/communities/${event.community.id}`}>
                  View Community
                </Link>
              </Button>
              <Button
                variant="ghost"
                onClick={() => router.back()}
                className="text-slate-400"
              >
                Go Back
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isOrganizer = session.user.id === event.creator?.user.id;
  const isAttending = event.participants.some(
    (p) => p.userId === session.user.id
  );
  const canManageEvent =
    isOrganizer ||
    (isMember &&
      event.participants.some(
        (p) => p.userId === session.user.id && p.role === "admin"
      ));

  const handleRSVP = async () => {
    setIsSubmitting(true);
    try {
      await joinEvent(event.id);
      toast.success("Successfully joined!");
      window.location.reload();
    } catch (e) {
      console.error(e);
      toast.error("RSVP failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      <div className="relative h-80 md:h-112.5 w-full overflow-hidden">
        <Image
          src={event.coverImage || "/placeholder.svg"}
          alt={event.title}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-linear-to-t from-slate-900 via-slate-900/40 to-transparent" />

        <div className="absolute top-6 left-0 right-0 px-4 md:px-8">
          <div className="max-w-7xl mx-auto flex justify-between">
            <Button
              onClick={() => router.back()}
              variant="secondary"
              size="icon"
              className="rounded-full bg-white/10 hover:bg-white/20 border-white/20 text-white backdrop-blur-md"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex gap-2">
              <Button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  toast.success("URL Copied");
                }}
                variant="secondary"
                size="icon"
                className="rounded-full bg-white/10 hover:bg-white/20 border-white/20 text-white backdrop-blur-md"
              >
                <Share2 className="w-5 h-5" />
              </Button>
              {canManageEvent && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="secondary"
                      size="icon"
                      className="rounded-full bg-white/10 hover:bg-white/20 border-white/20 text-white backdrop-blur-md"
                    >
                      <MoreVertical className="w-5 h-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="rounded-xl border-none shadow-xl"
                  >
                    <DropdownMenuItem
                      onClick={() => router.push(`/events/${event.id}/edit`)}
                    >
                      <Edit className="w-4 h-4 mr-2" /> Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setShowMessageModal(true)}>
                      <MessageSquare className="w-4 h-4 mr-2" /> Message All
                    </DropdownMenuItem>
                    <Separator className="my-1" />
                    <DropdownMenuItem
                      onClick={() => setShowDeleteModal(true)}
                      className="text-red-600"
                    >
                      <Trash2 className="w-4 h-4 mr-2" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12">
          <div className="max-w-7xl mx-auto space-y-4">
            <div className="flex flex-wrap gap-2">
              <Badge
                className={`${
                  event.location_format === "online"
                    ? "bg-green-500"
                    : "bg-blue-500"
                } border-none text-white`}
              >
                {event.location_format === "online" ? (
                  <Globe className="w-3 h-3 mr-1" />
                ) : (
                  <MapPin className="w-3 h-3 mr-1" />
                )}
                {event.location_format.toUpperCase()}
              </Badge>
              {!event.public && (
                <Badge className="bg-amber-500 text-white border-none">
                  <Lock className="w-3 h-3 mr-1" /> PRIVATE
                </Badge>
              )}
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tight">
              {event.title}
            </h1>
            <div className="flex items-center gap-2 text-slate-200">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold">
                {event.community.name[0]}
              </div>
              <span className="font-medium">
                Hosted by{" "}
                <Link
                  href={`/communities/${event.community.id}`}
                  className="hover:underline"
                >
                  {event.community.name}
                </Link>
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* 5. MAIN CONTENT */}
          <div className="lg:col-span-8 space-y-8">
            <Card className="border-none shadow-sm rounded-3xl p-8 bg-white">
              <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-blue-600" /> About the
                Experience
              </h2>
              <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed whitespace-pre-wrap">
                {event.description}
              </div>
              <div className="flex flex-wrap gap-2 mt-8">
                {event.tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="bg-slate-100 text-slate-600 border-none px-4 py-1.5 rounded-xl"
                  >
                    #{tag}
                  </Badge>
                ))}
              </div>
            </Card>

            <Card className="border-none shadow-sm rounded-3xl p-8 bg-white">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-bold text-slate-900">
                  Attendees ({event.participants.length})
                </h3>
                <Button
                  variant="ghost"
                  className="text-blue-600"
                  onClick={() => setShowAttendeesModal(true)}
                >
                  View Full List
                </Button>
              </div>
              <div className="flex -space-x-4 overflow-hidden">
                {event.participants.slice(0, 10).map((p) => (
                  <UserAvatar
                    key={p.id}
                    avatarUrl={p.user.image || undefined}
                    name={p.user.name || undefined}
                    className="ring-4 ring-white w-12 h-12"
                  />
                ))}
                {event.participants.length > 10 && (
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-slate-100 text-slate-500 text-xs font-bold ring-4 ring-white">
                    +{event.participants.length - 10}
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* 6. SIDEBAR LOGISTICS */}
          <aside className="lg:col-span-4 space-y-6">
            <Card className="border-none shadow-xl rounded-3xl p-6 bg-white sticky top-24">
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
                    <Calendar className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-400 font-medium uppercase tracking-wider">
                      Date
                    </p>
                    <p className="font-bold text-slate-900">
                      {formatDate(event.date)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-600">
                    <Clock className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-400 font-medium uppercase tracking-wider">
                      Time
                    </p>
                    <p className="font-bold text-slate-900">
                      {event.all_day
                        ? "All Day Event"
                        : formatTime(event.start_time || "")}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                    <MapPin className="h-6 w-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-400 font-medium uppercase tracking-wider">
                      Location
                    </p>
                    <p className="font-bold text-slate-900 truncate">
                      {event.location_format === "in-person"
                        ? event.location
                        : "Online"}
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-50 space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">Confirmed Attendees</span>
                    <span className="font-bold text-slate-900">
                      {event.participants.length} / {event.capacity || "∞"}
                    </span>
                  </div>
                  {event.capacity && (
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-600 transition-all duration-500"
                        style={{
                          width: `${
                            (event.participants.length / event.capacity) * 100
                          }%`,
                        }}
                      />
                    </div>
                  )}

                  <Button
                    disabled={
                      isAttending ||
                      isSubmitting ||
                      (!!event.capacity &&
                        event.participants.length >= event.capacity)
                    }
                    onClick={handleRSVP}
                    className={`w-full h-14 rounded-2xl text-lg font-bold transition-all ${
                      isAttending
                        ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                        : "bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200"
                    }`}
                  >
                    {isAttending ? (
                      <>
                        <CheckCircle2 className="mr-2" /> Confirmed
                      </>
                    ) : isSubmitting ? (
                      <Loader2 className="animate-spin" />
                    ) : (
                      "Join Experience"
                    )}
                  </Button>
                </div>
              </div>
            </Card>
          </aside>
        </div>
      </div>

      {/* Manage Attendees Modal */}
      <Dialog open={showAttendeesModal} onOpenChange={setShowAttendeesModal}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto rounded-3xl">
          <DialogHeader>
            <DialogTitle>Manage Attendees</DialogTitle>
            <DialogDescription>
              View and manage all attendees for this event
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            <div>
              <div className="space-y-2">
                {event.participants.map((attendee) => (
                  <div
                    key={attendee.id}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <UserAvatar
                        avatarUrl={attendee.user.image || undefined}
                        name={attendee.user.name || undefined}
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-gray-900">
                            {attendee.user.name}
                          </p>
                          {attendee.role !== "participant" &&
                            getRoleBadge(attendee.role)}
                        </div>
                      </div>
                    </div>
                    {canManageEvent && attendee.userId !== session.user.id && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveAttendee(attendee.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <UserX className="w-4 h-4 mr-2" />
                        Remove
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Message All Attendees Modal */}
      <Dialog open={showMessageModal} onOpenChange={setShowMessageModal}>
        <DialogContent className="max-w-lg rounded-3xl">
          <DialogHeader>
            <DialogTitle>Message All Attendees</DialogTitle>
            <DialogDescription>
              Send a message to all confirmed attendees (
              {event.participants.length}{" "}
              {event.participants.length === 1 ? "person" : "people"})
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <MessageSquare className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-blue-900 mb-1">
                    This message will include event details
                  </p>
                  <p className="text-xs text-blue-700">
                    Recipients will see the event information along with your
                    message in their inbox
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="message-content">Message</Label>
              <Textarea
                id="message-content"
                value={messageToAll}
                onChange={(e) => setMessageToAll(e.target.value)}
                placeholder="Type your message to all attendees..."
                rows={6}
                className="resize-none"
              />
              <p className="text-xs text-gray-500">
                {messageToAll.length} / 500 characters
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowMessageModal(false);
                setMessageToAll("");
              }}
              disabled={sendingMessage}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSendMessageToAll}
              disabled={!messageToAll.trim() || sendingMessage}
              className="bg-linear-to-r from-celestial-blue to-picton-blue hover:opacity-90"
            >
              {sendingMessage ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Sending...
                </>
              ) : (
                <>
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Send to All
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Event Modal */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent className="max-w-md rounded-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-6 h-6" />
              Delete Event
            </DialogTitle>
            <DialogDescription className="pt-4">
              Are you sure you want to delete <strong>{event.title}</strong>?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteEvent}
              className="bg-red-600 hover:bg-red-700"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Event
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
