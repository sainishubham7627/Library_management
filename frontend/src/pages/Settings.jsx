import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Save, AlertTriangle, X, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Settings = () => {
  const [fees, setFees] = useState({
    morningNormal: 450,
    morningAC: 500,
    dayNormal: 450,
    dayAC: 500,
    fullNormal: 700,
    fullAC: 750
  });
  const [seatsConfig, setSeatsConfig] = useState({ normal: 49, ac: 25 });
  const [loading, setLoading] = useState(true);

  // General password confirmation state for Fees/Seats
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [pendingAction, setPendingAction] = useState(null); // 'fees' or 'seats'
  const [generalPassword, setGeneralPassword] = useState('');
  const [generalError, setGeneralError] = useState('');

  // Delete account state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [password, setPassword] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        
        // Fetch Fees
        const resFees = await axios.get(`${import.meta.env.VITE_API_URL}/api/fees`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (resFees.data) setFees(resFees.data);

        // Fetch Seats to derive counts
        const resSeats = await axios.get(`${import.meta.env.VITE_API_URL}/api/seats`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (resSeats.data) {
          const normal = resSeats.data.filter(s => s.roomType === 'Normal').length;
          const ac = resSeats.data.filter(s => s.roomType === 'AC').length;
          setSeatsConfig({ normal, ac });
        }

      } catch (err) {
        console.error('Failed to load settings data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const triggerFeeSave = (e) => { e.preventDefault(); setPendingAction('fees'); setShowPasswordModal(true); };
  const triggerSeatSave = (e) => { e.preventDefault(); setPendingAction('seats'); setShowPasswordModal(true); };

  const executeAction = async (e) => {
    e.preventDefault();
    setGeneralError('');
    try {
      const token = localStorage.getItem('token');
      if (pendingAction === 'fees') {
        await axios.put(`${import.meta.env.VITE_API_URL}/api/fees`, { feesData: fees, password: generalPassword }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        alert('Fee structure updated successfully!');
      } else if (pendingAction === 'seats') {
        await axios.put(`${import.meta.env.VITE_API_URL}/api/seats/config`, { normalSeatsCount: seatsConfig.normal, acSeatsCount: seatsConfig.ac, password: generalPassword }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        alert('Seat configuration updated successfully!');
      }
      setShowPasswordModal(false);
      setGeneralPassword('');
    } catch (err) {
      setGeneralError(err.response?.data?.message || 'Failed to update configuration');
    }
  };

  const handleChange = (e) => {
    setFees({ ...fees, [e.target.name]: parseInt(e.target.value) || 0 });
  };

  const handleDeleteAccount = async (e) => {
    e.preventDefault();
    setDeleteError('');
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/auth/account`, {
        headers: { Authorization: `Bearer ${token}` },
        data: { password }
      });
      alert('Account and all associated data deleted successfully.');
      localStorage.removeItem('token');
      navigate('/login');
      window.location.reload();
    } catch (err) {
      setDeleteError(err.response?.data?.message || 'Failed to delete account');
    }
  };

  if (loading) return <div className="text-center py-10 dark:text-white">Loading settings...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h2>
        <p className="text-gray-500 dark:text-gray-400">Manage your library's capacity and fee structure.</p>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 max-w-3xl">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Seat Configuration</h3>
        <form onSubmit={triggerSeatSave} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Number of Normal Seats</label>
              <input type="number" min="0" value={seatsConfig.normal} onChange={(e) => setSeatsConfig({...seatsConfig, normal: parseInt(e.target.value)||0})} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
            </div>
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Number of AC Seats</label>
              <input type="number" min="0" value={seatsConfig.ac} onChange={(e) => setSeatsConfig({...seatsConfig, ac: parseInt(e.target.value)||0})} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
            </div>
          </div>
          <div className="flex justify-end pt-4 border-t dark:border-gray-700">
            <button type="submit" className="flex items-center px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
              <Save className="w-4 h-4 mr-2" /> Save Seats
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 max-w-3xl">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Fee Structure (₹)</h3>
        <form onSubmit={triggerFeeSave} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-700 dark:text-gray-300 border-b pb-2 dark:border-gray-700">Normal Room</h4>
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Morning Shift (6AM - 2PM)</label>
                <input type="number" name="morningNormal" value={fees.morningNormal} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
              </div>
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Day Shift (2PM - 10PM)</label>
                <input type="number" name="dayNormal" value={fees.dayNormal} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
              </div>
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Full Shift (6AM - 10PM)</label>
                <input type="number" name="fullNormal" value={fees.fullNormal} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
              </div>
            </div>
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-700 dark:text-gray-300 border-b pb-2 dark:border-gray-700">AC Room</h4>
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Morning Shift (6AM - 2PM)</label>
                <input type="number" name="morningAC" value={fees.morningAC} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
              </div>
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Day Shift (2PM - 10PM)</label>
                <input type="number" name="dayAC" value={fees.dayAC} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
              </div>
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Full Shift (6AM - 10PM)</label>
                <input type="number" name="fullAC" value={fees.fullAC} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
              </div>
            </div>
          </div>
          <div className="flex justify-end pt-4 border-t dark:border-gray-700">
            <button type="submit" className="flex items-center px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
              <Save className="w-4 h-4 mr-2" /> Save Fees
            </button>
          </div>
        </form>
      </div>

      {/* Danger Zone */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-red-200 dark:border-red-900/30 max-w-3xl mt-8">
        <h3 className="text-xl font-bold text-red-600 dark:text-red-500 mb-2 flex items-center">
          <AlertTriangle className="w-5 h-5 mr-2" />
          Danger Zone
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Permanently delete your administrator account. This action will immediately and permanently erase all your data, including all configured seats, student records, and fee history. This action cannot be undone.
        </p>
        <button 
          onClick={() => setShowDeleteModal(true)}
          className="px-6 py-2 bg-red-100 text-red-600 hover:bg-red-600 hover:text-white dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-600 dark:hover:text-white rounded-lg transition-colors font-medium"
        >
          Delete Account & All Data
        </button>
      </div>

      {/* Password Confirmation Modal for Updates */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md overflow-hidden shadow-xl border border-gray-100 dark:border-gray-700">
            <div className="flex justify-between items-center p-6 border-b dark:border-gray-700">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
                <Lock className="w-5 h-5 text-indigo-500 mr-2" />
                Security Verification
              </h3>
              <button onClick={() => {setShowPasswordModal(false); setGeneralPassword(''); setGeneralError('');}} className="text-gray-400 hover:text-gray-500">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={executeAction} className="p-6 space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                To apply these {pendingAction === 'seats' ? 'seat configuration' : 'fee structure'} changes, please enter your admin password.
              </p>
              
              <div>
                <input 
                  required 
                  type="password" 
                  value={generalPassword}
                  onChange={(e) => setGeneralPassword(e.target.value)}
                  placeholder="Admin Password" 
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white outline-none" 
                />
              </div>

              {generalError && (
                <div className="text-sm text-red-500 font-medium">{generalError}</div>
              )}

              <div className="flex justify-end space-x-3 pt-4 mt-2">
                <button type="button" onClick={() => {setShowPasswordModal(false); setGeneralPassword(''); setGeneralError('');}} className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600">Cancel</button>
                <button type="submit" disabled={!generalPassword} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed">Verify & Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md overflow-hidden shadow-xl border border-red-100 dark:border-red-900/50">
            <div className="flex justify-between items-center p-6 border-b dark:border-gray-700">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
                <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
                Confirm Account Deletion
              </h3>
              <button onClick={() => {setShowDeleteModal(false); setPassword(''); setDeleteError('');}} className="text-gray-400 hover:text-gray-500">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleDeleteAccount} className="p-6 space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Are you absolutely sure? This will delete your account, <strong>ALL</strong> student records, and <strong>ALL</strong> seat data associated with your library. 
              </p>
              <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-100 dark:border-red-900/30">
                <p className="text-xs text-red-800 dark:text-red-300 font-medium">To verify, please enter your admin password below:</p>
              </div>
              
              <div>
                <input 
                  required 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Admin Password" 
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:text-white outline-none" 
                />
              </div>

              {deleteError && (
                <div className="text-sm text-red-500 font-medium">{deleteError}</div>
              )}

              <div className="flex justify-end space-x-3 pt-4 mt-2">
                <button type="button" onClick={() => {setShowDeleteModal(false); setPassword(''); setDeleteError('');}} className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600">Cancel</button>
                <button type="submit" disabled={!password} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed">Permanently Delete</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
