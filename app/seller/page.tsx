import SellerOnboarding from "@/components/SellerOnboarding";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function OnboardingPage() {
  const { userId } = await auth();
  if (!userId) redirect("/");

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900">Seller Dashboard</h1>
          <p className="mt-2 text-lg text-gray-600">
            Manage your tickets and seller account
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-8 rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              Create Listing
            </h2>
            <p className="text-gray-600 mb-8">
              List your tickets for sale and manage your listings
            </p>
            <button className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200 shadow-md">
              Create a new Event Listing
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-lg">
            <SellerOnboarding />
          </div>
        </div>
      </div>
    </div>
  );
}
