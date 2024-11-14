import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  tickets: defineTable({
    title: v.string(),
    description: v.string(),
    price: v.number(),
    totalQuantity: v.number(),
    availableQuantity: v.number(),
    eventDate: v.string(),
    location: v.string(),
    category: v.string(),
    isAvailable: v.boolean(),
    sellerId: v.string(),
    createdAt: v.number(),
    waitingRoomCapacity: v.number(),
    currentWaitingCount: v.number(),
    offerExpiryMinutes: v.number(),
  })
    .searchIndex("search_title", { searchField: "title" })
    .searchIndex("search_location", { searchField: "location" })
    .searchIndex("search_category", { searchField: "category" }),

  users: defineTable({
    name: v.string(),
    email: v.string(),
    // Store purchased ticket IDs
    purchasedTickets: v.array(v.string()),
    // Store listed ticket IDs
    listedTickets: v.array(v.string()),
    createdAt: v.number(),
  }),

  // Optional: Track purchases/transactions
  purchases: defineTable({
    ticketId: v.string(),
    buyerId: v.string(),
    sellerId: v.string(),
    price: v.number(),
    purchaseDate: v.number(),
    status: v.string(), // "completed", "pending", "cancelled"
  }),

  waitingList: defineTable({
    ticketId: v.string(),
    userId: v.string(),
    position: v.number(), // Queue position
    status: v.string(), // "waiting", "offered", "expired", "purchased"
    offerExpiresAt: v.optional(v.number()), // Timestamp when the offer expires
    joinedAt: v.number(), // Timestamp when user joined queue
  })
    .index("by_ticket_and_status", ["ticketId", "status"])
    .index("by_expiry", ["offerExpiresAt"])
    .index("by_position", ["ticketId", "position"]),
});
