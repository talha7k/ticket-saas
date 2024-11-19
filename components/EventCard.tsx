"use client";

import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { Id } from "@/convex/_generated/dataModel";
import { CalendarDays, MapPin, Ticket, Check } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import PurchaseTicket from "./PurchaseTicket";

export default function EventCard({ eventId }: { eventId: Id<"events"> }) {
  const { user } = useUser();
  const event = useQuery(api.events.getById, { eventId });
  const availability = useQuery(api.events.getEventAvailability, { eventId });
  const userTicket = useQuery(api.tickets.getUserTicketForEvent, {
    eventId,
    userId: user?.id ?? "",
  });
  const queuePosition = useQuery(api.waitingList.getQueuePosition, {
    eventId,
    userId: user?.id ?? "",
  });

  if (!event || !availability) {
    return null;
  }

  const renderTicketStatus = () => {
    if (!user) return null;

    if (userTicket) {
      return (
        <div className="mt-4 flex items-center p-3 bg-green-50 rounded-lg border border-green-100">
          <Check className="w-5 h-5 text-green-600 mr-2" />
          <span className="text-green-700 font-medium">You have a ticket!</span>
        </div>
      );
    }

    if (queuePosition) {
      return (
        <div className="mt-4 p-3 bg-amber-50 rounded-lg border border-amber-100">
          {queuePosition.status === "offered" && (
            <PurchaseTicket
              eventId={eventId}
              userId={user?.id ?? ""}
              waitingListId={queuePosition._id}
              offerExpiresAt={queuePosition.offerExpiresAt ?? 0}
            />
          )}

          {queuePosition.status === "waiting" && (
            <span className="text-amber-700 font-medium">
              {availability.purchasedCount >= availability.totalTickets
                ? "Event sold out! :("
                : `Queue position: #${queuePosition.position}`}
            </span>
          )}

          {queuePosition.status === "expired" && (
            <span className="text-red-700 font-medium">
              Queue position expired
            </span>
          )}

          {queuePosition.status === "purchased" && (
            <span className="text-green-700 font-medium">
              Ticket purchased!
            </span>
          )}
        </div>
      );
    }

    return null;
  };

  return (
    <Link
      href={`/event/${eventId}`}
      className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100"
    >
      <div className="p-6">
        <div className="flex justify-between items-start">
          <h2 className="text-2xl font-bold text-gray-900">{event.name}</h2>
          <div className="flex flex-col items-end gap-2">
            <span className="px-4 py-1.5 bg-green-50 text-green-700 font-semibold rounded-full">
              £{event.price.toFixed(2)}
            </span>
            {availability.purchasedCount >= availability.totalTickets && (
              <span className="px-4 py-1.5 bg-red-50 text-red-700 font-semibold rounded-full text-sm">
                Sold Out
              </span>
            )}
          </div>
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
              {availability.totalTickets - availability.purchasedCount} /{" "}
              {availability.totalTickets} available
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

        {renderTicketStatus()}
      </div>
    </Link>
  );
}
