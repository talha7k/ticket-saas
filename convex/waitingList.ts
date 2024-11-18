import { internalMutation, mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

// Get user's position in queue
export const getQueuePosition = query({
  args: {
    eventId: v.id("events"),
    userId: v.string(),
  },
  handler: async (ctx, { eventId, userId }) => {
    const entry = await ctx.db
      .query("waitingList")
      .withIndex("by_event_status", (q) => q.eq("eventId", eventId))
      .filter((q) => q.eq(q.field("userId"), userId))
      .first();

    if (!entry) return null;

    // Get total number of people ahead in line (with status "waiting" or "offered")
    const peopleAhead = await ctx.db
      .query("waitingList")
      .withIndex("by_event_status", (q) => q.eq("eventId", eventId))
      .filter((q) =>
        q.and(
          q.lt(q.field("_creationTime"), entry._creationTime),
          q.or(
            q.eq(q.field("status"), "waiting"),
            q.eq(q.field("status"), "offered")
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

// Process the queue and offer tickets to waiting users
export const processQueue = mutation({
  args: {
    eventId: v.id("events"),
  },
  handler: async (ctx, { eventId }) => {
    const event = await ctx.db.get(eventId);
    if (!event) throw new Error("Event not found");

    // Get current availability
    const { availableSpots } = await ctx.db
      .query("events")
      .filter((q) => q.eq(q.field("_id"), eventId))
      .first()
      .then(async (event) => {
        if (!event) throw new Error("Event not found");

        // Count purchased tickets
        const purchasedCount = await ctx.db
          .query("tickets")
          .withIndex("by_event", (q) => q.eq("eventId", eventId))
          .collect()
          .then(
            (tickets) =>
              tickets.filter((t) => t.status === "valid" || t.status === "used")
                .length
          );

        // Count active offers
        const now = Date.now();
        const activeOffers = await ctx.db
          .query("waitingList")
          .withIndex("by_event_status", (q) =>
            q.eq("eventId", eventId).eq("status", "offered")
          )
          .collect()
          .then(
            (entries) =>
              entries.filter((e) => (e.offerExpiresAt ?? 0) > now).length
          );

        return {
          availableSpots: event.totalTickets - (purchasedCount + activeOffers),
        };
      });

    if (availableSpots <= 0) return; // No spots available

    // Find next waiting users up to available spots
    const waitingUsers = await ctx.db
      .query("waitingList")
      .withIndex("by_event_status", (q) =>
        q.eq("eventId", eventId).eq("status", "waiting")
      )
      .order("asc")
      .take(availableSpots);

    // Offer tickets to these users
    const now = Date.now();
    const OFFER_DURATION = 15 * 60 * 1000; // 15 minutes

    for (const user of waitingUsers) {
      await ctx.db.patch(user._id, {
        status: "offered",
        offerExpiresAt: now + OFFER_DURATION,
      });
    }
  },
});

// Clean up expired offers and process queue
export const cleanupExpiredOffers = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();

    // Find expired offers
    const expiredOffers = await ctx.db
      .query("waitingList")
      .withIndex("by_expiry", (q) => q.lt("offerExpiresAt", now))
      .filter((q) => q.eq(q.field("status"), "offered"))
      .collect();

    // Group expired offers by event
    const offersByEvent = expiredOffers.reduce(
      (acc, offer) => {
        const eventId = offer.eventId;
        if (!acc[eventId]) {
          acc[eventId] = [];
        }
        acc[eventId].push(offer);
        return acc;
      },
      {} as Record<Id<"events">, typeof expiredOffers>
    );

    // Process expired offers by event
    for (const [eventId, offers] of Object.entries(offersByEvent)) {
      // Mark offers as expired
      for (const offer of offers) {
        await ctx.db.patch(offer._id, {
          status: "expired",
        });
      }

      // Process queue for this event to fill newly available spots
      await processQueue(ctx, { eventId: eventId as Id<"events"> });
    }
  },
});
