"use client";

import EventCard from "@/components/EventCard";
import { Id } from "@/convex/_generated/dataModel";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { CalendarDays, MapPin, Ticket, Users } from "lucide-react";
import { useParams } from "next/navigation";
import Spinner from "@/components/Spinner";
import JoinQueue from "@/components/JoinQueue";
import { useUser } from "@clerk/nextjs";

export default function EventPage() {
  const { user } = useUser();
  const params = useParams();
  const event = useQuery(api.events.getById, {
    eventId: params.id as Id<"events">,
  });
  const availability = useQuery(api.events.getEventAvailability, {
    eventId: params.id as Id<"events">,
  });

  if (!event || !availability) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Left Column - Event Details */}
            <div className="space-y-8">
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-4">
                  {event.name}
                </h1>
                <p className="text-lg text-gray-600">{event.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                  <div className="flex items-center text-gray-600 mb-1">
                    <CalendarDays className="w-5 h-5 mr-2 text-blue-600" />
                    <span className="text-sm font-medium">Date</span>
                  </div>
                  <p className="text-gray-900">
                    {new Date(event.eventDate).toLocaleDateString()}
                  </p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                  <div className="flex items-center text-gray-600 mb-1">
                    <MapPin className="w-5 h-5 mr-2 text-blue-600" />
                    <span className="text-sm font-medium">Location</span>
                  </div>
                  <p className="text-gray-900">{event.location}</p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                  <div className="flex items-center text-gray-600 mb-1">
                    <Ticket className="w-5 h-5 mr-2 text-blue-600" />
                    <span className="text-sm font-medium">Price</span>
                  </div>
                  <p className="text-gray-900">£{event.price.toFixed(2)}</p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                  <div className="flex items-center text-gray-600 mb-1">
                    <Users className="w-5 h-5 mr-2 text-blue-600" />
                    <span className="text-sm font-medium">Availability</span>
                  </div>
                  <p className="text-gray-900">
                    {availability.remainingTickets} /{" "}
                    {availability.totalTickets} left
                  </p>
                </div>
              </div>

              {/* Additional Event Information */}
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-blue-900 mb-2">
                  Event Information
                </h3>
                <ul className="space-y-2 text-blue-700">
                  <li>• Please arrive 30 minutes before the event starts</li>
                  <li>• Tickets are non-refundable</li>
                  <li>• Age restriction: 18+</li>
                </ul>
              </div>
            </div>

            {/* Right Column - Ticket Purchase Card */}
            <div className="lg:pl-8">
              <div className="sticky top-8 flex flex-col gap-4">
                <EventCard eventId={params.id as Id<"events">} />

                {user && (
                  <JoinQueue
                    eventId={params.id as Id<"events">}
                    userId={user.id}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Sections could go here */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {availability.activeOffers > 0 && (
          <div className="bg-amber-50 border border-amber-100 rounded-lg p-4 mb-8">
            <p className="text-amber-700">
              <span className="font-medium">{availability.activeOffers}</span>{" "}
              {availability.activeOffers === 1 ? "person is" : "people are"}{" "}
              currently attempting to purchase tickets for this event.
            </p>
          </div>
        )}

        {availability.isSoldOut && (
          <div className="bg-red-50 border border-red-100 rounded-lg p-4">
            <p className="text-red-700 font-medium">
              This event is currently sold out.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
