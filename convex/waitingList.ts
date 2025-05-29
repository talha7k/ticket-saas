import { internalMutation, mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { type Id } from "./_generated/dataModel"; // Using 'type Id' for type-only import
import { DURATIONS, WAITING_LIST_STATUS, TICKET_STATUS } from "./constants";
// Updated import to include api
import { api, internal } from "./_generated/api";

/**
 * Helper function to group waiting list entries by event ID.
 * Used for batch processing expired offers by event.
 */
function groupByEvent(
  offers: Array<{ eventId: Id<"events">; _id: Id<"waitingList"> }>
) {
  return offers.reduce(
    (acc, offer) => {
      const eventId = offer.eventId;
      if (!acc[eventId]) {
        acc[eventId] = [];
      }
      acc[eventId].push(offer);
      return acc;
    },
    {} as Record<Id<"events">, typeof offers>
  );
}

/**
 * Query to get a user's current position in the waiting list for an event.
 * Returns null if user is not in queue, otherwise returns their entry with position.
 */
export const getQueuePosition = query({
  args: {
    eventId: v.id("events"),
    userId: v.string(),
  },
  handler: async (ctx, { eventId, userId }) => {
    const entry = await ctx.db
      .query("waitingList")
      .withIndex("by_user_event", (q) =>
        q.eq("userId", userId).eq("eventId", eventId)
      )
      .filter((q) => q.neq(q.field("status"), WAITING_LIST_STATUS.EXPIRED))
      .first();

    if (!entry) return null;

    const peopleAhead = await ctx.db
      .query("waitingList")
      .withIndex("by_event_status", (q) => q.eq("eventId", eventId))
      .filter((q) =>
        q.and(
          q.lt(q.field("_creationTime"), entry._creationTime),
          q.or(
            q.eq(q.field("status"), WAITING_LIST_STATUS.WAITING),
            q.eq(q.field("status"), WAITING_LIST_STATUS.OFFERED)
          )
        )
      )
      .collect()
      .then((entries) => entries.length);

    return {
      ...entry,
      position: peopleAhead + 1,
    };
  },
});

/**
 * Mutation to process the waiting list queue and offer tickets to next eligible users.
 * Checks current availability considering purchased tickets and active offers.
 */
export const processQueue = mutation({
  args: {
    eventId: v.id("events"),
  },
  handler: async (ctx, { eventId }) => {
    const event = await ctx.db.get(eventId);
    if (!event) throw new Error("Event not found");

    // Calculate available spots
    // Note: Consider using api.events.checkAvailability or a similar shared query if this logic is duplicated.
    const eventDetailsForAvailability = await ctx.db
      .query("events")
      .filter((q) => q.eq(q.field("_id"), eventId))
      .first();

    if (!eventDetailsForAvailability) throw new Error("Event not found for availability check");

    const purchasedCount = await ctx.db
      .query("tickets")
      .withIndex("by_event", (q) => q.eq("eventId", eventId))
      .collect()
      .then(
        (tickets) =>
          tickets.filter(
            (t) =>
              t.status === TICKET_STATUS.VALID ||
              t.status === TICKET_STATUS.USED
          ).length
      );

    const nowForOffers = Date.now();
    const activeOffers = await ctx.db
      .query("waitingList")
      .withIndex("by_event_status", (q) =>
        q.eq("eventId", eventId).eq("status", WAITING_LIST_STATUS.OFFERED)
      )
      .collect()
      .then(
        (entries) =>
          entries.filter((e) => (e.offerExpiresAt ?? 0) > nowForOffers).length
      );

    const availableSpots = eventDetailsForAvailability.totalTickets - (purchasedCount + activeOffers);


    if (availableSpots <= 0) return;

    const waitingUsers = await ctx.db
      .query("waitingList")
      .withIndex("by_event_status", (q) =>
        q.eq("eventId", eventId).eq("status", WAITING_LIST_STATUS.WAITING)
      )
      .order("asc") // Ensure order by _creationTime is implied or add it explicitly if needed
      .take(availableSpots);

    const nowForOfferCreation = Date.now();
    for (const user of waitingUsers) {
      await ctx.db.patch(user._id, {
        status: WAITING_LIST_STATUS.OFFERED,
        offerExpiresAt: nowForOfferCreation + DURATIONS.TICKET_OFFER,
      });

      await ctx.scheduler.runAfter(
        DURATIONS.TICKET_OFFER,
        internal.waitingList.expireOffer, // Correct: internal functions are called via internal.module.function
        {
          waitingListId: user._id,
          eventId,
        }
      );
    }
  },
});

/**
 * Internal mutation to expire a single offer and process queue for next person.
 * Called by scheduled job when offer timer expires.
 */
export const expireOffer = internalMutation({
  args: {
    waitingListId: v.id("waitingList"),
    eventId: v.id("events"),
  },
  handler: async (ctx, { waitingListId, eventId }) => {
    const offer = await ctx.db.get(waitingListId);
    // Only expire if it's still an active offer
    if (!offer || offer.status !== WAITING_LIST_STATUS.OFFERED) {
        // Potentially log if offer not found or status mismatch, or just return
        return;
    }

    // Check if the offer has actually expired based on time, as an extra safeguard
    // though the scheduler should be accurate.
    if (offer.offerExpiresAt && offer.offerExpiresAt > Date.now()) {
        // Offer hasn't actually expired yet, perhaps scheduler ran early or there's a clock skew.
        // Decide on behavior: either re-schedule or log. For now, let's assume scheduler is king.
    }


    await ctx.db.patch(waitingListId, {
      status: WAITING_LIST_STATUS.EXPIRED,
    });

    // Corrected call to processQueue
    await ctx.runMutation(api.waitingList.processQueue, { eventId });
  },
});

/**
 * Periodic cleanup job that acts as a fail-safe for expired offers.
 */
export const cleanupExpiredOffers = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const expiredOffers = await ctx.db
      .query("waitingList")
      .filter((q) =>
        q.and(
          q.eq(q.field("status"), WAITING_LIST_STATUS.OFFERED),
          q.lt(q.field("offerExpiresAt"), now)
        )
      )
      .collect();

    if (expiredOffers.length === 0) {
        return; // No offers to clean up
    }

    const groupedByEventId = groupByEvent(expiredOffers);

    for (const eventIdStr of Object.keys(groupedByEventId)) {
      const offersForEvent = groupedByEventId[eventIdStr as Id<"events">]; // Cast because keys are strings
      
      await Promise.all(
        offersForEvent.map((offer) =>
          ctx.db.patch(offer._id, {
            status: WAITING_LIST_STATUS.EXPIRED,
          })
        )
      );
      
      // Corrected call to processQueue
      await ctx.runMutation(api.waitingList.processQueue, { eventId: eventIdStr as Id<"events"> });
    }
  },
});

export const releaseTicket = mutation({
  args: {
    eventId: v.id("events"),
    waitingListId: v.id("waitingList"),
  },
  handler: async (ctx, { eventId, waitingListId }) => {
    const entry = await ctx.db.get(waitingListId);
    if (!entry || entry.status !== WAITING_LIST_STATUS.OFFERED) {
      throw new Error("No valid ticket offer found or offer is not in OFFERED state.");
    }

    await ctx.db.patch(waitingListId, {
      status: WAITING_LIST_STATUS.EXPIRED, // Or perhaps a different status like 'released' or 'cancelled_by_user'
    });

    // Corrected call to processQueue
    await ctx.runMutation(api.waitingList.processQueue, { eventId });
  },
});