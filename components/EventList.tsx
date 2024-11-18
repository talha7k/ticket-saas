"use client";

import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import EventCard from "./EventCard";

export default function EventList() {
  const events = useQuery(api.events.get);

  if (!events) {
    return <div>Loading...</div>;
  }

  return (
    <main className="flex flex-col gap-4">
      {events.map((event) => (
        <EventCard key={event._id} event={event} />
      ))}

      {events.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No events available at the moment
        </div>
      )}
    </main>
  );
}
