export const metadata = {
  title: 'API Backend',
  description: 'Next.js API backend only'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

