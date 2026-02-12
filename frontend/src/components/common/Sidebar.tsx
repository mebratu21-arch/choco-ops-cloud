import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu } from 'lucide-react';
import clsx from 'clsx';

const Sidebar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Hamburger for mobile */}
      <button
        className="md:hidden p-2 fixed top-4 left-4 z-50 bg-[#4B2E2A] text-white rounded"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle menu"
      >
        <Menu className="h-6 w-6" />
      </button>

      {/* Sidebar/Drawer */}
      <nav
        className={clsx(
          'fixed inset-y-0 left-0 w-64 bg-[#FFF5E6] p-4 transform transition-transform duration-300 ease-in-out',
          isOpen ? 'translate-x-0' : '-translate-x-full',
          'md:translate-x-0 md:static md:w-64'
        )}
      >
        {/* Links */}
        <ul className="space-y-4">
          <li><Link to="/dashboard" className="text-[#4B2E2A] hover:underline">Dashboard</Link></li>
          {/* Add more links here */}
        </ul>
      </nav>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

export default Sidebar;
