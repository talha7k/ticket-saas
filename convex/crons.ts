import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

crons.interval(
  "cleanup-expired-offers",
  { seconds: 10 }, // Run every 10 seconds
  internal.waitingList.cleanupExpiredOffers
);

export default crons;
