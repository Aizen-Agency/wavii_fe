import Link from 'next/link';
import Image from 'next/image';

const Header = () => {
  return (
    <nav className="w-full bg-[#121218] border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center">
            <div className="flex items-center justify-center w-12 h-12">
              <Image
                src="/Waviiiloog.png"
                alt="Wavii Logo"
                width={48}
                height={48}
              />
            </div>
          </div>
          <Link href="/login">
            <button className="px-6 py-2.5 rounded-lg text-white text-sm font-medium 
              bg-gradient-to-r from-indigo-500 to-purple-500 
              hover:from-indigo-600 hover:to-purple-600 
              transition-all duration-200 
              shadow-lg shadow-purple-500/20 
              hover:shadow-purple-500/30">
              Login
            </button>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Header;
