"use client";

import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { Id } from "@/convex/_generated/dataModel";
import {
  CalendarDays,
  MapPin,
  Ticket,
  Check,
  CircleArrowRight,
  LoaderCircle,
  XCircle,
} from "lucide-react";
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

  const renderQueuePosition = () => {
    if (!queuePosition || queuePosition.status !== "waiting") return null;

    if (availability.purchasedCount >= availability.totalTickets) {
      return (
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <Ticket className="w-5 h-5 text-gray-400 mr-2" />
            <span className="text-gray-600">Event is sold out</span>
          </div>
        </div>
      );
    }

    if (queuePosition.position === 2) {
      return (
        <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg border border-amber-100">
          <div className="flex items-center">
            <CircleArrowRight className="w-5 h-5 text-amber-500 mr-2" />
            <span className="text-amber-700 font-medium">
              You're next in line! (Queue position: {queuePosition.position})
            </span>
          </div>
          <div className="flex items-center">
            <LoaderCircle className="w-4 h-4 mr-1 animate-spin text-amber-500" />
            <span className="text-amber-600 text-sm">Waiting for ticket</span>
          </div>
        </div>
      );
    }

    return (
      <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-100">
        <div className="flex items-center">
          <LoaderCircle className="w-4 h-4 mr-2 animate-spin text-blue-500" />
          <span className="text-blue-700">Queue position</span>
        </div>
        <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-medium">
          #{queuePosition.position}
        </span>
      </div>
    );
  };

  const renderTicketStatus = () => {
    if (!user) return null;

    if (userTicket) {
      return (
        <div className="mt-4 flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-100">
          <div className="flex items-center">
            <Check className="w-5 h-5 text-green-600 mr-2" />
            <span className="text-green-700 font-medium">
              You have a ticket!
            </span>
          </div>
          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
            Confirmed
          </span>
        </div>
      );
    }

    if (queuePosition) {
      return (
        <div className="mt-4">
          {queuePosition.status === "offered" && (
            <PurchaseTicket eventId={eventId} />
          )}
          {renderQueuePosition()}
          {queuePosition.status === "expired" && (
            <div className="p-3 bg-red-50 rounded-lg border border-red-100">
              <span className="text-red-700 font-medium flex items-center">
                <XCircle className="w-5 h-5 mr-2" />
                Offer expired
              </span>
            </div>
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
                  ({availability.activeOffers}{" "}
                  {availability.activeOffers === 1 ? "person" : "people"} trying
                  to buy)
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
