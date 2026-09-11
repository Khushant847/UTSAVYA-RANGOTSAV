import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "UTSAVYA RANGOTSAV 2026 | Premium Dandiya & Garba Night",
    template: "%s | UTSAVYA RANGOTSAV",
  },
  description:
    "A vibrant evening of Garba, Dandiya, music, entertainment, games, food, celebration and unforgettable festive moments. 17 October 2026, Faridabad.",
  keywords: [
    "UTSAVYA RANGOTSAV",
    "Dandiya",
    "Garba",
    "Navratri",
    "Faridabad",
    "event",
    "tickets",
  ],
  openGraph: {
    title: "UTSAVYA RANGOTSAV 2026 | Premium Dandiya & Garba Night",
    description:
      "A vibrant evening of Garba, Dandiya, music, entertainment, games, food, celebration and unforgettable festive moments.",
    type: "website",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${playfair.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: "#1e1b4b",
              color: "#f5f3ff",
              border: "1px solid rgba(167,139,250,0.3)",
            },
          }}
        />
      </body>
    </html>
  );
}