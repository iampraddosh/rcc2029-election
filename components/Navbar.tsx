'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const pathname = usePathname();
  
  const links = [
    { name: 'Roster', path: '/tracker' },
    { name: 'Nominate', path: '/nominate' },
    { name: 'Vote', path: '/vote' },
  ];

  return (
    <nav className="w-full bg-white border-b border-stone-100 py-4 px-6">
      <div className="max-w-xl mx-auto flex justify-between items-center">
        <Link href="/" className="text-xs font-black uppercase tracking-widest text-stone-900">
          RCC Election
        </Link>
        <div className="flex space-x-6">
          {links.map((link) => (
            <Link 
              key={link.path} 
              href={link.path}
              className={`text-[10px] font-bold uppercase tracking-widest transition-colors ${
                pathname === link.path ? 'text-[#800000]' : 'text-stone-400 hover:text-stone-900'
              }`}
            >
              {link.name}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}