import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, IndianRupee, History } from 'lucide-react';
import { format } from 'date-fns';

const Payments = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash');

  const fetchStudents = async () => {
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (statusFilter) params.append('status', statusFilter);
      
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/students?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStudents(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [search, statusFilter]);

  const handleAddPayment = async (e) => {
    e.preventDefault();
    if (!selectedStudent || !paymentAmount) return;
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${import.meta.env.VITE_API_URL}/api/students/${selectedStudent._id}/payment`, {
        amount: paymentAmount,
        method: paymentMethod
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShowPaymentModal(false);
      setPaymentAmount('');
      fetchStudents();
    } catch (err) {
      alert(err.response?.data?.message || 'Error processing payment');
    }
  };

  const openPaymentModal = (student) => {
    setSelectedStudent(student);
    setShowPaymentModal(true);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Fee Management</h2>
        <p className="text-gray-500 dark:text-gray-400">Track and manage student payments.</p>
      </div>

      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search student..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="border rounded-lg px-4 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
          value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Status</option>
          <option value="Paid">Paid</option>
          <option value="Pending">Pending</option>
          <option value="Partial Paid">Partial Paid</option>
        </select>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
            <thead className="bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
              <tr>
                <th className="px-6 py-4 font-medium">Student Info</th>
                <th className="px-6 py-4 font-medium">Fee Breakdown</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Last Payment</th>
                <th className="px-6 py-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="5" className="text-center py-8">Loading...</td></tr>
              ) : students.length === 0 ? (
                <tr><td colSpan="5" className="text-center py-8">No records found</td></tr>
              ) : (
                students.map((student) => {
                  const lastPayment = student.fee.paymentHistory.length > 0 
                    ? student.fee.paymentHistory[student.fee.paymentHistory.length - 1] 
                    : null;
                  return (
                    <tr key={student._id} className="border-t border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900 dark:text-white">{student.fullName}</div>
                        <div className="text-xs text-gray-500">Seat: {student.seatNumber} ({student.shift})</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-gray-900 dark:text-white">Total: ₹{student.fee.total}</div>
                        <div className="text-green-600 dark:text-green-400">Paid: ₹{student.fee.paid}</div>
                        <div className="text-red-600 dark:text-red-400 font-medium">Due: ₹{student.fee.remaining}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          student.fee.status === 'Paid' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                          student.fee.status === 'Pending' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                          'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400'
                        }`}>
                          {student.fee.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {lastPayment ? (
                          <>
                            <div className="text-gray-900 dark:text-white">₹{lastPayment.amount} via {lastPayment.method}</div>
                            <div className="text-xs text-gray-500">{format(new Date(lastPayment.date), 'MMM dd, yyyy')}</div>
                          </>
                        ) : 'No payments'}
                      </td>
                      <td className="px-6 py-4">
                        {student.fee.remaining > 0 && (
                          <button
                            onClick={() => openPaymentModal(student)}
                            className="flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                          >
                            <IndianRupee className="w-4 h-4 mr-1" />
                            Add Payment
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showPaymentModal && selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md shadow-xl">
            <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Add Payment for {selectedStudent.fullName}</h3>
            <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Due: <span className="text-red-600 dark:text-red-400 font-bold text-lg ml-1">₹{selectedStudent.fee.remaining}</span></p>
            </div>
            <form onSubmit={handleAddPayment} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Amount to Pay</label>
                <div className="relative">
                  <IndianRupee className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="number"
                    required
                    max={selectedStudent.fee.remaining}
                    min="1"
                    className="w-full pl-9 pr-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Payment Method</label>
                <select
                  className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                >
                  <option value="Cash">Cash</option>
                  <option value="UPI">UPI</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button type="button" onClick={() => setShowPaymentModal(false)} className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Submit Payment</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Payments;
