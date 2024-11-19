"use server";

import { stripe } from "@/lib/stripe";
import { getConvexClient } from "@/lib/convex";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import baseUrl from "@/lib/baseUrl";

export async function createStripeCheckoutSession({
  eventId,
  userId,
  waitingListId,
}: {
  eventId: Id<"events">;
  userId: string;
  waitingListId: Id<"waitingList">;
}) {
  const convex = getConvexClient();

  // Get event details
  const event = await convex.query(api.events.getById, {
    eventId: eventId as Id<"events">,
  });
  if (!event) throw new Error("Event not found");

  const stripeConnectId = await convex.query(
    api.users.getUsersStripeConnectId,
    {
      userId: event.userId,
    }
  );

  if (!stripeConnectId)
    throw new Error("Stripe Connect ID not found for owner of the event!");

  console.log("DEBUG 1 >>>", stripeConnectId);

  // Create Stripe Checkout Session
  const session = await stripe.checkout.sessions.create(
    {
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "gbp",
            product_data: {
              name: event.name,
              description: event.description,
            },
            unit_amount: Math.round(event.price * 100), // Convert to cents/pence
          },
          quantity: 1,
        },
      ],
      payment_intent_data: {
        application_fee_amount: Math.round(event.price * 100 * 0.01), // 1% of total amount
      },
      mode: "payment",
      success_url: `${baseUrl}/tickets/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/event/${eventId}`,
      metadata: {
        eventId,
        userId,
        waitingListId,
      },
    },
    {
      stripeAccount: stripeConnectId,
    }
  );

  return { sessionId: session.id, sessionUrl: session.url };
}
