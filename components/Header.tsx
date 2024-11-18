import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import Link from "next/link";

function Header() {
  return (
    <header className="flex items-center justify-between p-4 border-b">
      <div>
        <Link href="/" className="font-bold">
          Ticketing App
        </Link>
      </div>

      <div>
        <SignedIn>
          <div className="flex items-center">
            <Link href="/seller">
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition mr-4">
                Sell Tickets
              </button>
            </Link>

            <Link href="/my-tickets">
              <button className="bg-gray-100 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-200 transition mr-4 border border-gray-300">
                My Tickets
              </button>
            </Link>
            <UserButton />
          </div>
        </SignedIn>

        <SignedOut>
          <SignInButton mode="modal" />
        </SignedOut>
      </div>
    </header>
  );
}

export default Header;
