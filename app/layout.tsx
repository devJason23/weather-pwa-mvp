import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HoopSmith",
  description: "Basketball intelligence for post-game review, publishing, and player development"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
