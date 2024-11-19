"use client";

import { api } from "@/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { Id } from "@/convex/_generated/dataModel";
import PurchaseTicket from "./PurchaseTicket";
import { WAITING_LIST_STATUS } from "@/convex/constants";

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
  const userTicket = useQuery(api.tickets.getUserTicketForEvent, {
    eventId,
    userId,
  });
  const availability = useQuery(api.events.getEventAvailability, { eventId });

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

  if (queuePosition === undefined || availability === undefined) {
    return <div>Loading...</div>;
  }

  if (userTicket) {
    return null;
  }

  return (
    <div>
      {(!queuePosition ||
        queuePosition.status === WAITING_LIST_STATUS.EXPIRED ||
        (queuePosition.status === WAITING_LIST_STATUS.OFFERED &&
          queuePosition.offerExpiresAt &&
          queuePosition.offerExpiresAt <= Date.now())) && (
        <>
          {availability.purchasedCount >= availability?.totalTickets ? (
            <div className="text-center p-4">
              <p className="text-lg font-semibold text-red-600">
                Sorry, this event is sold out
              </p>
            </div>
          ) : (
            <button
              onClick={handleJoinQueue}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Join Queue
            </button>
          )}
        </>
      )}
    </div>
  );
}
