import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { UserProvider } from "@/components/user-provider";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });

export const metadata: Metadata = {
  title: "Silence",
  description: "A minimalist daily stillness app. Asks nothing. Gives stillness.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${playfair.variable} font-sans antialiased min-h-screen selection:bg-accent selection:text-white`}
      >
        <UserProvider>
          {children}
        </UserProvider>
      </body>
    </html>
  );
}
