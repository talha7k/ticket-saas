import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { getConvexClient } from "@/lib/convex";
import { api } from "@/convex/_generated/api";

export async function POST(req: Request) {
  const body = await req.text();
  const headersList = await headers();
  const signature = headersList.get("Stripe-Signature") as string;

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    return new NextResponse(
      `Webhook Error: ${err instanceof Error ? err.message : "Unknown Error"}`,
      { status: 400 }
    );
  }

  const session = event.data.object as any;

  if (event.type === "checkout.session.completed") {
    const convex = getConvexClient();

    // Get metadata from the session
    const { eventId, userId, waitingListId } = session.metadata;

    try {
      // Purchase the ticket in Convex
      await convex.mutation(api.events.purchaseTicket, {
        eventId,
        userId,
        waitingListId,
      });
    } catch (error) {
      console.error("Error processing ticket purchase:", error);
      return new NextResponse("Error processing ticket purchase", {
        status: 500,
      });
    }
  }

  return new NextResponse(null, { status: 200 });
}
