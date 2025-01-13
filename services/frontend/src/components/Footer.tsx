import { Mail, Phone } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#004B87] text-white py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="text-sm">
            © {new Date().getFullYear()} Tracking Monitoring App. All rights reserved.
          </div>
          <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-6">
            <div className="flex items-center space-x-2">
              <Mail size={16} />
              <a href="mailto:strahinjapantic133@gmail.com" className="text-sm hover:text-gray-300">
                strahinjapantic133@gmail.com
              </a>
            </div>
            <div className="flex items-center space-x-2">
              <Phone size={16} />
              <a href="tel:+38162602611" className="text-sm hover:text-gray-300">
              +38162602611
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}