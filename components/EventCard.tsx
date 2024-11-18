"use client";

import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { Id } from "@/convex/_generated/dataModel";
import Link from "next/link";

type EventCardProps = {
  event: {
    _id: Id<"events">;
    name: string;
    description: string;
    price: number;
    location: string;
    eventDate: number;
    totalTickets: number;
  };
};

export default function EventCard({ event }: EventCardProps) {
  const availability = useQuery(api.events.checkAvailability, {
    eventId: event._id,
  });

  if (!availability) {
    return null; // Skip rendering until we have availability data
  }

  const availableTickets = event.totalTickets - availability.purchasedCount;

  return (
    <Link
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
        <p className="text-gray-600">
          Available Tickets:{" "}
          <span className="font-medium">
            {availableTickets} / {event.totalTickets}
          </span>
          {availability.activeOffers > 0 && (
            <span className="text-yellow-600 ml-2">
              ({availability.activeOffers} pending)
            </span>
          )}
        </p>
        <p className="text-gray-700 mt-4 line-clamp-2">{event.description}</p>
      </div>
    </Link>
  );
}
