import { internalMutation, mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

// Join the waiting list
export const join = mutation({
  args: {
    ticketId: v.id("tickets"),
    userId: v.string(),
  },
  handler: async (ctx, { ticketId, userId }) => {
    const ticket = await ctx.db.get(ticketId);

    if (!ticket) {
      return { success: false, message: "Ticket not found" };
    }

    // Check if user is already in queue
    const existing = await ctx.db
      .query("waitingList")
      .filter((q) =>
        q.and(
          q.eq(q.field("ticketId"), ticketId),
          q.eq(q.field("userId"), userId),
          q.neq(q.field("status"), "expired")
        )
      )
      .first();

    if (existing) {
      return { success: false, message: "Already in queue" };
    }

    // Get current number of active offers
    const activeOffers = await ctx.db
      .query("waitingList")
      .filter((q) =>
        q.and(
          q.eq(q.field("ticketId"), ticketId),
          q.eq(q.field("status"), "offered")
        )
      )
      .collect();

    const position = activeOffers.length + 1;

    // If we're under capacity, immediately offer the ticket
    const shouldOfferImmediately =
      activeOffers.length < ticket.waitingRoomCapacity;

    const expiryMs = ticket.offerExpiryMinutes * 60 * 1000;

    // Add to waiting list
    await ctx.db.insert("waitingList", {
      ticketId,
      userId,
      position,
      status: shouldOfferImmediately ? "offered" : "waiting",
      offerExpiresAt: shouldOfferImmediately
        ? Date.now() + expiryMs
        : undefined,
      joinedAt: Date.now(),
    });

    // Increment the currentWaitingCount
    await ctx.db.patch(ticketId, {
      currentWaitingCount: ticket.currentWaitingCount + 1,
    });

    return {
      success: true,
      position,
      status: shouldOfferImmediately ? "offered" : "waiting",
      offerExpiresAt: shouldOfferImmediately
        ? Date.now() + expiryMs
        : undefined,
    };
  },
});

// Process the queue and offer tickets
export const processQueue = mutation({
  args: {
    ticketId: v.string(),
  },
  handler: async (ctx, { ticketId }) => {
    // Get available tickets
    const ticket = await ctx.db
      .query("tickets")
      .filter((q) =>
        q.and(
          q.eq(q.field("_id"), ticketId),
          q.gt(q.field("availableQuantity"), 0)
        )
      )
      .first();

    if (!ticket) return;

    // Count current active offers
    const activeOffers = await ctx.db
      .query("waitingList")
      .filter((q) =>
        q.and(
          q.eq(q.field("ticketId"), ticketId),
          q.eq(q.field("status"), "offered")
        )
      )
      .collect();

    // Calculate how many more offers we can make
    const remainingOffers = Math.max(
      0,
      ticket.availableQuantity - activeOffers.length
    );

    if (remainingOffers === 0) return; // No more tickets can be offered

    const expiryMs = ticket.offerExpiryMinutes * 60 * 1000;

    // Find next waiting users, limited by remaining offers
    const waitingUsers = await ctx.db
      .query("waitingList")
      .filter((q) =>
        q.and(
          q.eq(q.field("ticketId"), ticketId),
          q.eq(q.field("status"), "waiting")
        )
      )
      .order("asc")
      .take(remainingOffers);

    // Offer tickets to these users
    for (const user of waitingUsers) {
      await ctx.db.patch(user._id, {
        status: "offered",
        offerExpiresAt: Date.now() + expiryMs,
      });
    }

    // Update ticket availableQuantity to reflect pending offers
    await ctx.db.patch(ticket._id, {
      availableQuantity: ticket.availableQuantity - waitingUsers.length,
    });
  },
});

// Check for expired offers
// --- Internal functions can only be called by other functions and cannot be called directly from a Convex client. ---
export const checkExpiredOffers = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();

    // Find expired offers
    const expiredOffers = await ctx.db
      .query("waitingList")
      .filter((q) =>
        q.and(
          q.eq(q.field("status"), "offered"),
          q.lt(q.field("offerExpiresAt"), now)
        )
      )
      .collect();

    // Group expired offers by ticket
    const offersByTicket = expiredOffers.reduce(
      (acc, offer) => {
        if (!acc[offer.ticketId]) {
          acc[offer.ticketId] = [];
        }
        acc[offer.ticketId].push(offer);
        return acc;
      },
      {} as Record<string, typeof expiredOffers>
    );

    // Process expired offers by ticket
    for (const [ticketId, offers] of Object.entries(offersByTicket)) {
      const ticket = await ctx.db
        .query("tickets")
        .filter((q) => q.eq(q.field("_id"), ticketId))
        .first();

      if (ticket) {
        // Mark offers as expired
        for (const offer of offers) {
          await ctx.db.patch(offer._id, { status: "expired" });
        }

        // Restore availableQuantity and update waiting count
        await ctx.db.patch(ticket._id, {
          availableQuantity: ticket.availableQuantity + offers.length,
          currentWaitingCount: Math.max(
            0,
            ticket.currentWaitingCount - offers.length
          ),
        });

        // Process queue for this ticket
        await processQueue(ctx, { ticketId });
      }
    }
  },
});

// Get user's position in queue
export const getQueuePosition = query({
  args: {
    ticketId: v.string(),
    userId: v.string(),
  },
  handler: async (ctx, { ticketId, userId }) => {
    const entry = await ctx.db
      .query("waitingList")
      .filter((q) =>
        q.and(
          q.eq(q.field("ticketId"), ticketId),
          q.eq(q.field("userId"), userId)
        )
      )
      .first();

    return entry;
  },
});

// Add this new internal mutation at the end of the file
export const reconcileWaitingCount = internalMutation({
  args: {},
  handler: async (ctx) => {
    // Get all tickets
    const tickets = await ctx.db.query("tickets").collect();

    for (const ticket of tickets) {
      // Count actual active entries in waiting list (waiting or offered status)
      const activeWaitingCount = await ctx.db
        .query("waitingList")
        .filter((q) =>
          q.and(
            q.eq(q.field("ticketId"), ticket._id),
            q.or(
              q.eq(q.field("status"), "waiting"),
              q.eq(q.field("status"), "offered")
            )
          )
        )
        .collect();

      // Update the ticket's currentWaitingCount if it doesn't match
      if (activeWaitingCount.length !== ticket.currentWaitingCount) {
        await ctx.db.patch(ticket._id, {
          currentWaitingCount: activeWaitingCount.length,
        });
        console.log(
          `Corrected waiting count for ticket ${ticket._id} from ${ticket.currentWaitingCount} to ${activeWaitingCount.length}`
        );
      }
    }
  },
});
