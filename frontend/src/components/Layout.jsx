import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, Grid, CreditCard, LogOut, Menu, X, Moon, Sun, Bell, Search, BarChart3, Settings } from 'lucide-react';

const Layout = ({ setAuth }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = (e) => {
    if (e.key === 'Enter' && searchTerm.trim()) {
      navigate(`/students?search=${encodeURIComponent(searchTerm)}`);
      setSearchTerm('');
    }
  };

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setAuth(false);
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Members', path: '/students', icon: Users },
    { name: 'Seat Layout', path: '/seats', icon: Grid },
    { name: 'Payments', path: '/payments', icon: CreditCard },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <div className={`min-h-screen ${darkMode ? 'dark' : ''}`}>
      <div className="flex h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-200">
        
        {/* Mobile sidebar overlay */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 z-40 bg-slate-900/80 backdrop-blur-sm lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <div className={`fixed inset-y-0 left-0 z-50 w-72 bg-slate-900 shadow-2xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-auto flex flex-col ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="flex flex-col items-center justify-center h-28 border-b border-slate-800/60 bg-slate-900/50 backdrop-blur-xl">
            <div className="w-10 h-10 bg-teal-500 rounded-xl shadow-lg shadow-teal-500/30 flex items-center justify-center mb-3">
              <span className="text-white font-bold text-xl font-outfit">J</span>
            </div>
            <div className="text-center">
              <h1 className="text-lg font-bold text-white tracking-wide font-outfit">Jagannath Library</h1>
              <p className="text-xs text-slate-400">Study Space Management</p>
            </div>
          </div>
          <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 ml-2 mt-2">Main Menu</div>
            {navItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center px-4 py-3 rounded-xl transition-all duration-200 group ${
                    isActive
                      ? 'bg-gradient-to-r from-teal-500/10 to-transparent text-teal-400 font-medium'
                      : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                  }`
                }
              >
                <item.icon className={`w-5 h-5 mr-3 transition-colors ${window.location.pathname === item.path ? 'text-teal-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
                {item.name}
              </NavLink>
            ))}
          </nav>
          <div className="p-4 border-t border-slate-800/60 bg-slate-900/50">
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-3 text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors font-medium"
            >
              <LogOut className="w-5 h-5 mr-3" />
              Sign Out
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden relative">
          {/* Top Navbar */}
          <header className="flex items-center justify-between h-20 px-8 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-b border-slate-200 dark:border-slate-800 z-10 sticky top-0">
            <button
              className="lg:hidden text-slate-500 dark:text-slate-400 hover:text-teal-600 focus:outline-none transition-colors mr-4"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex-1 flex items-center">
              <div className="relative w-full max-w-md hidden md:block">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search by name, phone, seat number (Press Enter)"
                  className="w-full pl-10 pr-4 py-2 text-sm bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/50 text-slate-900 dark:text-white placeholder-slate-400 transition-all"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={handleSearch}
                />
              </div>
            </div>
            <div className="flex items-center space-x-3 sm:space-x-5">
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <button className="relative p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-teal-500 rounded-full border-2 border-white dark:border-slate-900"></span>
              </button>
              <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 hidden sm:block"></div>
              <div className="flex items-center space-x-3 cursor-pointer">
                <img src="https://ui-avatars.com/api/?name=Admin+User&background=0D8ABC&color=fff" alt="Admin" className="w-9 h-9 rounded-full ring-2 ring-white dark:ring-slate-800 shadow-sm" />
                <div className="hidden sm:block text-left">
                  <div className="text-sm font-semibold text-slate-900 dark:text-white leading-tight">Admin User</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">Administrator</div>
                </div>
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
              <Outlet />
            </div>
          </main>
        </div>

      </div>
    </div>
  );
};

export default Layout;
