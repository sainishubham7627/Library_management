import React, { useState } from 'react';
import axios from 'axios';
import { BookOpen, Eye, EyeOff } from 'lucide-react';
import { Link } from 'react-router-dom';

const Login = ({ setAuth }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/login`, { username, password });
      localStorage.setItem('token', response.data.token);
      setAuth(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-900 transition-colors duration-200">
      
      {/* Left Side - Image/Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-slate-900 items-center justify-center overflow-hidden">
        <div className="absolute inset-0 opacity-40 mix-blend-overlay">
          <img 
            src="https://images.unsplash.com/photo-1568667256549-094345857637?q=80&w=2000&auto=format&fit=crop" 
            alt="Library" 
            className="object-cover w-full h-full"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent"></div>
        <div className="relative z-10 text-center px-12">
          <div className="w-20 h-20 bg-gradient-to-br from-teal-400 to-emerald-600 rounded-2xl shadow-2xl shadow-teal-500/30 flex items-center justify-center mb-8 mx-auto">
            <span className="text-white font-bold text-4xl font-outfit">J</span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-4 font-outfit tracking-tight">Jagannath Library</h1>
          <p className="text-lg text-slate-300 font-light max-w-md mx-auto">
            A premium space for focused learning and seamless seat management.
          </p>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 lg:p-24 relative overflow-hidden">
        {/* Decorative background blobs */}
        <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-teal-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-10%] left-[-5%] w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl"></div>
        
        <div className="max-w-md w-full space-y-8 relative z-10 bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl p-8 sm:p-12 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-white/20 dark:border-slate-700/50">
          <div className="text-center lg:text-left">
            <div className="lg:hidden w-16 h-16 bg-gradient-to-br from-teal-400 to-emerald-600 rounded-xl shadow-lg flex items-center justify-center mb-6 mx-auto">
              <span className="text-white font-bold text-2xl font-outfit">J</span>
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white font-outfit">Welcome back</h2>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Please enter your admin credentials</p>
          </div>
          
          <form className="mt-8 space-y-6" onSubmit={handleLogin}>
            {error && <div className="text-rose-500 text-sm text-center bg-rose-50 dark:bg-rose-900/30 p-3 rounded-xl border border-rose-100 dark:border-rose-800/50">{error}</div>}
            
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Username</label>
                <input
                  type="text"
                  required
                  className="appearance-none rounded-xl relative block w-full px-4 py-3 border border-slate-200 dark:border-slate-700 placeholder-slate-400 text-slate-900 dark:text-white bg-white/80 dark:bg-slate-900/50 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all sm:text-sm"
                  placeholder="Enter username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
              <div className="relative">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    className="appearance-none rounded-xl relative block w-full px-4 py-3 pr-12 border border-slate-200 dark:border-slate-700 placeholder-slate-400 text-slate-900 dark:text-white bg-white/80 dark:bg-slate-900/50 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all sm:text-sm"
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="group relative w-full flex justify-center py-3.5 px-4 border border-transparent text-sm font-semibold rounded-xl text-white bg-slate-900 hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-all duration-200 hover:shadow-lg hover:shadow-teal-500/30 dark:bg-teal-600 dark:hover:bg-teal-500"
              >
                Sign In to Dashboard
              </button>
            </div>
            
            <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-4">
              Don't have an account?{' '}
              <Link to="/signup" className="font-semibold text-teal-600 hover:text-teal-500 dark:text-teal-400 dark:hover:text-teal-300 transition-colors">
                Sign up here
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
