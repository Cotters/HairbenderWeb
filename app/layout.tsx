import "./globals.css";

export const metadata = {
  title: "Hairbender - The Vogue of Hair Apps",
  description:
    "Hairbender is the editorial-grade AI hair styling app. Photorealistic try-on, brutalist chic, and salon-ready results.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
