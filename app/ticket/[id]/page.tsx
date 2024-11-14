import JoinQueue from "@/components/JoinQueue";
import { Id } from "@/convex/_generated/dataModel";

async function TicketPage({ params }: { params: { id: string } }) {
  const { id } = await params;
  return (
    <div>
      TicketPage for {id}
      <JoinQueue ticketId={id as Id<"tickets">} userId="5" />
    </div>
  );
}

export default TicketPage;
