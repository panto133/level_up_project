'use client';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="bg-[#004B87] text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/">
              <Image
                src="/brezna-logo.png"
                alt="Brezna Logo"
                width={120}
                height={40}
                className="h-8 w-auto"
                priority
              />
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            <Link 
              href="/"
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                isActive('/') 
                  ? 'bg-[#003666] text-white' 
                  : 'text-gray-200 hover:bg-[#003666] hover:text-white'
              }`}
            >
              Home
            </Link>
            <Link 
              href="/upload"
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                isActive('/upload') 
                  ? 'bg-[#003666] text-white' 
                  : 'text-gray-200 hover:bg-[#003666] hover:text-white'
              }`}
            >
              Upload
            </Link>
            <Link 
              href="/overview"
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                isActive('/overview') 
                  ? 'bg-[#003666] text-white' 
                  : 'text-gray-200 hover:bg-[#003666] hover:text-white'
              }`}
            >
              Overview
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}