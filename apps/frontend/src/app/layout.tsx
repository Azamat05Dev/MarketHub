import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MarketHub - Crypto Trading Platform",
  description: "Enterprise-grade crypto trading platform with real-time streaming",
  authors: [{ name: "Azamat Qalmuratov" }],
  keywords: ["crypto", "trading", "microservices", "real-time", "websocket"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-900 text-white min-h-screen flex flex-col`}>
        <div className="flex-grow">
          {children}
        </div>
        <footer className="border-t border-gray-800 py-6 px-6 text-center">
          <div className="max-w-7xl mx-auto">
            <p className="text-gray-400 text-sm">
              Built with ❤️ by{" "}
              <a
                href="https://github.com/azamatqalmuratov"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 font-medium"
              >
                Azamat Qalmuratov
              </a>
            </p>
            <p className="text-gray-500 text-xs mt-2">
              Enterprise-grade Microservices Platform | 2024
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}

