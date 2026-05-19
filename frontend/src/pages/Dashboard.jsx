import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, Grid, IndianRupee, Calendar, CheckCircle, AlertTriangle } from 'lucide-react';
import { format, isToday, isThisMonth } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

const Dashboard = () => {
  const [students, setStudents] = useState([]);
  const [seats, setSeats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };
        
        const [studentsRes, seatsRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_API_URL}/api/students`, { headers }),
          axios.get(`${import.meta.env.VITE_API_URL}/api/seats`, { headers })
        ]);
        
        setStudents(studentsRes.data);
        setSeats(seatsRes.data);
      } catch (err) {
        console.error('Error fetching data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return (
    <div className="flex h-64 items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
    </div>
  );

  // Compute Stats
  const totalSeats = seats.length;
  let occupiedSeatsCount = 0;
  let hallsOccupied = 0, hallsAvailable = 0;
  let acOccupied = 0, acAvailable = 0;
  
  seats.forEach(seat => {
    const isOccupied = seat.occupants.full || (seat.occupants.morning && seat.occupants.day);
    const isPartiallyOccupied = !isOccupied && (seat.occupants.morning || seat.occupants.day);
    if (isOccupied || isPartiallyOccupied) {
      occupiedSeatsCount++;
      if (seat.roomType === 'Normal') hallsOccupied++; else acOccupied++;
    } else {
      if (seat.roomType === 'Normal') hallsAvailable++; else acAvailable++;
    }
  });

  const availableSeatsCount = totalSeats - occupiedSeatsCount;
  const occupiedPercentage = totalSeats > 0 ? ((occupiedSeatsCount / totalSeats) * 100).toFixed(1) : 0;
  const availablePercentage = totalSeats > 0 ? ((availableSeatsCount / totalSeats) * 100).toFixed(1) : 0;

  // Payments
  let todaysRevenue = 0;
  let todaysPaymentsCount = 0;
  let thisMonthRevenue = 0;
  let pendingAmount = 0;
  let totalTransactions = 0;
  const recentActivities = [];

  students.forEach(student => {
    pendingAmount += student.fee.remaining;
    
    // Check activities
    if (isToday(new Date(student.createdAt))) {
      recentActivities.push({
        type: 'New Member Added',
        desc: `${student.fullName} - ${student.seatNumber} (${student.shift})`,
        time: student.createdAt,
        icon: Users,
        color: 'text-teal-400',
        bg: 'bg-teal-500/10'
      });
    }

    student.fee.paymentHistory.forEach(payment => {
      totalTransactions++;
      const payDate = new Date(payment.date);
      if (isToday(payDate)) {
        todaysRevenue += payment.amount;
        todaysPaymentsCount++;
        recentActivities.push({
          type: 'Payment Received',
          desc: `${student.fullName} - ${student.seatNumber}`,
          time: payment.date,
          amount: payment.amount,
          icon: IndianRupee,
          color: 'text-blue-400',
          bg: 'bg-blue-500/10'
        });
      }
      if (isThisMonth(payDate)) {
        thisMonthRevenue += payment.amount;
      }
    });
  });

  // Sort activities by time
  recentActivities.sort((a, b) => new Date(b.time) - new Date(a.time));

  // Shifts Donut Chart
  let morningCount = 0, dayCount = 0, fullCount = 0;
  students.forEach(s => {
    if (s.shift === 'Morning') morningCount++;
    if (s.shift === 'Day') dayCount++;
    if (s.shift === 'Full Shift') fullCount++;
  });
  const shiftData = [
    { name: 'Morning Shift', value: morningCount, color: '#3b82f6' }, // Blue
    { name: 'Day Shift', value: dayCount, color: '#eab308' }, // Yellow
    { name: 'Full Day', value: fullCount, color: '#ef4444' } // Red
  ];

  // Bar Chart Data
  const seatChartData = [
    { name: 'Halls\nH1 - H49', Occupied: hallsOccupied, Available: hallsAvailable },
    { name: 'AC Rooms\nAC01 - AC25', Occupied: acOccupied, Available: acAvailable }
  ];

  // Line Chart Data (Mocking last 5 days revenue for visual)
  const lineChartData = [
    { name: '14 May', revenue: 12000 },
    { name: '15 May', revenue: 15000 },
    { name: '16 May', revenue: 18000 },
    { name: '17 May', revenue: 24000 },
    { name: '18 May', revenue: 14000 },
    { name: '19 May', revenue: thisMonthRevenue > 0 ? thisMonthRevenue : 24500 }
  ];

  const StatCard = ({ title, value, subtitle, icon: Icon, colorClass, subtitleColor }) => (
    <div className="bg-slate-800/40 backdrop-blur-sm p-6 rounded-2xl border border-slate-700/50 hover:bg-slate-800/60 transition-colors group">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-400 mb-2">{title}</p>
          <h3 className="text-3xl font-bold text-white mb-2 font-outfit">{value}</h3>
          <p className={`text-xs ${subtitleColor || 'text-slate-500'}`}>{subtitle}</p>
        </div>
        <div className={`p-3 rounded-xl ${colorClass} bg-opacity-10 group-hover:bg-opacity-20 transition-all`}>
          <Icon className={`w-6 h-6 ${colorClass.replace('bg-', 'text-')}`} />
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 max-w-full overflow-hidden pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white font-outfit">Welcome back, Admin! 👋</h2>
          <p className="text-slate-400 text-sm mt-1">Here's what's happening in your study space today.</p>
        </div>
        <div className="flex items-center space-x-2 bg-slate-800/50 border border-slate-700/50 px-4 py-2 rounded-xl">
          <Calendar className="w-4 h-4 text-slate-400" />
          <span className="text-slate-300 text-sm font-medium">{format(new Date(), 'MMM dd, yyyy')}</span>
        </div>
      </div>

      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard title="Total Seats" value={totalSeats || 120} subtitle="All Rooms" icon={Grid} colorClass="bg-teal-500" subtitleColor="text-teal-400" />
        <StatCard title="Occupied Seats" value={occupiedSeatsCount} subtitle={`${occupiedPercentage}% Occupied`} icon={Users} colorClass="bg-blue-500" subtitleColor="text-blue-400" />
        <StatCard title="Available Seats" value={availableSeatsCount} subtitle={`${availablePercentage}% Available`} icon={CheckCircle} colorClass="bg-green-500" subtitleColor="text-green-400" />
        <StatCard title="Today's Revenue" value={`₹${todaysRevenue}`} subtitle={`From ${todaysPaymentsCount} Payments`} icon={IndianRupee} colorClass="bg-purple-500" subtitleColor="text-purple-400" />
        <StatCard title="Expiring Soon" value={7} subtitle="Within 3 Days" icon={AlertTriangle} colorClass="bg-orange-500" subtitleColor="text-orange-400" />
      </div>

      {/* Middle Row Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Bar Chart */}
        <div className="bg-slate-800/40 backdrop-blur-sm p-6 rounded-2xl border border-slate-700/50 lg:col-span-1 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-white">Seat Occupancy Overview</h3>
            <select className="bg-slate-900 border border-slate-700 text-xs text-slate-300 rounded-lg px-2 py-1 outline-none">
              <option>Today</option>
            </select>
          </div>
          <div className="flex items-center space-x-4 mb-4 text-xs">
            <div className="flex items-center"><span className="w-2.5 h-2.5 rounded-full bg-teal-500 mr-2"></span><span className="text-slate-400">Occupied</span></div>
            <div className="flex items-center"><span className="w-2.5 h-2.5 rounded-full bg-slate-500 mr-2"></span><span className="text-slate-400">Available</span></div>
          </div>
          <div className="flex-1 min-h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={seatChartData} barGap={8}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <RechartsTooltip cursor={{fill: '#1e293b'}} contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '8px', color: '#fff' }} />
                <Bar dataKey="Occupied" fill="#14b8a6" radius={[4, 4, 0, 0]} maxBarSize={30} />
                <Bar dataKey="Available" fill="#64748b" radius={[4, 4, 0, 0]} maxBarSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Donut Chart */}
        <div className="bg-slate-800/40 backdrop-blur-sm p-6 rounded-2xl border border-slate-700/50 flex flex-col">
          <h3 className="text-lg font-semibold text-white mb-6">Shift Overview</h3>
          <div className="flex-1 flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={shiftData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" stroke="none">
                  {shiftData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '8px', color: '#fff' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-3xl font-bold text-white font-outfit">{occupiedSeatsCount}</span>
              <span className="text-xs text-slate-400">Occupied</span>
            </div>
          </div>
          <div className="mt-4 space-y-3">
            {shiftData.map((shift) => {
              const perc = students.length > 0 ? ((shift.value / students.length) * 100).toFixed(1) : 0;
              return (
                <div key={shift.name} className="flex justify-between items-center text-sm">
                  <div className="flex items-center">
                    <span className="w-2.5 h-2.5 rounded-full mr-2" style={{ backgroundColor: shift.color }}></span>
                    <span className="text-slate-300">{shift.name}</span>
                  </div>
                  <span className="text-slate-400">{shift.value} <span className="text-xs text-slate-500">({perc}%)</span></span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Today's Activity */}
        <div className="bg-slate-800/40 backdrop-blur-sm p-6 rounded-2xl border border-slate-700/50 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-white">Today's Activity</h3>
            <button className="text-xs text-teal-400 hover:text-teal-300">View All</button>
          </div>
          <div className="flex-1 overflow-y-auto pr-2 space-y-4 custom-scrollbar">
            {recentActivities.length > 0 ? recentActivities.slice(0, 5).map((act, i) => (
              <div key={i} className="flex items-start space-x-4">
                <div className={`p-2 rounded-full ${act.bg}`}>
                  <act.icon className={`w-4 h-4 ${act.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-200 truncate">{act.type}</p>
                  <p className="text-xs text-slate-400 truncate">{act.desc}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-500">{format(new Date(act.time), 'hh:mm a')}</p>
                  {act.amount && <p className="text-xs font-medium text-teal-400 mt-0.5">₹{act.amount}</p>}
                </div>
              </div>
            )) : (
              <div className="text-center text-slate-500 text-sm mt-10">No recent activity</div>
            )}
          </div>
        </div>

      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Today's Shift Status Mini panel */}
        <div className="bg-slate-800/40 backdrop-blur-sm p-6 rounded-2xl border border-slate-700/50 lg:col-span-3">
          <h3 className="text-sm font-medium text-slate-400 mb-6 uppercase tracking-wider">Today's Shift Status</h3>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <div className="flex items-center"><span className="w-2 h-2 rounded-full bg-blue-500 mr-2"></span><span className="text-slate-300">Morning Shift</span></div>
                <span className="text-slate-400">{morningCount} / {totalSeats || 120}</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-1.5"><div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${totalSeats ? (morningCount/totalSeats)*100 : 0}%` }}></div></div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <div className="flex items-center"><span className="w-2 h-2 rounded-full bg-yellow-500 mr-2"></span><span className="text-slate-300">Day Shift</span></div>
                <span className="text-slate-400">{dayCount} / {totalSeats || 120}</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-1.5"><div className="bg-yellow-500 h-1.5 rounded-full" style={{ width: `${totalSeats ? (dayCount/totalSeats)*100 : 0}%` }}></div></div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <div className="flex items-center"><span className="w-2 h-2 rounded-full bg-red-500 mr-2"></span><span className="text-slate-300">Full Day</span></div>
                <span className="text-slate-400">{fullCount} / {totalSeats || 120}</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-1.5"><div className="bg-red-500 h-1.5 rounded-full" style={{ width: `${totalSeats ? (fullCount/totalSeats)*100 : 0}%` }}></div></div>
            </div>
          </div>
        </div>

        {/* Recent Members */}
        <div className="bg-slate-800/40 backdrop-blur-sm p-6 rounded-2xl border border-slate-700/50 lg:col-span-5 overflow-x-auto">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-white">Recent Members</h3>
            <button className="text-xs text-teal-400 hover:text-teal-300">View All</button>
          </div>
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="text-xs text-slate-500 border-b border-slate-700/50 pb-2">
              <tr>
                <th className="font-medium pb-3 px-2">Member Name</th>
                <th className="font-medium pb-3 px-2">Seat</th>
                <th className="font-medium pb-3 px-2">Shift</th>
                <th className="font-medium pb-3 px-2">Payment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {students.slice(0, 5).map(student => (
                <tr key={student._id} className="hover:bg-slate-800/30">
                  <td className="py-3 px-2 flex items-center">
                    <div className="w-6 h-6 rounded-full bg-slate-700 text-white flex items-center justify-center text-xs font-bold mr-3">
                      {student.fullName.charAt(0)}
                    </div>
                    <span className="text-slate-200">{student.fullName}</span>
                  </td>
                  <td className="py-3 px-2 text-slate-400">{student.seatNumber}</td>
                  <td className="py-3 px-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                      student.shift === 'Morning' ? 'bg-blue-500/10 text-blue-400' :
                      student.shift === 'Day' ? 'bg-yellow-500/10 text-yellow-400' :
                      'bg-red-500/10 text-red-400'
                    }`}>{student.shift}</span>
                  </td>
                  <td className="py-3 px-2">
                    <span className={`text-xs ${
                      student.fee.status === 'Paid' ? 'text-teal-400' :
                      student.fee.status === 'Pending' ? 'text-rose-400' :
                      'text-orange-400'
                    }`}>{student.fee.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Payment Overview Chart */}
        <div className="bg-slate-800/40 backdrop-blur-sm p-6 rounded-2xl border border-slate-700/50 lg:col-span-4 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-white">Payment Overview</h3>
            <button className="text-xs text-teal-400 hover:text-teal-300">View All</button>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <p className="text-xs text-slate-400 mb-1">Total Revenue</p>
              <p className="text-lg font-semibold text-white">₹{thisMonthRevenue}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-1">Pending Amount</p>
              <p className="text-lg font-semibold text-rose-400">₹{pendingAmount}</p>
            </div>
          </div>

          <div className="flex-1 min-h-[120px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lineChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} width={40} />
                <RechartsTooltip cursor={false} contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '8px', color: '#fff' }} />
                <Line type="monotone" dataKey="revenue" stroke="#14b8a6" strokeWidth={3} dot={{ r: 4, fill: '#14b8a6', strokeWidth: 0 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

    </div>
  );
};

export default Dashboard;
