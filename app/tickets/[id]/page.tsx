import { getConvexClient } from "@/lib/convex";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Ticket from "@/components/Ticket";
import Link from "next/link";
import { ArrowLeft, Download, Share2 } from "lucide-react";

export default async function TicketPage({
  params,
}: {
  params: { id: string };
}) {
  const { userId } = await auth();
  if (!userId) redirect("/");

  const convex = getConvexClient();
  const ticket = await convex.query(api.tickets.getTicketWithDetails, {
    ticketId: params.id as Id<"tickets">,
  });

  if (!ticket || ticket.userId !== userId) {
    redirect("/tickets");
  }

  if (!ticket.event) {
    redirect("/tickets");
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8 space-y-8">
          {/* Navigation and Actions */}
          <div className="flex items-center justify-between">
            <Link
              href="/tickets"
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to My Tickets
            </Link>
            <div className="flex items-center gap-4">
              <button className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors rounded-lg hover:bg-gray-100">
                <Download className="w-4 h-4" />
                <span className="text-sm">Save</span>
              </button>
              <button className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors rounded-lg hover:bg-gray-100">
                <Share2 className="w-4 h-4" />
                <span className="text-sm">Share</span>
              </button>
            </div>
          </div>

          {/* Event Info Summary */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <h1 className="text-2xl font-bold text-gray-900">
              {ticket.event.name}
            </h1>
            <p className="mt-1 text-gray-600">
              {new Date(ticket.event.eventDate).toLocaleDateString()} at{" "}
              {ticket.event.location}
            </p>
            <div className="mt-4 flex items-center gap-4">
              <span className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm font-medium">
                Valid Ticket
              </span>
              <span className="text-sm text-gray-500">
                Purchased on {new Date(ticket.purchasedAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        {/* Ticket Component */}
        <Ticket ticketId={ticket._id} />

        {/* Additional Information */}
        <div className="mt-8 bg-blue-50 border border-blue-100 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-900">Need Help?</h3>
          <p className="mt-1 text-sm text-blue-700">
            If you have any issues with your ticket, please contact our support
            team at team@papareact-tickr.com
          </p>
        </div>
      </div>
    </div>
  );
}
