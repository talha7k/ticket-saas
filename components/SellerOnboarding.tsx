"use client";
import { createStripeConnectAccountLink } from "@/app/actions/createStripeConnectAccountLink";
import { createStripeConnectCustomer } from "@/app/actions/createStripeConnectCustomer";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";

import { useRouter } from "next/navigation";
import React, { useState } from "react";

export default function SellerOnboarding() {
  const [accountCreatePending, setAccountCreatePending] = useState(false);
  const [accountLinkCreatePending, setAccountLinkCreatePending] =
    useState(false);
  const [error, setError] = useState(false);

  const router = useRouter();

  const { user } = useUser();
  const stripeConnectId = useQuery(api.users.getUsersStripeConnectId, {
    userId: user?.id || "",
  });

  if (stripeConnectId === undefined) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container">
      <div className="banner">
        <h2>Rocket Rides</h2>
      </div>
      <div className="content">
        {!stripeConnectId && <h2>Get ready for take off</h2>}
        {!stripeConnectId && (
          <p>
            Rocket Rides is the world's leading air travel platform: join our
            team of pilots to help people travel faster.
          </p>
        )}
        {stripeConnectId && <h2>Add information to start accepting money</h2>}
        {stripeConnectId && (
          <p>
            Matt's Mats partners with Stripe to help you receive payments while
            keeping your personal and bank details secure.
          </p>
        )}
        {!accountCreatePending && !stripeConnectId && (
          <button
            onClick={async () => {
              setAccountCreatePending(true);
              setError(false);

              try {
                const { account } = await createStripeConnectCustomer();
                setAccountCreatePending(false);

                // if (account) {
                //   setstripeConnectId(account);
                // }
              } catch (error) {
                setError(true);
              }
            }}
          >
            Create an account!
          </button>
        )}
        {stripeConnectId && !accountLinkCreatePending && (
          <button
            onClick={async () => {
              setAccountLinkCreatePending(true);
              setError(false);
              try {
                const { url } =
                  await createStripeConnectAccountLink(stripeConnectId);
                router.push(url);
              } catch (error) {
                setError(true);
              }
              setAccountLinkCreatePending(false);
            }}
          >
            Add information
          </button>
        )}
        {error && <p className="error">Something went wrong!</p>}
        {(stripeConnectId ||
          accountCreatePending ||
          accountLinkCreatePending) && (
          <div className="dev-callout">
            {stripeConnectId && (
              <p>
                Your connected account ID is:{" "}
                <code className="bold">{stripeConnectId}</code>
              </p>
            )}
            {accountCreatePending && <p>Creating a connected account...</p>}
            {accountLinkCreatePending && <p>Creating a new Account Link...</p>}
          </div>
        )}
        <div className="info-callout">
          <p>
            This is a sample app for Stripe-hosted Connect onboarding.{" "}
            <a
              href="https://docs.stripe.com/connect/onboarding/quickstart?connect-onboarding-surface=hosted"
              target="_blank"
              rel="noopener noreferrer"
            >
              View docs
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
