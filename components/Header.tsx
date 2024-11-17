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
          <UserButton />
        </SignedIn>

        <SignedOut>
          <SignInButton mode="modal" />
        </SignedOut>
      </div>
    </header>
  );
}

export default Header;
