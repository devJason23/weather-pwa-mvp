import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CourtReview AI",
  description: "Trusted post-game basketball stat review workflow"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
