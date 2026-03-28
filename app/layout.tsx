// ============================================
// 📁 app/layout.tsx - UPDATED
// ============================================

import type { Metadata } from "next";
import { Tenor_Sans, Lato, Inter } from "next/font/google";
import "./globals.css";
import SocialFloatingButtons from "./components/SocialFloatingButtons";
import { EncodingProvider } from "./encoding-provider";
import { FacebookPixel } from "@/lib/facebook/pixel";
import AllPixels from "@/lib/tracking/pixels/AllPixels";
import { TrackingProvider } from "@/contexts/TrackingContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import { ProductsProvider } from "@/contexts/ProductsContext";

const tenorSans = Tenor_Sans({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
  variable: "--font-tenor-sans",
});

const lato = Lato({
  weight: ["300", "400", "700"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-lato",
});

const circularStd = Inter({
  weight: ["400", "500", "600"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-circular-std",
});

export const metadata: Metadata = {
  title: "Minsah Beauty - Beauty & Care Products",
  description: "Nourish your skin with toxin-free cosmetic products. Premium beauty and care products for your skincare routine.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${tenorSans.variable} ${lato.variable} ${circularStd.variable}`}>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Mrs+Saint+Delafield&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={`${lato.variable} antialiased`}>
        <FacebookPixel />
        <AllPixels />
        <TrackingProvider>
          <AuthProvider>
            <ProductsProvider>
              <CartProvider>
                {/* <EncodingProvider> */}
                  {children}
                  <SocialFloatingButtons />
                {/* </EncodingProvider> */}
              </CartProvider>
            </ProductsProvider>
          </AuthProvider>
        </TrackingProvider>
      </body>
    </html>
  );
}