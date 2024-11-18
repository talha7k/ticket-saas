import SellerOnboarding from "@/components/SellerOnboarding";
import { auth } from "@clerk/nextjs/server";
import { SignInButton } from "@clerk/nextjs";

export default async function OnboardingPage() {
  const { userId } = await auth();

  if (!userId) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-8">
        <h2 className="text-2xl font-semibold text-gray-800">
          You must be signed in to continue
        </h2>
        <SignInButton />
      </div>
    );
  }

  return <SellerOnboarding />;
}
