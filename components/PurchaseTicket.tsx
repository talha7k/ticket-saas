"use client";

import { api } from "@/convex/_generated/api";
import { useMutation } from "convex/react";
import { Id } from "@/convex/_generated/dataModel";
import { useEffect, useState } from "react";

export default function PurchaseTicket({
  eventId,
  userId,
  waitingListId,
  offerExpiresAt,
}: {
  eventId: Id<"events">;
  userId: string;
  waitingListId: Id<"waitingList">;
  offerExpiresAt: number;
}) {
  const purchaseTicket = useMutation(api.events.purchaseTicket);
  const [timeLeft, setTimeLeft] = useState<string>("");

  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now();
      const diff = offerExpiresAt - now;

      if (diff <= 0) {
        setTimeLeft("Expired");
        clearInterval(timer);
      } else {
        const minutes = Math.floor(diff / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);
        setTimeLeft(`${minutes}:${seconds.toString().padStart(2, "0")}`);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [offerExpiresAt]);

  const handlePurchase = async () => {
    try {
      await purchaseTicket({
        eventId,
        userId,
        waitingListId,
      });
    } catch (error) {
      console.error("Error purchasing ticket:", error);
    }
  };

  return (
    <div className="text-center p-4">
      <p className="text-lg font-semibold mb-2">
        Your ticket is ready for purchase!
      </p>
      <p className="text-gray-600 mb-4">Time remaining: {timeLeft}</p>
      <button
        onClick={handlePurchase}
        className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition"
      >
        Purchase Ticket
      </button>
    </div>
  );
}
