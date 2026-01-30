import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://story-link-silk.vercel.app/"),
  title: "Story Link - 인스타 스토리로 쿠폰 받기",
  description: "인스타그램 스토리 링크를 통해 가게 방문 쿠폰을 발급받으세요",
  openGraph: {
    title: "Story Link - 인스타 스토리로 쿠폰 받기",
    description: "인스타그램 스토리 링크를 통해 가게 방문 쿠폰을 발급받으세요",
    url: "https://story-link-silk.vercel.app/",
    siteName: "Story Link",
    images: [
      {
        url: "/main.jpeg", // Default OG image
        width: 1200,
        height: 630,
      },
    ],
    locale: "ko_KR",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full">
      <head>
        <link
          rel="stylesheet"
          as="style"
          crossOrigin="anonymous"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css"
        />
        <script src="https://t1.kakaocdn.net/kakao_js_sdk/2.7.2/kakao.min.js"></script>
      </head>
      <body className="h-full">{children}</body>
    </html>
  );
}
