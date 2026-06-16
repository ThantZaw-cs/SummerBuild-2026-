import type { Metadata } from "next";
import "leaflet/dist/leaflet.css";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "CivicLens — Civic infrastructure reporting",
  description:
    "Report civic issues in under 30 seconds. CivicLens turns a simple citizen report into a structured, agency-ready maintenance ticket.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
