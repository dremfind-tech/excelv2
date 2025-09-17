import type { Metadata } from "next";
import "./globals.css";
import { Inter } from "next/font/google";
import { Navbar } from "@/components/navbar";
import { Providers } from "@/components/providers";
import { ThemeToggle } from "@/components/theme-toggle";
import { Analytics } from "@vercel/analytics/next"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: {
    default: "Excel Visualizer",
    template: "%s | Excel Visualizer",
  },
  description:
    "Upload spreadsheets, clean data, and generate AI-driven charts with beautiful visualizations that tell your data’s story.",
  openGraph: {
    type: "website",
    title: "Excel Visualizer",
    description:
      "Upload spreadsheets, clean data, and generate AI-driven charts with beautiful visualizations that tell your data’s story.",
    images: [
      {
        url: "https://dummyimage.com/1200x630/0b0b0f/e6e6eb&text=Excel+Visualizer",
        width: 1200,
        height: 630,
        alt: "Excel Visualizer",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} dark`}>
      <body className="bg-app min-h-screen flex flex-col">
        <script
          dangerouslySetInnerHTML={{
            __html:
              "(function(){try{var s=localStorage.getItem('theme');var d=s?s==='dark':window.matchMedia('(prefers-color-scheme: dark)').matches;document.documentElement.classList.toggle('dark',d);}catch(e){}})();",
          }}
        />
        <Providers>
          <Navbar />
          <main className="flex-1">{children}</main>
          <div className="fixed bottom-4 right-4 z-50">
            <ThemeToggle />
          </div>
        </Providers>
        <Analytics />
      </body>
    </html>
  );
}
