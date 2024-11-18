import JoinQueue from "@/components/JoinQueue";
import { Id } from "@/convex/_generated/dataModel";
import { auth } from "@clerk/nextjs/server";

async function TicketPage({ params }: { params: { id: string } }) {
  const { id } = await params;

  const { userId } = await auth();

  if (!userId) {
    return <div>Please sign in to join the queue</div>;
  }

  return (
    <div>
      TicketPage for {id}
      <JoinQueue eventId={id as Id<"events">} userId={userId} />
    </div>
  );
}

export default TicketPage;
