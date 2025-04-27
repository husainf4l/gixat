import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic"],
});

export const metadata: Metadata = {
  title: "WIDD ننشر الوِدّ بشغف اللعبة",
  description: "تطبيق الواقع المعزز لكرة القدم",
  metadataBase: new URL("https://widd.ai"), // Updated to correct domain
  openGraph: {
    title: "WIDD ننشر الوِدّ بشغف اللعبة",
    description:
      "وُدّ منظومة سعودية ذكية، تمزج بين الواقع المعزز، الواقع الافتراضي، والذكاء الاصطناعي — مبنية على القيم، ومسؤولة تجاه الإنسان والمجتمع.",
    url: "https://widd.ai", // Updated to correct domain
    siteName: "WIDD",
    images: [
      {
        url: "https://widd.ai/images/section/var.webp", // Updated to absolute URL
        width: 1200,
        height: 630,
        alt: "WIDD VAR",
      },
    ],
    locale: "ar_SA",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "WIDD ننشر الوِدّ بشغف اللعبة",
    description:
      "وُدّ منظومة سعودية ذكية، تمزج بين الواقع المعزز، الواقع الافتراضي، والذكاء الاصطناعي — مبنية على القيم، ومسؤولة تجاه الإنسان والمجتمع.",
    images: ["https://widd.ai/images/section/var.webp"], // Updated to absolute URL
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" className={cairo.variable}>
      <body className="min-h-screen bg-background dark:bg-gray-950 text-foreground">
        <AuthProvider>
          <ThemeProvider>{children}</ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
