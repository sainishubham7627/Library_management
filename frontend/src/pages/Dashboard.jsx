import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, Grid, CheckCircle, AlertTriangle, Clock } from 'lucide-react';
import { format } from 'date-fns';

const StatCard = ({ title, value, icon: Icon, gradientClass, iconColorClass }) => (
  <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-slate-100 dark:border-slate-700/50 relative overflow-hidden group">
    <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full ${gradientClass} opacity-10 group-hover:scale-150 transition-transform duration-500 blur-2xl`}></div>
    <div className="flex items-center space-x-5 relative z-10">
      <div className={`p-4 rounded-2xl ${gradientClass} shadow-lg`}>
        <Icon className={`w-7 h-7 ${iconColorClass}`} />
      </div>
      <div>
        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">{title}</p>
        <h3 className="text-4xl font-extrabold text-slate-900 dark:text-white font-outfit tracking-tight">{value}</h3>
      </div>
    </div>
  </div>
);

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/students/dashboard`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStats(res.data);
      } catch (err) {
        console.error('Error fetching stats', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <div className="text-center py-10 dark:text-white">Loading dashboard...</div>;
  if (!stats) return <div className="text-center py-10 text-red-500">Failed to load stats</div>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard Overview</h2>
        <p className="text-gray-500 dark:text-gray-400">Welcome back, here's what's happening today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Students" value={stats.totalStudents} icon={Users} gradientClass="bg-gradient-to-br from-indigo-500 to-blue-600" iconColorClass="text-white" />
        <StatCard title="Occupied Seats" value={stats.occupiedSeats} icon={CheckCircle} gradientClass="bg-gradient-to-br from-teal-400 to-emerald-600" iconColorClass="text-white" />
        <StatCard title="Available Seats" value={stats.availableSeats} icon={Grid} gradientClass="bg-gradient-to-br from-amber-400 to-orange-500" iconColorClass="text-white" />
        <StatCard title="Pending Payments" value={stats.pendingPayments} icon={AlertTriangle} gradientClass="bg-gradient-to-br from-rose-500 to-red-600" iconColorClass="text-white" />
      </div>

    </div>
  );
};

export default Dashboard;
