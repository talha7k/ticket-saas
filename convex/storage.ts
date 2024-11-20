import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const generateUploadUrl = mutation(async (ctx) => {
  return await ctx.storage.generateUploadUrl();
});

export const updateEventImage = mutation({
  args: {
    eventId: v.id("events"),
    storageId: v.id("_storage"),
  },
  handler: async (ctx, { eventId, storageId }) => {
    await ctx.db.patch(eventId, {
      imageStorageId: storageId,
    });
  },
});

export const getUrl = query({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, { storageId }) => {
    return await ctx.storage.getUrl(storageId);
  },
});
