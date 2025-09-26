import './globals.css';

export const metadata = {
  title: 'Cafeteria App',
  description: 'Pre-ordering system',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}