import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Plus, Edit, Trash2, X, Eye } from 'lucide-react';
import { format, addDays } from 'date-fns';

const Students = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [shiftFilter, setShiftFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [roomFilter, setRoomFilter] = useState('');
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewData, setViewData] = useState(null);
  const [showSeatSelector, setShowSeatSelector] = useState(false);
  const [allSeats, setAllSeats] = useState([]);

  const initialFormState = {
    fullName: '', mobileNumber: '', studentId: '', address: '',
    shift: 'Morning', roomType: 'Normal', seatNumber: '', joiningDate: format(new Date(), 'yyyy-MM-dd'),
    amountPaid: '', paymentMethod: 'Cash', remark: '', isPayLater: false
  };

  const [formData, setFormData] = useState(initialFormState);
  const [editData, setEditData] = useState(null);
  const [feeStructure, setFeeStructure] = useState(null);

  const fetchFees = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/fees`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFeeStructure(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchStudents = async () => {
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (shiftFilter) params.append('shift', shiftFilter);
      if (statusFilter) params.append('status', statusFilter);
      if (roomFilter) params.append('roomType', roomFilter);

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

  const fetchAllSeats = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/seats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAllSeats(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchStudents();
    fetchFees();
  }, [search, shiftFilter, statusFilter, roomFilter]);

  const getCalculatedTotal = () => {
    if (!feeStructure) return 0;
    const { shift, roomType } = formData;
    if (shift === 'Morning') return roomType === 'AC' ? feeStructure.morningAC : feeStructure.morningNormal;
    if (shift === 'Day') return roomType === 'AC' ? feeStructure.dayAC : feeStructure.dayNormal;
    return roomType === 'AC' ? feeStructure.fullAC : feeStructure.fullNormal;
  };
  
  const calculatedTotal = getCalculatedTotal();
  const currentPaid = parseFloat(formData.amountPaid) || 0;
  const currentRemaining = Math.max(0, calculatedTotal - currentPaid);

  const handleInputChange = (e, isEdit = false) => {
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : value;
    
    if (isEdit) {
      setEditData({ ...editData, [name]: val });
    } else {
      setFormData({ ...formData, [name]: val });
    }
  };

  const handlePhoneChange = (e, isEdit = false) => {
    const value = e.target.value;
    // Only allow numeric and max 10 digits
    if (/^\d{0,10}$/.test(value)) {
      if (isEdit) {
        setEditData({ ...editData, mobileNumber: value });
      } else {
        setFormData({ ...formData, mobileNumber: value });
      }
    }
  };

  const handleStudentIdChange = (e, isEdit = false) => {
    let value = e.target.value.toUpperCase();
    if (!value.startsWith('S') && value.length > 0) {
      value = 'S' + value.replace(/[^0-9]/g, '');
    }
    // Only allow 'S' followed by digits
    if (/^S\d*$/.test(value) || value === '') {
      if (isEdit) {
        setEditData({ ...editData, studentId: value });
      } else {
        setFormData({ ...formData, studentId: value });
      }
    }
  };

  const handleAddStudent = async (e) => {
    e.preventDefault();
    if (formData.mobileNumber.length !== 10) {
      return alert("Mobile number must be exactly 10 digits.");
    }
    if (!/^S\d+$/.test(formData.studentId)) {
      return alert("Student ID must start with 'S' followed by numbers (e.g., S01).");
    }
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${import.meta.env.VITE_API_URL}/api/students`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShowAddModal(false);
      fetchStudents();
      setFormData(initialFormState);
    } catch (err) {
      alert(err.response?.data?.message || 'Error adding student');
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (editData.mobileNumber.length !== 10) {
      return alert("Mobile number must be exactly 10 digits.");
    }
    if (!/^S\d+$/.test(editData.studentId)) {
      return alert("Student ID must start with 'S' followed by numbers (e.g., S01).");
    }
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${import.meta.env.VITE_API_URL}/api/students/${editData._id}`, editData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShowEditModal(false);
      fetchStudents();
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating student');
    }
  };

  const openEditModal = (student) => {
    setEditData({ ...student });
    setShowEditModal(true);
  };

  const openViewModal = (student) => {
    setViewData(student);
    setShowViewModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this student?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/students/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchStudents();
    } catch (err) {
      alert('Error deleting student');
    }
  };

  const getSeatStatus = (seat) => {
    if (seat.occupants.full) return 'Full';
    if (seat.occupants.morning && seat.occupants.day) return 'Shared Full';
    if (seat.occupants.morning) return 'Morning';
    if (seat.occupants.day) return 'Day';
    return 'Available';
  };

  const isSeatSelectable = (seat) => {
    const status = getSeatStatus(seat);
    if (formData.shift === 'Full Shift') return status === 'Available';
    if (formData.shift === 'Morning') return status === 'Available' || status === 'Day';
    if (formData.shift === 'Day') return status === 'Available' || status === 'Morning';
    return false;
  };

  const handleSeatSelect = (seat) => {
    if (!isSeatSelectable(seat)) return;
    setFormData({ ...formData, seatNumber: seat.seatNumber });
    setShowSeatSelector(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Students</h2>
          <p className="text-gray-500 dark:text-gray-400">Manage all student records and details.</p>
        </div>
        <button
          onClick={() => { setFormData(initialFormState); setShowAddModal(true); }}
          className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Student
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search name, phone, seat..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="border rounded-lg px-4 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
          value={shiftFilter} onChange={(e) => setShiftFilter(e.target.value)}
        >
          <option value="">All Shifts</option>
          <option value="Morning">Morning</option>
          <option value="Day">Day</option>
          <option value="Full Shift">Full Shift</option>
        </select>
        <select
          className="border rounded-lg px-4 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
          value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Payments</option>
          <option value="Paid">Paid</option>
          <option value="Pending">Pending</option>
          <option value="Partial Paid">Partial Paid</option>
        </select>
        <select
          className="border rounded-lg px-4 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
          value={roomFilter} onChange={(e) => setRoomFilter(e.target.value)}
        >
          <option value="">All Rooms</option>
          <option value="Normal">Normal</option>
          <option value="AC">AC</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
            <thead className="bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
              <tr>
                <th className="px-6 py-4 font-medium">Student</th>
                <th className="px-6 py-4 font-medium">Contact</th>
                <th className="px-6 py-4 font-medium">Seat & Shift</th>
                <th className="px-6 py-4 font-medium">Expiry Date</th>
                <th className="px-6 py-4 font-medium">Payment Status</th>
                <th className="px-6 py-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" className="text-center py-8">Loading...</td></tr>
              ) : students.length === 0 ? (
                <tr><td colSpan="6" className="text-center py-8">No students found</td></tr>
              ) : (
                students.map((student) => (
                  <tr 
                    key={student._id} 
                    onClick={() => openViewModal(student)}
                    className="border-t border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer"
                  >
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900 dark:text-white">{student.fullName}</div>
                      <div className="text-xs text-gray-500">ID: {student.studentId}</div>
                    </td>
                    <td className="px-6 py-4">{student.mobileNumber}</td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900 dark:text-white">{student.seatNumber} ({student.roomType})</div>
                      <div className="text-xs text-gray-500">{student.shift}</div>
                    </td>
                    <td className="px-6 py-4 text-orange-500 dark:text-orange-400 font-medium">
                      {format(addDays(new Date(student.joiningDate || student.createdAt), 30), 'MMM dd, yyyy')}
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
                      <div className="flex space-x-3">
                        <button 
                          onClick={(e) => { e.stopPropagation(); openEditModal(student); }} 
                          className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleDelete(student._id); }} 
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-3xl overflow-hidden shadow-xl">
            <div className="flex justify-between items-center p-6 border-b dark:border-gray-700">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Add New Student</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-500">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleAddStudent} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
                  <input required type="text" name="fullName" value={formData.fullName} onChange={(e) => handleInputChange(e)} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mobile Number</label>
                  <input required type="text" name="mobileNumber" value={formData.mobileNumber} onChange={(e) => handlePhoneChange(e)} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Student ID</label>
                  <input required type="text" name="studentId" value={formData.studentId} onChange={(e) => handleStudentIdChange(e)} placeholder="e.g., S01" className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Room Type</label>
                  <select name="roomType" value={formData.roomType} onChange={(e) => handleInputChange(e)} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                    <option value="Normal">Normal</option>
                    <option value="AC">AC</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Shift</label>
                  <select name="shift" value={formData.shift} onChange={(e) => handleInputChange(e)} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                    <option value="Morning">Morning (6AM-2PM)</option>
                    <option value="Day">Day (2PM-10PM)</option>
                    <option value="Full Shift">Full Shift (6AM-10PM)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Seat Number</label>
                  <div className="flex space-x-2">
                    <input required readOnly type="text" name="seatNumber" placeholder="Select a seat" value={formData.seatNumber} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white bg-gray-50 dark:bg-gray-600 cursor-not-allowed" />
                    <button type="button" onClick={() => { fetchAllSeats(); setShowSeatSelector(true); }} className="px-4 py-2 bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300 rounded-lg hover:bg-indigo-200 dark:hover:bg-indigo-800 transition-colors whitespace-nowrap">
                      Choose Seat
                    </button>
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Address</label>
                  <textarea required name="address" value={formData.address} onChange={(e) => handleInputChange(e)} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" rows="2"></textarea>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Joining Date</label>
                  <input required type="date" name="joiningDate" value={formData.joiningDate} onChange={(e) => handleInputChange(e)} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Remark (Optional)</label>
                  <input type="text" name="remark" placeholder="Any specific note..." value={formData.remark} onChange={(e) => handleInputChange(e)} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                </div>
                
                {/* Payment Section */}
                <div className="md:col-span-2 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-100 dark:border-gray-700 space-y-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white">Fee Details</h4>
                  
                  <div className="bg-indigo-50 dark:bg-indigo-900/30 p-3 rounded-lg flex justify-between items-center text-indigo-900 dark:text-indigo-200">
                    <span className="font-medium">Expected Total Fee:</span>
                    <span className="text-xl font-bold">₹{calculatedTotal}</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Amount Paid (₹)</label>
                      <input type="number" min="0" required name="amountPaid" value={formData.amountPaid} onChange={(e) => handleInputChange(e)} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                      <div className="mt-2 text-sm">
                        <span className="text-gray-500 dark:text-gray-400">Remaining (Pay Later): </span>
                        <span className={`font-semibold ${currentRemaining > 0 ? 'text-red-500' : 'text-green-500'}`}>
                          ₹{currentRemaining}
                        </span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Payment Method</label>
                      <select name="paymentMethod" value={formData.paymentMethod} onChange={(e) => handleInputChange(e)} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                        <option value="Cash">Cash</option>
                        <option value="UPI">UPI</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>
                </div>

              </div>
              <div className="flex justify-end space-x-3 pt-4 border-t dark:border-gray-700 mt-4">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Save Student</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editData && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-3xl overflow-hidden shadow-xl">
            <div className="flex justify-between items-center p-6 border-b dark:border-gray-700">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Edit Student Details</h3>
              <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-500">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
                  <input required type="text" name="fullName" value={editData.fullName} onChange={(e) => handleInputChange(e, true)} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mobile Number</label>
                  <input required type="text" name="mobileNumber" value={editData.mobileNumber} onChange={(e) => handlePhoneChange(e, true)} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Student ID</label>
                  <input required type="text" name="studentId" value={editData.studentId} onChange={(e) => handleStudentIdChange(e, true)} placeholder="e.g., S01" className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Address</label>
                  <textarea required name="address" value={editData.address} onChange={(e) => handleInputChange(e, true)} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" rows="2"></textarea>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Joining Date</label>
                  <input required type="date" name="joiningDate" value={editData.joiningDate ? editData.joiningDate.split('T')[0] : ''} onChange={(e) => handleInputChange(e, true)} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Remark</label>
                  <input type="text" name="remark" value={editData.remark || ''} onChange={(e) => handleInputChange(e, true)} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                </div>
                <div className="md:col-span-2 p-3 bg-yellow-50 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 rounded-lg text-sm">
                  Note: Editing Shift, Room Type, or Seat is disabled to prevent conflicts. Please delete and re-add the student for a seat change.
                </div>
              </div>
              <div className="flex justify-end space-x-3 pt-4 border-t dark:border-gray-700 mt-4">
                <button type="button" onClick={() => setShowEditModal(false)} className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Update Student</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Seat Selector Modal */}
      {showSeatSelector && (
        <div className="fixed inset-0 z-[60] overflow-y-auto flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-4xl overflow-hidden shadow-xl flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-6 border-b dark:border-gray-700 shrink-0">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Select a Seat</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Showing seats for {formData.roomType} Room. Shift: {formData.shift}
                </p>
              </div>
              <button onClick={() => setShowSeatSelector(false)} className="text-gray-400 hover:text-gray-500">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto grow">
              <div className="flex flex-wrap gap-4 mb-6">
                <div className="flex items-center"><div className="w-4 h-4 bg-gray-100 dark:bg-gray-700 rounded mr-2 border"></div><span className="text-sm dark:text-gray-300">Available</span></div>
                <div className="flex items-center"><div className="w-4 h-4 bg-blue-100 dark:bg-blue-900/30 rounded mr-2 border"></div><span className="text-sm dark:text-gray-300">Morning Occupied</span></div>
                <div className="flex items-center"><div className="w-4 h-4 bg-yellow-100 dark:bg-yellow-900/30 rounded mr-2 border"></div><span className="text-sm dark:text-gray-300">Day Occupied</span></div>
                <div className="flex items-center"><div className="w-4 h-4 bg-red-100 dark:bg-red-900/30 rounded mr-2 border"></div><span className="text-sm dark:text-gray-300">Fully Occupied</span></div>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-8 gap-3">
                {allSeats
                  .filter(s => s.roomType === formData.roomType)
                  .sort((a, b) => {
                    const numA = parseInt(a.seatNumber.replace(/\D/g, ''));
                    const numB = parseInt(b.seatNumber.replace(/\D/g, ''));
                    return numA - numB;
                  })
                  .map(seat => {
                    const status = getSeatStatus(seat);
                    const selectable = isSeatSelectable(seat);
                    
                    let bgClass = 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'; // Available
                    if (status === 'Full' || status === 'Shared Full') bgClass = 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 opacity-50 cursor-not-allowed';
                    else if (status === 'Morning') bgClass = 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
                    else if (status === 'Day') bgClass = 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';

                    if (!selectable && status !== 'Full' && status !== 'Shared Full') {
                      bgClass += ' opacity-50 cursor-not-allowed';
                    }

                    return (
                      <div 
                        key={seat._id}
                        onClick={() => handleSeatSelect(seat)}
                        className={`p-3 rounded-xl border text-center transition-all ${bgClass} ${selectable ? 'cursor-pointer hover:shadow-md hover:ring-2 hover:ring-indigo-500' : ''}`}
                      >
                        <div className="text-sm font-bold">{seat.seatNumber}</div>
                        <div className="text-[10px] uppercase mt-1 truncate">{status}</div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* View Modal */}
      {showViewModal && viewData && (
        <div className="fixed inset-0 z-[70] overflow-y-auto flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md overflow-hidden shadow-xl">
            <div className="flex justify-between items-center p-6 border-b dark:border-gray-700">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
                <Eye className="w-5 h-5 mr-2 text-indigo-500" />
                Member Details
              </h3>
              <button onClick={() => setShowViewModal(false)} className="text-gray-400 hover:text-gray-500">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                  {viewData.fullName.charAt(0)}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-sm">
                <div>
                  <p className="text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">Full Name</p>
                  <p className="font-medium text-gray-900 dark:text-white mt-1">{viewData.fullName}</p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">Student ID</p>
                  <p className="font-medium text-gray-900 dark:text-white mt-1">{viewData.studentId}</p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">Contact</p>
                  <p className="font-medium text-gray-900 dark:text-white mt-1">{viewData.mobileNumber}</p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">Joining Date</p>
                  <p className="font-medium text-gray-900 dark:text-white mt-1">
                    {format(new Date(viewData.joiningDate || viewData.createdAt), 'MMM dd, yyyy')}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">Expiry Date</p>
                  <p className="font-medium text-orange-500 dark:text-orange-400 mt-1">
                    {format(addDays(new Date(viewData.joiningDate || viewData.createdAt), 30), 'MMM dd, yyyy')}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">Shift</p>
                  <p className="font-medium text-gray-900 dark:text-white mt-1">{viewData.shift}</p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">Seat & Room</p>
                  <p className="font-medium text-gray-900 dark:text-white mt-1">{viewData.seatNumber} ({viewData.roomType})</p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">Payment Status</p>
                  <p className={`font-medium mt-1 ${
                    viewData.fee.status === 'Paid' ? 'text-green-500' :
                    viewData.fee.status === 'Pending' ? 'text-red-500' : 'text-orange-500'
                  }`}>
                    {viewData.fee.status}
                  </p>
                </div>
                <div className="col-span-2 bg-gray-50 dark:bg-gray-700/50 p-3 rounded-xl border dark:border-gray-600 mt-2">
                  <p className="text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider mb-1">Financials</p>
                  <div className="flex justify-between">
                    <span className="text-gray-700 dark:text-gray-300">Total Fee: ₹{viewData.fee.total}</span>
                    <span className="text-gray-700 dark:text-gray-300">Paid: ₹{viewData.fee.paid}</span>
                    <span className="text-red-500 font-medium">Pending: ₹{viewData.fee.remaining}</span>
                  </div>
                </div>
                {viewData.address && (
                  <div className="col-span-2">
                    <p className="text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">Address</p>
                    <p className="font-medium text-gray-900 dark:text-white mt-1">{viewData.address}</p>
                  </div>
                )}
                {viewData.remark && (
                  <div className="col-span-2">
                    <p className="text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">Remark</p>
                    <p className="font-medium text-gray-900 dark:text-white mt-1">{viewData.remark}</p>
                  </div>
                )}
              </div>
            </div>
            <div className="p-4 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-800/80 flex justify-end">
              <button onClick={() => setShowViewModal(false)} className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Students;
