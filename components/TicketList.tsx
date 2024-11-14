"use client";

import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { Id } from "@/convex/_generated/dataModel";
import Link from "next/link";

interface Ticket {
  _id: Id<"tickets">;
  _creationTime: number;
  title: string;
  description: string;
  price: number;
  quantity: number;
  eventDate: string;
  location: string;
  category: string;
  isAvailable: boolean;
  sellerId: string;
  createdAt: number;
}

export default function TicketList() {
  const tickets = useQuery(api.tickets.get);

  return (
    <main className="flex flex-col gap-4">
      {tickets?.map(
        ({
          _id,
          title,
          price,
          location,
          eventDate,
          category,
          isAvailable,
          sellerId,
          quantity,
          description,
        }: Ticket) => (
          <Link
            key={_id}
            href={`/ticket/${_id}`}
            className="p-4 border rounded-lg"
          >
            <h2 className="text-xl font-bold">{title}</h2>
            <p>Price: ${price}</p>
            <p>Location: {location}</p>
            <p>Date: {new Date(eventDate).toLocaleDateString()}</p>
            <p>Category: {category}</p>
            <p>Available: {isAvailable ? "Yes" : "No"}</p>
            <p>Seller ID: {sellerId}</p>
            <p>Quantity: {quantity}</p>
            <p>{description}</p>
          </Link>
        )
      )}
    </main>
  );
}
