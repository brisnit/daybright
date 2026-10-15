import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Caveat, Courier_Prime, Fraunces, Instrument_Sans, Shrikhand } from "next/font/google";
import { BRAND } from "@/config/brand";
import { Providers } from "@/components/providers";
import "./globals.css";

const instrument = Instrument_Sans({ variable: "--font-instrument", subsets: ["latin"] });
const fraunces = Fraunces({ variable: "--font-fraunces", subsets: ["latin"], axes: ["SOFT", "WONK", "opsz"], style: ["normal", "italic"] });
const bricolage = Bricolage_Grotesque({ variable: "--font-bricolage", subsets: ["latin"] });
const caveat = Caveat({ variable: "--font-caveat", subsets: ["latin"] });
const courier = Courier_Prime({ variable: "--font-courier", subsets: ["latin"], weight: ["400", "700"] });
const shrikhand = Shrikhand({ variable: "--font-shrikhand", subsets: ["latin"], weight: "400" });

export const metadata: Metadata = {
  title: { default: `${BRAND.name} · Birthday cards & gifts, thoughtfully on time`, template: `%s · ${BRAND.name}` },
  description:
    "Create an original birthday card, find a thoughtful gift, and make someone's day. For one person or every customer you serve.",
};

export const viewport: Viewport = {
  themeColor: "#FFF9F0",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${instrument.variable} ${fraunces.variable} ${bricolage.variable} ${caveat.variable} ${courier.variable} ${shrikhand.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
