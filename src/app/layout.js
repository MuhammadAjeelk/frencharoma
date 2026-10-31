import { Geist, Geist_Mono, Playfair_Display, Tinos, Carlito } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { ToastProvider } from "@/context/ToastContext";
import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  style: ["normal", "italic"],
});

// The 2026-10 homepage mockup sets its titles, buttons and footer in Times and
// its product details in Calibri. Tinos and Carlito are the open fonts drawn to
// the same metrics, so text sits exactly where the designer placed it.
const tinos = Tinos({
  variable: "--font-tinos",
  subsets: ["latin"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
});

const carlito = Carlito({
  variable: "--font-carlito",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata = {
  title: "French Aromas | Premium Impression Perfumes",
  description:
    "Shop luxury impression perfumes crafted with original French perfume oils. Free shipping on orders above PKR 7,000.",
  keywords: "perfume, impression perfume, French aromas, luxury fragrance, affordable perfume",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${playfair.variable} ${tinos.variable} ${carlito.variable} antialiased overflow-x-hidden`}
      >
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <ToastProvider>
                {children}
              </ToastProvider>
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
