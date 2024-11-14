"use client";

import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { useEffect, useState } from "react";

export default function PurchaseTicket({
  ticketId,
  userId,
  offerExpiresAt,
}: {
  ticketId: string;
  userId: string;
  offerExpiresAt: number;
}) {
  const [timeRemaining, setTimeRemaining] = useState<string>("");
  const ticket = useQuery(api.tickets.getById, { id: ticketId });

  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now();
      const remaining = offerExpiresAt - now;

      if (remaining <= 0) {
        setTimeRemaining("Expired");
        clearInterval(timer);
        return;
      }

      const minutes = Math.floor(remaining / 60000);
      const seconds = Math.floor((remaining % 60000) / 1000);
      setTimeRemaining(`${minutes}:${seconds.toString().padStart(2, "0")}`);
    }, 1000);

    return () => clearInterval(timer);
  }, [offerExpiresAt]);

  if (!ticket) return null;

  return (
    <div className="p-6 border rounded-lg shadow-lg max-w-md mx-auto">
      <div className="text-center mb-4">
        <div className="text-xl font-bold text-blue-600">{timeRemaining}</div>
        <div className="text-sm text-gray-500">Time remaining to purchase</div>
      </div>

      <h2 className="text-2xl font-bold mb-4">{ticket.title}</h2>
      <div className="space-y-2 mb-6">
        <p className="text-gray-600">{ticket.description}</p>
        <p className="font-semibold">Price: ${ticket.price}</p>
        <p>Location: {ticket.location}</p>
        <p>Date: {new Date(ticket.eventDate).toLocaleDateString()}</p>
      </div>

      <button
        className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition"
        onClick={() => {
          // Implement purchase logic here
          console.log("Purchase ticket");
        }}
      >
        Purchase Ticket
      </button>
    </div>
  );
}
