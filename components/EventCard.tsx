"use client";

import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { Id } from "@/convex/_generated/dataModel";
import Link from "next/link";
import { CalendarDays, MapPin, Ticket } from "lucide-react";

export default function EventCard({ eventId }: { eventId: Id<"events"> }) {
  const availability = useQuery(api.events.checkAvailability, {
    eventId,
  });
  const event = useQuery(api.events.getById, { eventId });

  if (!event) {
    return null;
  }

  if (!availability) {
    return null; // Skip rendering until we have availability data
  }

  const availableTickets = event.totalTickets - availability.purchasedCount;

  return (
    <Link
      href={`/event/${event._id}`}
      className="group relative overflow-hidden bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100"
    >
      <div className="p-6">
        <div className="flex justify-between items-start">
          <h2 className="text-2xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
            {event.name}
          </h2>
          <span className="px-4 py-1.5 bg-green-50 text-green-700 font-semibold rounded-full">
            ${event.price.toFixed(2)}
          </span>
        </div>

        <div className="mt-4 space-y-3">
          <div className="flex items-center text-gray-600">
            <MapPin className="w-4 h-4 mr-2" />
            <span>{event.location}</span>
          </div>

          <div className="flex items-center text-gray-600">
            <CalendarDays className="w-4 h-4 mr-2" />
            <span>{new Date(event.eventDate).toLocaleDateString()}</span>
          </div>

          <div className="flex items-center text-gray-600">
            <Ticket className="w-4 h-4 mr-2" />
            <span>
              {availableTickets} / {event.totalTickets} available
              {availability.activeOffers > 0 && (
                <span className="ml-2 text-amber-600 text-sm">
                  ({availability.activeOffers} pending)
                </span>
              )}
            </span>
          </div>
        </div>

        <p className="mt-4 text-gray-600 line-clamp-2 text-sm">
          {event.description}
        </p>
      </div>

      <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
    </Link>
  );
}
