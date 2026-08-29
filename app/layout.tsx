import type { Metadata } from "next";
import { DM_Serif_Display, Inter, Space_Grotesk, Space_Mono } from "next/font/google";
import "./globals.css";
import { SoundProvider } from "@/components/providers/SoundProvider";

const dmSerifDisplay = DM_Serif_Display({
  variable: "--font-dm-serif",
  subsets: ["latin"],
  weight: "400",
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const spaceMono = Space_Mono({
  variable: "--font-space-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "SKS",
  description:
    "An interactive, cricket-themed portfolio — step into the dressing room to explore projects, skills, and career innings.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${dmSerifDisplay.variable} ${spaceGrotesk.variable} ${inter.variable} ${spaceMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-stadium-night font-sans text-foreground">
        <SoundProvider>{children}</SoundProvider>
      </body>
    </html>
  );
}
