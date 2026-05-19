import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';

const Signup = ({ setAuth }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/register`, { 
        name, email, username, password 
      });
      localStorage.setItem('token', response.data.token);
      setAuth(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed');
    }
  };

  const handleDemo = async () => {
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/demo`);
      localStorage.setItem('token', response.data.token);
      setAuth(true);
    } catch (err) {
      setError('Failed to start demo');
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

      {/* Right Side - Signup Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 lg:p-24 relative overflow-hidden">
        {/* Decorative background blobs */}
        <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-teal-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-10%] left-[-5%] w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl"></div>
        
        <div className="max-w-md w-full space-y-8 relative z-10 bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl p-8 sm:p-12 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-white/20 dark:border-slate-700/50">
          <div className="text-center lg:text-left">
            <div className="lg:hidden w-16 h-16 bg-gradient-to-br from-teal-400 to-emerald-600 rounded-xl shadow-lg flex items-center justify-center mb-6 mx-auto">
              <span className="text-white font-bold text-2xl font-outfit">J</span>
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white font-outfit">Create an Account</h2>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Register as a new admin to manage the library</p>
          </div>
          
          <form className="mt-8 space-y-6" onSubmit={handleSignup}>
            {error && <div className="text-rose-500 text-sm text-center bg-rose-50 dark:bg-rose-900/30 p-3 rounded-xl border border-rose-100 dark:border-rose-800/50">{error}</div>}
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  className="appearance-none rounded-xl relative block w-full px-4 py-2 border border-slate-200 dark:border-slate-700 placeholder-slate-400 text-slate-900 dark:text-white bg-white/80 dark:bg-slate-900/50 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all sm:text-sm"
                  placeholder="Enter full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  className="appearance-none rounded-xl relative block w-full px-4 py-2 border border-slate-200 dark:border-slate-700 placeholder-slate-400 text-slate-900 dark:text-white bg-white/80 dark:bg-slate-900/50 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all sm:text-sm"
                  placeholder="Enter email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Username</label>
                <input
                  type="text"
                  required
                  className="appearance-none rounded-xl relative block w-full px-4 py-2 border border-slate-200 dark:border-slate-700 placeholder-slate-400 text-slate-900 dark:text-white bg-white/80 dark:bg-slate-900/50 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all sm:text-sm"
                  placeholder="Choose a unique username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
              <div className="relative">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    className="appearance-none rounded-xl relative block w-full px-4 py-2 pr-10 border border-slate-200 dark:border-slate-700 placeholder-slate-400 text-slate-900 dark:text-white bg-white/80 dark:bg-slate-900/50 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all sm:text-sm"
                    placeholder="Create a strong password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
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
                Sign Up as Admin
              </button>
            </div>
            
            <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-4">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-teal-600 hover:text-teal-500 dark:text-teal-400 dark:hover:text-teal-300 transition-colors">
                Sign in here
              </Link>
            </p>

            <div className="relative mt-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200 dark:border-slate-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white/60 dark:bg-slate-800/60 text-slate-500">Or just exploring?</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleDemo}
              className="mt-6 w-full flex justify-center py-3.5 px-4 border-2 border-slate-200 dark:border-slate-700 text-sm font-semibold rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-all duration-200"
            >
              Start Live Demo
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Signup;
