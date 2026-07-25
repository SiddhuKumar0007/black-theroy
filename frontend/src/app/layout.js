import "./globals.css";
import { Inter, Outfit } from 'next/font/google';
import { ThemeProvider } from "../context/ThemeContext";
import { AuthProvider } from "../context/AuthContext";
import { CartProvider } from "../context/CartContext";
import { WishlistProvider } from "../context/WishlistContext";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import CustomerChatWidget from "../components/CustomerChatWidget";

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-sans',
});

const outfit = Outfit({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-display',
});

export const metadata = {
  title: "Black Theory | Architectural Heavyweight T-Shirts",
  description: "Experience architectural T-Shirt silhouettes by Black Theory. Engineered 280-320 GSM organic combed cotton oversized tees, acid-wash vintage t-shirts, and minimalist luxury fits.",
  keywords: "Black Theory, Heavyweight T-Shirts, Oversized T-Shirts, Premium Cotton Tees, Acid Wash T-Shirts, Graphic Tees, Streetwear T-Shirts, Luxury Minimalist Tees",
  viewport: "width=device-width, initial-scale=1.0"
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className={`${inter.variable} ${outfit.variable} flex flex-col min-h-screen`}>
        <AuthProvider>
          <ThemeProvider>
            <CartProvider>
              <WishlistProvider>
                <Navbar />
                <main className="flex-grow pt-16">
                  {children}
                </main>
                <Footer />
                <CustomerChatWidget />
              </WishlistProvider>
            </CartProvider>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
