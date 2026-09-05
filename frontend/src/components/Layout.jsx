import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { LayoutDashboard, Users, Grid, CreditCard, LogOut, Menu, X, Moon, Sun, Bell, Search, BarChart3, Settings, Eye, EyeOff } from 'lucide-react';

const Layout = ({ setAuth }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = (e) => {
    if (e.key === 'Enter' && searchTerm.trim()) {
      navigate(`/students?search=${encodeURIComponent(searchTerm)}`);
      setSearchTerm('');
    }
  };

  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [adminUsername, setAdminUsername] = useState('Admin');

  // Profile Update State
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileData, setProfileData] = useState({ newUsername: '', currentPassword: '', newPassword: '' });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const res = await axios.put(`${import.meta.env.VITE_API_URL}/api/auth/profile`, 
        { 
          username: profileData.newUsername || undefined,
          currentPassword: profileData.currentPassword || undefined,
          newPassword: profileData.newPassword || undefined
        }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAdminUsername(res.data.admin.username);
      setShowProfileModal(false);
      setProfileData({ newUsername: '', currentPassword: '', newPassword: '' });
      alert('Profile updated successfully!');
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating profile');
    }
  };

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/students/dashboard`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const notes = [];
        if (res.data.pendingPayments > 0) {
          notes.push({ id: 1, text: `You have ${res.data.pendingPayments} pending payments to collect.`, type: 'alert' });
        }
        if (res.data.availableSeats < 10) {
          notes.push({ id: 2, text: `Only ${res.data.availableSeats} seats left available!`, type: 'warning' });
        }
        if (notes.length === 0) {
          notes.push({ id: 3, text: 'All caught up! No new alerts.', type: 'info' });
        }
        setNotifications(notes);
        if (res.data.adminUsername) {
          setAdminUsername(res.data.adminUsername);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchNotifications();
  }, []);

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
    <div className="min-h-screen">
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

              <div className="relative">
                <button onClick={() => setShowNotifications(!showNotifications)} className="relative p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                  <Bell className="w-5 h-5" />
                  {notifications.some(n => n.type !== 'info') && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-teal-500 rounded-full border-2 border-white dark:border-slate-900"></span>
                  )}
                </button>
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-slate-800 rounded-2xl shadow-xl shadow-black/10 border border-slate-200 dark:border-slate-700/50 py-3 z-50">
                    <div className="px-4 pb-2 mb-2 border-b border-slate-100 dark:border-slate-700/50 flex justify-between items-center">
                      <h3 className="font-semibold text-slate-900 dark:text-white">Notifications</h3>
                      <button onClick={() => setShowNotifications(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"><X className="w-4 h-4" /></button>
                    </div>
                    {notifications.map(n => (
                      <div key={n.id} className="px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer">
                        <p className="text-sm text-slate-600 dark:text-slate-300">{n.text}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 hidden sm:block"></div>
              <div className="relative">
                <div onClick={() => setShowProfileMenu(!showProfileMenu)} className="flex items-center space-x-3 cursor-pointer">
                  <img src={`https://ui-avatars.com/api/?name=${adminUsername}&background=0D8ABC&color=fff`} alt="Admin" className="w-9 h-9 rounded-full ring-2 ring-white dark:ring-slate-800 shadow-sm" />
                  <div className="hidden sm:block text-left">
                    <div className="text-sm font-semibold text-slate-900 dark:text-white leading-tight">{adminUsername}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">Administrator</div>
                  </div>
                </div>
                {showProfileMenu && (
                  <div className="absolute right-0 mt-3 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700/50 py-1 z-50">
                    <button 
                      onClick={() => { setShowProfileMenu(false); setProfileData({ ...profileData, newUsername: adminUsername }); setShowProfileModal(true); }}
                      className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50"
                    >
                      Update Profile
                    </button>
                    <div className="h-px bg-slate-100 dark:bg-slate-700/50 my-1"></div>
                    <button 
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
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

      {/* Profile Update Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-xl">
            <div className="flex justify-between items-center p-6 border-b dark:border-slate-700">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Update Profile</h3>
              <button onClick={() => setShowProfileModal(false)} className="text-slate-400 hover:text-slate-500">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleProfileUpdate} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Username</label>
                <input type="text" value={profileData.newUsername} onChange={(e) => setProfileData({...profileData, newUsername: e.target.value})} className="w-full px-3 py-2 border rounded-xl dark:bg-slate-700 dark:border-slate-600 dark:text-white" />
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-700/30 rounded-xl border border-slate-100 dark:border-slate-700 space-y-4">
                <h4 className="text-sm font-medium text-slate-900 dark:text-white">Change Password (Optional)</h4>
                <div>
                  <label className="block text-sm text-slate-600 dark:text-slate-400 mb-1">Current Password</label>
                  <div className="relative">
                    <input 
                      type={showCurrentPassword ? "text" : "password"} 
                      value={profileData.currentPassword} 
                      onChange={(e) => setProfileData({...profileData, currentPassword: e.target.value})} 
                      className="w-full pl-3 pr-10 py-2 border rounded-xl dark:bg-slate-700 dark:border-slate-600 dark:text-white" 
                      placeholder="Enter current password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 focus:outline-none"
                    >
                      {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-slate-600 dark:text-slate-400 mb-1">New Password</label>
                  <div className="relative">
                    <input 
                      type={showNewPassword ? "text" : "password"} 
                      value={profileData.newPassword} 
                      onChange={(e) => setProfileData({...profileData, newPassword: e.target.value})} 
                      className="w-full pl-3 pr-10 py-2 border rounded-xl dark:bg-slate-700 dark:border-slate-600 dark:text-white" 
                      placeholder="Enter new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 focus:outline-none"
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
              <div className="flex justify-end space-x-3 pt-4 border-t dark:border-slate-700">
                <button type="button" onClick={() => setShowProfileModal(false)} className="px-4 py-2 text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 font-medium">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-teal-600 text-white rounded-xl hover:bg-teal-700 font-medium">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Layout;
