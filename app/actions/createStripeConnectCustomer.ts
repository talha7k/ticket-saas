"use server";

import { stripe } from "@/lib/stripe";

export async function createStripeConnectCustomer() {
  try {
    const account = await stripe.accounts.create({});
    return { account: account.id };
  } catch (error: unknown) {
    console.error(
      "An error occurred when calling the Stripe API to create an account:",
      error
    );
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error("An unknown error occurred");
  }
}
