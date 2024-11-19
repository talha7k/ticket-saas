"use client";

import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useQuery } from "convex/react";
import {
  CalendarDays,
  IdCard,
  MapPin,
  Ticket as TicketIcon,
  User,
} from "lucide-react";
import QRCode from "react-qr-code";
import Spinner from "./Spinner";

export default function Ticket({ ticketId }: { ticketId: Id<"tickets"> }) {
  const ticket = useQuery(api.tickets.getTicketWithDetails, { ticketId });
  const user = useQuery(api.users.getUserById, {
    userId: ticket?.userId ?? "",
  });

  if (!ticket || !ticket.event || !user) {
    // Loading spinner
    return <Spinner />;
  }

  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-xl border border-gray-100">
      {/* Event Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
        <h2 className="text-2xl font-bold text-white">{ticket.event.name}</h2>
      </div>

      {/* Ticket Content */}
      <div className="p-6">
        <div className="grid grid-cols-2 gap-6">
          {/* Left Column - Event Details */}
          <div className="space-y-4">
            <div className="flex items-center text-gray-600">
              <CalendarDays className="w-5 h-5 mr-3 text-blue-600" />
              <div>
                <p className="text-sm text-gray-500">Date</p>
                <p className="font-medium">
                  {new Date(ticket.event.eventDate).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="flex items-center text-gray-600">
              <MapPin className="w-5 h-5 mr-3 text-blue-600" />
              <div>
                <p className="text-sm text-gray-500">Location</p>
                <p className="font-medium">{ticket.event.location}</p>
              </div>
            </div>

            <div className="flex items-center text-gray-600">
              <User className="w-5 h-5 mr-3 text-blue-600" />
              <div>
                <p className="text-sm text-gray-500">Ticket Holder</p>
                <p className="font-medium">{user.name}</p>
                <p className="text-sm text-gray-500">{user.email}</p>
              </div>
            </div>

            <div className="flex items-center text-gray-600">
              <IdCard className="w-5 h-5 mr-3 text-blue-600" />
              <div>
                <p className="text-sm text-gray-500">Ticket Holder ID</p>
                <p className="font-medium">{user.userId}</p>
              </div>
            </div>

            <div className="flex items-center text-gray-600">
              <TicketIcon className="w-5 h-5 mr-3 text-blue-600" />
              <div>
                <p className="text-sm text-gray-500">Ticket Price</p>
                <p className="font-medium">£{ticket.event.price.toFixed(2)}</p>
              </div>
            </div>
          </div>

          {/* Right Column - QR Code */}
          <div className="flex flex-col items-center justify-center border-l border-gray-200 pl-6">
            <div className="bg-gray-100 p-4 rounded-lg">
              <QRCode value={ticket._id} className="w-32 h-32" />
            </div>
            <p className="mt-2 text-sm text-gray-500">
              Ticket ID: {ticket._id}
            </p>
          </div>
        </div>

        {/* Additional Information */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h3 className="text-sm font-medium text-gray-900 mb-2">
            Important Information
          </h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Please arrive at least 30 minutes before the event</li>
            <li>• Have your ticket QR code ready for scanning</li>
            <li>• This ticket is non-transferable</li>
          </ul>
        </div>
      </div>

      {/* Ticket Footer */}
      <div className="bg-gray-50 px-6 py-4 flex justify-between items-center">
        <span className="text-sm text-gray-500">
          Purchase Date: {new Date(ticket.purchasedAt).toLocaleString()}
        </span>
        <span className="text-sm font-medium text-blue-600">Valid Ticket</span>
      </div>
    </div>
  );
}
