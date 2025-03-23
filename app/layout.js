import './styles/globals.css';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'AlgoZ - Advanced Algorithmic Trading Platform',
  description: 'Cutting-edge algorithmic trading solutions for modern investors',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}