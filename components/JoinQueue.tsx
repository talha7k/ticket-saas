"use client";

import { api } from "@/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { Id } from "@/convex/_generated/dataModel";
import PurchaseTicket from "./PurchaseTicket";

export default function JoinQueue({
  eventId,
  userId,
}: {
  eventId: Id<"events">;
  userId: string;
}) {
  const joinWaitingList = useMutation(api.events.joinWaitingList);
  const queuePosition = useQuery(api.waitingList.getQueuePosition, {
    eventId,
    userId,
  });

  const handleJoinQueue = async () => {
    try {
      const result = await joinWaitingList({ eventId, userId });
      if (result.success) {
        console.log("Successfully joined waiting list");
      }
    } catch (error) {
      console.error("Error joining waiting list:", error);
    }
  };

  if (queuePosition === undefined) {
    return <div>Loading...</div>;
  }

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
          eventId={eventId}
          userId={userId}
          waitingListId={queuePosition._id}
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
