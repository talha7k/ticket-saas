import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

export const get = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("events").collect();
  },
});

export const getById = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, { eventId }) => {
    return await ctx.db.get(eventId);
  },
});

// Helper function to check ticket availability for an event
export const checkAvailability = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, { eventId }) => {
    const event = await ctx.db.get(eventId);
    if (!event) throw new Error("Event not found");

    // Count total purchased tickets
    const purchasedCount = await ctx.db
      .query("tickets")
      .withIndex("by_event", (q) => q.eq("eventId", eventId))
      .collect()
      .then(
        (tickets) =>
          tickets.filter((t) => t.status === "valid" || t.status === "used")
            .length
      );

    // Count current valid offers
    const now = Date.now();
    const activeOffers = await ctx.db
      .query("waitingList")
      .withIndex("by_event_status", (q) =>
        q.eq("eventId", eventId).eq("status", "offered")
      )
      .collect()
      .then(
        (entries) => entries.filter((e) => (e.offerExpiresAt ?? 0) > now).length
      );

    const availableSpots = event.totalTickets - (purchasedCount + activeOffers);

    return {
      available: availableSpots > 0,
      availableSpots,
      totalTickets: event.totalTickets,
      purchasedCount,
      activeOffers,
    };
  },
});

// Join waiting list for an event
export const joinWaitingList = mutation({
  args: { eventId: v.id("events"), userId: v.string() },
  handler: async (ctx, { eventId, userId }) => {
    // Check if user is already in waiting list for this event
    const existingEntry = await ctx.db
      .query("waitingList")
      .withIndex("by_event_status", (q) => q.eq("eventId", eventId))
      .collect()
      .then((entries) => entries.find((e) => e.userId === userId));

    if (existingEntry) {
      throw new Error("Already in waiting list for this event");
    }

    // Check event exists and has availability
    const event = await ctx.db.get(eventId);
    if (!event) throw new Error("Event not found");

    const { available } = await checkAvailability(ctx, { eventId });
    if (!available) {
      throw new Error("No tickets available for this event");
    }

    // Add to waiting list with immediate offer
    const now = Date.now();
    const OFFER_DURATION = 15 * 60 * 1000; // 15 minutes

    await ctx.db.insert("waitingList", {
      eventId,
      userId,
      status: "offered",
      offerExpiresAt: now + OFFER_DURATION,
    });

    return { success: true };
  },
});

// Clean up expired offers
export const cleanupExpiredOffers = mutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();

    // Get all waiting list entries with status "offered"
    const expiredOffers = await ctx.db
      .query("waitingList")
      .filter((q) =>
        q.and(
          q.eq(q.field("status"), "offered"),
          q.lt(q.field("offerExpiresAt"), now)
        )
      )
      .collect();

    for (const offer of expiredOffers) {
      await ctx.db.patch(offer._id, {
        status: "expired",
      });
    }
  },
});

// Purchase ticket
export const purchaseTicket = mutation({
  args: {
    eventId: v.id("events"),
    userId: v.string(),
    waitingListId: v.id("waitingList"),
  },
  handler: async (ctx, { eventId, userId, waitingListId }) => {
    const waitingListEntry = await ctx.db.get(waitingListId);
    if (!waitingListEntry || waitingListEntry.status !== "offered") {
      throw new Error("Invalid or expired offer");
    }

    const now = Date.now();
    if ((waitingListEntry.offerExpiresAt ?? 0) <= now) {
      throw new Error("Offer has expired");
    }

    // Create ticket
    await ctx.db.insert("tickets", {
      eventId,
      userId,
      purchasedAt: now,
      status: "valid",
    });

    // Update waiting list entry
    await ctx.db.patch(waitingListId, {
      status: "purchased",
      purchasedAt: now,
    });
  },
});

// Get user's tickets with event information
export const getUserTickets = query({
  args: { userId: v.string() },
  handler: async (ctx, { userId }) => {
    const tickets = await ctx.db
      .query("tickets")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const ticketsWithEvents = await Promise.all(
      tickets.map(async (ticket) => {
        const event = await ctx.db.get(ticket.eventId);
        return {
          ...ticket,
          event,
        };
      })
    );

    return ticketsWithEvents;
  },
});

// Get user's waiting list entries with event information
export const getUserWaitingList = query({
  args: { userId: v.string() },
  handler: async (ctx, { userId }) => {
    const entries = await ctx.db
      .query("waitingList")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const entriesWithEvents = await Promise.all(
      entries.map(async (entry) => {
        const event = await ctx.db.get(entry.eventId);
        return {
          ...entry,
          event,
        };
      })
    );

    return entriesWithEvents;
  },
});
