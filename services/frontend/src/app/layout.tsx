// layout.tsx - Root layout component that wraps all pages in the application
import './globals.css'
import { Inter } from 'next/font/google'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

// Initialize the Inter font with Latin subset for optimal loading
const inter = Inter({ subsets: ['latin'] })

// Define metadata for SEO and browser tab display
export const metadata = {
  title: 'Tracking Monitoring App',
  description: 'Track and monitor transportation orders',
}

/**
 * RootLayout component that provides the basic HTML structure and common elements
 * This component:
 * - Applies the Inter font family
 * - Includes the navbar and footer
 * - Provides a flex container for proper content layout
 * 
 * @param {Object} props - Component properties
 * @param {React.ReactNode} props.children - Child components to render in the main content area
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} flex flex-col min-h-screen`}>
        <Navbar />
        <main className="flex-grow">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  )
}