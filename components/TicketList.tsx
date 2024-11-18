"use client";

import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import Link from "next/link";

export default function TicketList() {
  const events = useQuery(api.events.get);

  if (!events) {
    return <div>Loading...</div>;
  }

  return (
    <main className="flex flex-col gap-4">
      {events.map((event) => (
        <Link
          key={event._id}
          href={`/event/${event._id}`}
          className="p-4 border rounded-lg hover:shadow-md transition-shadow"
        >
          <h2 className="text-xl font-bold">{event.name}</h2>
          <div className="mt-2 space-y-2">
            <p className="text-lg text-green-600 font-semibold">
              ${event.price.toFixed(2)}
            </p>
            <p className="text-gray-600">Location: {event.location}</p>
            <p className="text-gray-600">
              Date: {new Date(event.eventDate).toLocaleDateString()}
            </p>
            <p className="text-gray-600">Total Tickets: {event.totalTickets}</p>
            <p className="text-gray-700 mt-4 line-clamp-2">
              {event.description}
            </p>
          </div>
        </Link>
      ))}

      {events.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No events available at the moment
        </div>
      )}
    </main>
  );
}
