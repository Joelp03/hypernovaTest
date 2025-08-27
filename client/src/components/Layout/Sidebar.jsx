import React from 'react';
import { NavLink } from 'react-router-dom';
import { BarChart3, User, Network, Menu } from 'lucide-react';

const Sidebar = ({ isOpen, onToggle }) => {
  const navItems = [
    { path: '/', icon: BarChart3, label: 'Dashboard' },
    { path: '/client', icon: User, label: 'Clientes' },
    { path: '/graph', icon: Network, label: 'Relaciones' }
  ];

  return (
    <>
      <button
        onClick={onToggle}
        className="lg:hidden fixed top-4 left-4 z-50 bg-blue-600 text-white p-2 rounded-md"
      >
        <Menu className="w-5 h-5" />
      </button>
      
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-center h-16 bg-blue-600">
          <h1 className="text-white text-xl font-bold">DebtManager</h1>
        </div>
        
        <nav className="mt-8">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center px-6 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors ${
                  isActive ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600' : ''
                }`
              }
              onClick={() => onToggle()}
            >
              <item.icon className="w-5 h-5 mr-3" />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={onToggle}
        />
      )}
    </>
  );
};

export default Sidebar;