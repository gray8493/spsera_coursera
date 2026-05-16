import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ClientProviders } from "@/components/ClientProviders";

const inter = Inter({ subsets: ["latin", "vietnamese"] });

export const metadata: Metadata = {
  title: "Coursera Support Platform — Hoàn thành khóa học nhanh chóng",
  description:
    "Nền tảng hỗ trợ hoàn thành khóa học Coursera chuyên nghiệp. Bảo mật tuyệt đối, giá chỉ từ 20.000₫.",
  keywords: "coursera, support, khóa học, hỗ trợ, chứng chỉ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className={`${inter.className} min-h-screen bg-background text-foreground antialiased`}>
        <ClientProviders>
          {children}
        </ClientProviders>
        <Toaster />
      </body>
    </html>
  );
}
