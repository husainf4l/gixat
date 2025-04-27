import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-plus-jakarta-sans",
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "GIXAT - Garage System Management",
  description: "Advanced garage management solution",
  metadataBase: new URL("https://gixat.com"),
  openGraph: {
    title: "GIXAT - Garage System Management",
    description: "Streamlined garage management solution for modern businesses",
    url: "https://gixat.com",
    siteName: "GIXAT",
    images: [
      {
        url: "https://gixat.com/images/gixat-logo.png",
        width: 1200,
        height: 630,
        alt: "GIXAT Logo",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "GIXAT - Garage System Management",
    description: "Streamlined garage management solution for modern businesses",
    images: ["https://gixat.com/images/gixat-logo.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`dark ${plusJakartaSans.variable}`}>
      <body className="min-h-screen bg-[#020817] text-slate-50 font-sans">
        <AuthProvider>
          <ThemeProvider>{children}</ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
