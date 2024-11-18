import SellerOnboarding from "@/components/SellerOnboarding";
import { auth } from "@clerk/nextjs/server";
import { SignInButton } from "@clerk/nextjs";

export default async function OnboardingPage() {
  const { userId } = await auth();

  if (!userId) {
    return (
      <div>
        <h2>You must be signed in to continue</h2>
        <SignInButton />
      </div>
    );
  }

  return <SellerOnboarding />;
}
