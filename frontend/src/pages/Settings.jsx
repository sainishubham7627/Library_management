import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Save } from 'lucide-react';

const Settings = () => {
  const [fees, setFees] = useState({
    morningNormal: 450,
    morningAC: 500,
    dayNormal: 450,
    dayAC: 500,
    fullNormal: 700,
    fullAC: 750
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFees = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:5000/api/fees', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data) {
          setFees(res.data);
        }
      } catch (err) {
        console.error('Failed to load fee structure', err);
      } finally {
        setLoading(false);
      }
    };
    fetchFees();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.put('http://localhost:5000/api/fees', fees, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Fee structure updated successfully!');
    } catch (err) {
      alert('Failed to update fee structure');
    }
  };

  const handleChange = (e) => {
    setFees({ ...fees, [e.target.name]: parseInt(e.target.value) || 0 });
  };

  if (loading) return <div className="text-center py-10 dark:text-white">Loading settings...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h2>
        <p className="text-gray-500 dark:text-gray-400">Manage application configuration and fee structures.</p>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 max-w-3xl">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Fee Structure (₹)</h3>
        <form onSubmit={handleSave} className="space-y-6">
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
              <Save className="w-4 h-4 mr-2" /> Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Settings;
