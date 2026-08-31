export const metadata = {
  title: "행간",
  description: "기사의 핵심과 의도를 읽어드립니다.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body style={{ margin: 0 }}>{children}</body>
    </html>
  );
}
