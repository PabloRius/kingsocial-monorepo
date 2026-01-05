"use client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate } from "@/lib/formatters";
import { EventDTO } from "@repo/shared-types";
import { Calendar, MapPin, Plus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export const CommunityEvents = ({
  events,
  communityId,
  isAdmin,
}: {
  events: EventDTO[];
  communityId: string;
  isAdmin: boolean;
}) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-slate-900">Upcoming Events</h3>
        {isAdmin && (
          <Button asChild className="rounded-xl bg-blue-600">
            <Link href={`/communities/${communityId}/create_event`}>
              <Plus className="w-4 h-4 mr-2" /> Create Event
            </Link>
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((event) => (
          <Link key={event.id} href={`/events/${event.id}`}>
            <Card className="group overflow-hidden border-none shadow-md hover:shadow-xl transition-all rounded-3xl bg-white">
              <div className="relative h-40">
                <Image
                  src={event.coverImage || "/placeholder.jpg"}
                  alt={event.title}
                  fill
                  className="object-cover transition-transform group-hover:scale-105"
                />
                <Badge className="absolute top-3 right-3 bg-white/90 text-slate-900 backdrop-blur-sm border-none">
                  {event.location_format}
                </Badge>
              </div>
              <CardContent className="p-5">
                <h4 className="font-bold text-lg mb-2 line-clamp-1">
                  {event.title}
                </h4>
                <div className="space-y-2 text-sm text-slate-500">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-blue-500" />{" "}
                    {formatDate(event.date)}
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-red-500" />{" "}
                    {event.location || "Online"}
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
};
