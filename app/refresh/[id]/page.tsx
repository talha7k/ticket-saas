"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { createStripeConnectAccountLink } from "@/app/actions/createStripeConnectAccountLink";

export default function Refresh() {
  const {
    query: { id: connectedAccountId },
  } = useRouter();
  const [accountLinkCreatePending, setAccountLinkCreatePending] =
    useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    const createAccountLink = async () => {
      if (connectedAccountId) {
        setAccountLinkCreatePending(true);
        setError(false);
        try {
          const { url } = await createStripeConnectAccountLink(
            connectedAccountId as string
          );
          window.location.href = url;
        } catch (error) {
          setError(true);
        }
        setAccountLinkCreatePending(false);
      }
    };

    createAccountLink();
  }, [connectedAccountId]);

  return (
    <div className="container">
      <div className="banner">
        <h2>Rocket Rides</h2>
      </div>
      <div className="content">
        <h2>Add information to start accepting money</h2>
        <p>
          Rocket Rides is the world's leading air travel platform: join our team
          of pilots to help people travel faster.
        </p>
        {error && <p className="error">Something went wrong!</p>}
      </div>
      <div className="dev-callout">
        {connectedAccountId && (
          <p>
            Your connected account ID is:{" "}
            <code className="bold">{connectedAccountId}</code>
          </p>
        )}
        {accountLinkCreatePending && <p>Creating a new Account Link...</p>}
      </div>
    </div>
  );
}
