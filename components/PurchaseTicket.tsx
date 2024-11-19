"use client";

import { api } from "@/convex/_generated/api";
import { useMutation } from "convex/react";
import { Id } from "@/convex/_generated/dataModel";
import TimeAgo from "react-timeago";

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
  const isExpired = Date.now() > offerExpiresAt;

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

  const formatter = (value: number, unit: string) => {
    return `${value} ${unit}${value === 1 ? "" : "s"}`;
  };

  return (
    <div className="text-center p-4">
      <p className="text-lg font-semibold mb-2">
        Your ticket is ready for purchase!
      </p>
      <p className="text-gray-600 mb-4">
        Time remaining:{" "}
        {isExpired ? (
          "Expired"
        ) : (
          <TimeAgo date={offerExpiresAt} formatter={formatter} />
        )}
      </p>
      <button
        onClick={handlePurchase}
        disabled={isExpired}
        className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        Purchase Ticket
      </button>
    </div>
  );
}
