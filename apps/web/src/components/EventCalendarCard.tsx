import { EventDTO } from "@repo/shared-types";
import { format, isSameDay } from "date-fns";
import { Sparkles } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";
import { Calendar } from "./ui/calendar";
import { Card } from "./ui/card";

const calendarStyles = `
  .has-event-dot {
    position: relative;
  }
  .has-event-dot::after {
    content: '';
    position: absolute;
    bottom: 3px;
    left: 50%;
    transform: translateX(-50%);
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background-color: #2563eb; /* blue-600 */
  }
`;

export function EventCalendarCard({ events }: { events: EventDTO[] }) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date()
  );
  const { data: session } = useSession();

  if (!session) return;

  const joinedEvents = events.filter((e) =>
    e.participants.some((p) => p.userId === session?.user.id)
  );
  const eventsOnSelectedDay = joinedEvents.filter(
    (e) => selectedDate && isSameDay(new Date(e.date), selectedDate)
  );
  const eventDays = events.map((event) => new Date(event.date));

  return (
    <Card className="rounded-3xl border-none shadow-lg bg-white overflow-hidden p-6">
      <style>{calendarStyles}</style>
      <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-blue-600" /> Your Schedule
      </h3>
      <Calendar
        mode="single"
        selected={selectedDate}
        onSelect={setSelectedDate}
        className={"rounded-2xl border border-slate-100 p-3 mb-6 mx-auto"}
        // --- ADD THESE PROPS ---
        modifiers={{
          hasEvent: eventDays,
        }}
        modifiersClassNames={{
          hasEvent: "has-event-dot",
        }}
      />

      <div className="space-y-4">
        <h4 className="text-xs font-bold uppercase text-slate-400 tracking-widest">
          {selectedDate ? format(selectedDate, "EEEE, MMM do") : "Agenda"}
        </h4>

        {eventsOnSelectedDay.length > 0 ? (
          eventsOnSelectedDay.map((e) => (
            <Link key={e.id} href={`/events/${e.id}`} className="block group">
              <div className="flex gap-3 p-3 rounded-2xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                <div className="w-1 h-10 bg-blue-600 rounded-full" />
                <div>
                  <p className="text-sm font-bold text-slate-900 group-hover:text-blue-600">
                    {e.title}
                  </p>
                  <p className="text-xs text-slate-500">
                    {e.start_time || "All day"}
                  </p>
                </div>
              </div>
            </Link>
          ))
        ) : (
          <p className="text-sm text-slate-400 italic py-4">
            No joined events today.
          </p>
        )}
      </div>
    </Card>
  );
}

export function EventCalendarSkeleton() {
  return (
    <Card className="rounded-3xl border-none shadow-lg bg-white p-6 space-y-6">
      {/* Header Skeleton */}
      <div className="flex items-center gap-2">
        <div className="w-5 h-5 rounded bg-slate-200 animate-pulse" />
        <div className="h-5 w-32 bg-slate-200 rounded animate-pulse" />
      </div>

      {/* Calendar Grid Skeleton */}
      <div className="space-y-2">
        <div className="h-64 w-full bg-slate-50 rounded-2xl animate-pulse flex flex-col p-4 gap-4">
          <div className="h-4 w-1/2 bg-slate-200 rounded mx-auto" />
          <div className="grid grid-cols-7 gap-2 flex-1">
            {[...Array(28)].map((_, i) => (
              <div
                key={i}
                className="aspect-square bg-slate-200/50 rounded-full"
              />
            ))}
          </div>
        </div>
      </div>

      {/* Agenda Skeleton */}
      <div className="space-y-4 pt-2">
        <div className="h-3 w-20 bg-slate-100 rounded animate-pulse" />
        <div className="flex gap-3 p-3">
          <div className="w-1 h-10 bg-slate-200 rounded-full animate-pulse" />
          <div className="space-y-2 flex-1">
            <div className="h-4 w-3/4 bg-slate-200 rounded animate-pulse" />
            <div className="h-3 w-1/4 bg-slate-100 rounded animate-pulse" />
          </div>
        </div>
      </div>
    </Card>
  );
}
