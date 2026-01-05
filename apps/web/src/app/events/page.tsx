"use client";

import { format } from "date-fns";
import {
  Calendar as CalendarIcon,
  CheckCircle,
  ChevronRight,
  Filter,
  Globe,
  Loader2,
  MapPin,
  Search,
  Users,
} from "lucide-react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

import { EventCalendarCard } from "@/components/EventCalendarCard";
import { getAllEvents } from "@/services/event";
import { EventDTO } from "@repo/shared-types";

export default function EventsPage() {
  const { data: session } = useSession();
  const [events, setEvents] = useState<EventDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const result = await getAllEvents();
        console.log(result.data);
        setEvents(result.data || []);
      } catch (error) {
        console.error("Failed to fetch events:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const filteredEvents = events.filter(
    (e) =>
      e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.community?.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading)
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" />
      </div>
    );

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      {/* --- 1. MODERN HEADER --- */}
      <section className="bg-slate-900 py-16 mb-8 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <Badge className="mb-4 bg-blue-500/20 text-blue-300 border-none px-3 py-1">
            <CalendarIcon className="mr-2 h-3 w-3" />
            University Calendar
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 tracking-tight">
            Discover <span className="text-blue-400">Experiences.</span>
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl">
            From tech workshops to social mixers—find what’s happening across
            your communities and the wider campus.
          </p>
        </div>
        <div className="absolute top-0 right-0 w-125 h-125 bg-blue-600/10 rounded-full blur-3xl -mr-40 -mt-40" />
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* --- 2. LEFT SIDE: EVENT DISCOVERY FEED (8 Cols) --- */}
          <div className="lg:col-span-8 space-y-6">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-3xl shadow-sm border border-slate-100">
              <div className="relative w-full md:w-96">
                <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search events or clubs..."
                  className="pl-10 rounded-2xl border-none bg-slate-50 focus-visible:ring-blue-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex gap-2 w-full md:w-auto">
                <Button
                  variant="outline"
                  className="rounded-2xl gap-2 border-slate-200"
                >
                  <Filter className="h-4 w-4" /> Filters
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              {filteredEvents.length > 0 ? (
                filteredEvents.map((event) => {
                  const isJoined = event.participants.some(
                    (p) => p.userId === session?.user?.id
                  );
                  return (
                    <Link key={event.id} href={`/events/${event.id}`}>
                      <Card className="group overflow-hidden border-none shadow-md hover:shadow-xl transition-all duration-500 rounded-3xl bg-white mb-4 relative">
                        <div className="flex flex-col md:flex-row h-full">
                          <div className="relative w-full md:w-64 h-48 md:h-auto overflow-hidden">
                            <Image
                              src={event.coverImage || "/placeholder-event.jpg"}
                              alt={event.title}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-700"
                            />
                            <div className="absolute top-3 left-3 flex flex-col gap-2">
                              {/* Added: Visual feedback directly on the image for mobile/quick scanning */}
                              {isJoined ? (
                                <Badge className="bg-green-500 text-white border-none shadow-sm">
                                  <CheckCircle className="w-3 h-3 mr-1" />{" "}
                                  Joined
                                </Badge>
                              ) : (
                                event.public && (
                                  <Badge className="bg-white/90 text-slate-900 backdrop-blur-sm border-none shadow-sm">
                                    <Globe className="w-3 h-3 mr-1 text-blue-600" />{" "}
                                    Public
                                  </Badge>
                                )
                              )}
                            </div>
                          </div>

                          <CardContent className="p-6 flex-1 flex flex-col justify-between">
                            <div>
                              <div className="flex justify-between items-start mb-2">
                                <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">
                                  {event.community?.name}
                                </span>
                                <span className="text-xs text-slate-400">
                                  {format(new Date(event.date), "MMM d, yyyy")}
                                </span>
                              </div>
                              <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors mb-2 line-clamp-1">
                                {event.title}
                              </h3>
                              <p className="text-slate-500 text-sm line-clamp-2 mb-4 leading-relaxed">
                                {event.description}
                              </p>
                            </div>

                            <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                              <div className="flex gap-4 text-xs text-slate-500 font-medium">
                                <div className="flex items-center gap-1">
                                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                                  {event.location || "Online"}
                                </div>
                                <div className="flex items-center gap-1">
                                  <Users className="w-3.5 h-3.5 text-slate-400" />
                                  {event.participants?.length || 0} attending
                                </div>
                                {/* Added: Inline status indicator */}
                                {isJoined && (
                                  <div className="flex items-center gap-1 text-green-600 font-bold">
                                    <CheckCircle className="w-3.5 h-3.5" />
                                    {"You're in"}
                                  </div>
                                )}
                              </div>
                              <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all">
                                <ChevronRight className="w-4 h-4" />
                              </div>
                            </div>
                          </CardContent>
                        </div>
                      </Card>
                    </Link>
                  );
                })
              ) : (
                <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed">
                  <p className="text-slate-400">
                    No events matching your search.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* --- 3. RIGHT SIDE: YOUR AGENDA (4 Cols) --- */}
          <aside className="lg:col-span-4 space-y-8">
            <EventCalendarCard events={filteredEvents} />

            <div className="rounded-3xl bg-linear-to-br from-blue-600 to-indigo-700 p-6 text-white shadow-xl relative overflow-hidden">
              <div className="relative z-10">
                <h4 className="font-bold text-lg mb-2">Host your own?</h4>
                <p className="text-blue-100 text-xs mb-4 leading-relaxed">
                  Boost your community engagement by organizing a meeting or
                  workshop.
                </p>
                <Link href="/communities">
                  <Button className="w-full bg-white text-blue-600 hover:bg-blue-50 rounded-xl font-bold">
                    Go to Your Communities
                  </Button>
                </Link>
              </div>
              <CalendarIcon className="absolute -bottom-4 -right-4 h-24 w-24 text-white/10 -rotate-12" />
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
