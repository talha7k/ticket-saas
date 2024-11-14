import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

crons.interval(
  "check-expired-offers",
  { minutes: 1 }, // Run every minute
  internal.waitingList.checkExpiredOffers
);

crons.interval(
  "reconcile-waiting-count",
  { seconds: 30 }, // Run every 30 seconds
  internal.waitingList.reconcileWaitingCount
);

export default crons;
