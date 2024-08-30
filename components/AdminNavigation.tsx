import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

const AdminNavigation: React.FC = () => {
  const router = useRouter();

  const navItems = [
    { href: '/admin/dashboard', label: 'Dashboard' },
    { href: '/admin/upload-videos', label: 'Upload Videos' },
    { href: '/admin/settings', label: 'Settings' },
  ];

  return (
    <nav className="bg-gray-800 p-4">
      <ul className="flex space-x-4">
        {navItems.map((item) => (
          <li key={item.href}>
            <Link href={item.href}>
              <span
                className={`text-white hover:text-gray-300 ${
                  router.pathname === item.href ? 'font-bold' : ''
                }`}
              >
                {item.label}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default AdminNavigation;