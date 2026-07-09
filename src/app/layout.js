import { Fredoka, Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import MobileBottomNav from "@/components/MobileBottomNav";

const fredoka = Fredoka({
  variable: "--font-fredoka",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const jakartaSans = Plus_Jakarta_Sans({
  variable: "--font-jakarta-sans",
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

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="id"
      className={`${fredoka.variable} ${jakartaSans.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans text-slate-800">
        {children}
        <MobileBottomNav />
      </body>
    </html>
  );
}
