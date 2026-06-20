import { Sora, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import MobileBottomNav from "@/components/MobileBottomNav";

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "StorySight - Belajar Bahasa Inggris Melalui Cerita",
  description: "Tingkatkan kemampuan bahasa Anda dengan pengalaman belajar multisensori. Mulai dari PDF interaktif, video sinematik, hingga kuis yang menantang.",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="id"
      className={`${sora.variable} ${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans text-slate-800">
        {children}
        <MobileBottomNav />
      </body>
    </html>
  );
}
