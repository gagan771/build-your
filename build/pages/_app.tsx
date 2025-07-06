import "@/styles/globals.css";
import type { AppProps } from "next/app";
import {
  ClerkProvider,
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ClerkProvider>
      <div>
        <header className="p-4 border-b">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-bold">Website Generator</h1>
            <div className="flex gap-2">
              <SignedOut>
                <SignInButton mode="modal" forceRedirectUrl="/generate">
                  <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                    Sign In
                  </button>
                </SignInButton>
                <SignUpButton mode="modal" forceRedirectUrl="/generate">
                  <button className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
                    Sign Up
                  </button>
                </SignUpButton>
              </SignedOut>
              <SignedIn>
                <UserButton />
              </SignedIn>
            </div>
          </div>
        </header>
        <Component {...pageProps} />
      </div>
    </ClerkProvider>
  );
}
