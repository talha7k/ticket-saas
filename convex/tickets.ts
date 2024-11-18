import { query } from "./_generated/server";
import { v } from "convex/values";
import { mutation } from "./_generated/server";
import { Id } from "./_generated/dataModel";

export const get = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("tickets").collect();
  },
});

export const getById = query({
  args: { id: v.string() },
  handler: async (ctx, { id }) => {
    return await ctx.db
      .query("tickets")
      .filter((q) => q.eq(q.field("_id"), id))
      .first();
  },
});

// Helper function to check ticket availability
// This query checks if tickets are still available for purchase
// It considers both purchased tickets and active offers when calculating availability
export const checkTicketAvailability = query({
  args: { ticketId: v.id("tickets") },
  handler: async (ctx, { ticketId }) => {
    // First get the ticket document
    const ticket = await ctx.db.get(ticketId);
    if (!ticket) throw new Error("Ticket not found");

    // Count how many tickets have already been purchased
    // We query the waitingList table and count entries with status "purchased"
    const purchasedCount = await ctx.db
      .query("waitingList")
      .withIndex("by_event_status", (q) =>
        q.eq("eventId", ticket.eventId).eq("status", "purchased")
      )
      .collect()
      .then((entries) => entries.length);

    // Count how many valid offers are currently outstanding
    // An offer is valid if it hasn't expired yet (offerExpiresAt > now)
    const now = Date.now();
    const activeOffers = await ctx.db
      .query("waitingList")
      .withIndex("by_event_status", (q) =>
        q.eq("eventId", ticket.eventId).eq("status", "offered")
      )
      .filter((q) => q.gt(q.field("offerExpiresAt"), now))
      .collect()
      .then((entries) => entries.length);

    // Calculate remaining available spots by subtracting purchased tickets
    // and active offers from total quantity
    // Get the event to check total tickets
    const event = await ctx.db.get(ticket.eventId);
    if (!event) throw new Error("Event not found");

    const availableSpots = event.totalTickets - (purchasedCount + activeOffers);

    // Return availability info including:
    // - whether any spots are available
    // - number of available spots
    // - total ticket quantity
    // - count of purchased tickets
    // - count of active offers
    return {
      available: availableSpots > 0,
      availableSpots,
      totalTickets: event.totalTickets,
      purchasedCount,
      activeOffers,
    };
  },
});

// Join waiting list
export const joinWaitingList = mutation({
  args: { eventId: v.id("events"), userId: v.string() },
  handler: async (ctx, { eventId, userId }) => {
    // Check if user is already in waiting list
    const existingEntry = await ctx.db
      .query("waitingList")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("eventId"), eventId))
      .first();

    if (existingEntry) {
      throw new Error("Already in waiting list");
    }

    // Check availability
    const { available } = await ctx.db
      .query("tickets")
      .withIndex("by_event", (q) => q.eq("eventId", eventId))
      .collect()
      .then(async (tickets) => {
        const purchasedCount = tickets.filter(
          (t) => t.status === "valid" || t.status === "used"
        ).length;
        const event = await ctx.db.get(eventId);
        if (!event) throw new Error("Event not found");
        return { available: purchasedCount < event.totalTickets };
      });

    if (!available) {
      throw new Error("No tickets available");
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
  },
});

// Clean up expired offers
export const cleanupExpiredOffers = mutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const expiredOffers = await ctx.db
      .query("waitingList")
      .withIndex("by_expiry", (q) => q.lt("offerExpiresAt", now))
      .filter((q) => q.eq(q.field("status"), "offered"))
      .collect();

    for (const offer of expiredOffers) {
      await ctx.db.patch(offer._id, {
        status: "expired",
      });
    }
  },
});
