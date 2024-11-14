"use client";

import { api } from "@/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { Id } from "@/convex/_generated/dataModel";
import PurchaseTicket from "./PurchaseTicket";

export default function JoinQueue({
  ticketId,
  userId,
}: {
  ticketId: Id<"tickets">;
  userId: string;
}) {
  const joinQueue = useMutation(api.waitingList.join);
  const queuePosition = useQuery(api.waitingList.getQueuePosition, {
    ticketId,
    userId,
  });

  const handleJoinQueue = async () => {
    try {
      const result = await joinQueue({ ticketId, userId });
      if (result.success) {
        console.log("success", result);
      } else {
        console.error("Failed to join queue:", result.message);
      }
    } catch (error) {
      console.error("Error joining queue:", error);
    }
  };

  return (
    <div>
      {queuePosition?.status === "waiting" && (
        <div className="text-center p-4">
          <p className="text-lg font-semibold">
            Your position in queue: {queuePosition.position}
          </p>
          <p className="text-gray-600">
            Please wait while we process your request...
          </p>
        </div>
      )}

      {queuePosition?.status === "offered" && queuePosition.offerExpiresAt && (
        <PurchaseTicket
          ticketId={ticketId}
          userId={userId}
          offerExpiresAt={queuePosition.offerExpiresAt}
        />
      )}

      {(!queuePosition || queuePosition.status === "expired") && (
        <button
          onClick={handleJoinQueue}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          Join Queue
        </button>
      )}
    </div>
  );
}
