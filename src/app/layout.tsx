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
  metadataBase: new URL("https://daybright.store"),
  title: { default: `${BRAND.name} · Client retention & milestone intelligence`, template: `%s · ${BRAND.name}` },
  description:
    "Tactile digital stationery and milestone automation for financial advisors, insurance agencies, real estate teams and legal practices.",
  openGraph: { siteName: BRAND.name, type: "website" },
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
