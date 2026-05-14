import React, { useState, useEffect } from 'react';
import axios from 'axios';

const SeatCard = ({ seat, onClick }) => {
  const getStatus = () => {
    if (seat.occupants.full) return 'Full';
    if (seat.occupants.morning && seat.occupants.day) return 'Shared Full';
    if (seat.occupants.morning) return 'Morning';
    if (seat.occupants.day) return 'Day';
    return 'Available';
  };

  const status = getStatus();

  let bgClass = 'bg-gray-100 dark:bg-gray-700'; // Available
  if (status === 'Full' || status === 'Shared Full') bgClass = 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800';
  else if (status === 'Morning') bgClass = 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800';
  else if (status === 'Day') bgClass = 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800';

  return (
    <div 
      onClick={() => onClick(seat)}
      className={`p-4 rounded-xl border cursor-pointer hover:shadow-md transition-all ${bgClass}`}
    >
      <div className="text-lg font-bold mb-1">{seat.seatNumber}</div>
      <div className="text-xs font-medium uppercase tracking-wider">{status}</div>
    </div>
  );
};

const Seats = () => {
  const [seats, setSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSeat, setSelectedSeat] = useState(null);

  const fetchSeats = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/seats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSeats(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSeats();
  }, []);

  const initSeats = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${import.meta.env.VITE_API_URL}/api/seats/init`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchSeats();
    } catch (err) {
      alert(err.response?.data?.message || 'Error initializing seats');
    }
  };

  if (loading) return <div className="text-center py-10 dark:text-white">Loading seats...</div>;

  const normalSeats = seats.filter(s => s.roomType === 'Normal').sort((a, b) => parseInt(a.seatNumber.slice(1)) - parseInt(b.seatNumber.slice(1)));
  const acSeats = seats.filter(s => s.roomType === 'AC').sort((a, b) => parseInt(a.seatNumber.slice(2)) - parseInt(b.seatNumber.slice(2)));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Seat Layout</h2>
          <p className="text-gray-500 dark:text-gray-400">Visual representation of seat availability.</p>
        </div>
        {seats.length === 0 && (
          <button onClick={initSeats} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
            Initialize Seats
          </button>
        )}
      </div>

      <div className="flex gap-4 mb-6">
        <div className="flex items-center"><div className="w-4 h-4 bg-gray-100 dark:bg-gray-700 rounded mr-2 border"></div><span className="text-sm dark:text-gray-300">Available</span></div>
        <div className="flex items-center"><div className="w-4 h-4 bg-blue-100 dark:bg-blue-900/30 rounded mr-2 border"></div><span className="text-sm dark:text-gray-300">Morning Occupied</span></div>
        <div className="flex items-center"><div className="w-4 h-4 bg-yellow-100 dark:bg-yellow-900/30 rounded mr-2 border"></div><span className="text-sm dark:text-gray-300">Day Occupied</span></div>
        <div className="flex items-center"><div className="w-4 h-4 bg-red-100 dark:bg-red-900/30 rounded mr-2 border"></div><span className="text-sm dark:text-gray-300">Fully Occupied</span></div>
      </div>

      {seats.length > 0 && (
        <>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
            <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Normal Hall (H1 - H49)</h3>
            <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-7 lg:grid-cols-10 gap-4">
              {normalSeats.map(seat => (
                <SeatCard key={seat._id} seat={seat} onClick={setSelectedSeat} />
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
            <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">AC Room (AC01 - AC25)</h3>
            <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-7 lg:grid-cols-10 gap-4">
              {acSeats.map(seat => (
                <SeatCard key={seat._id} seat={seat} onClick={setSelectedSeat} />
              ))}
            </div>
          </div>
        </>
      )}

      {selectedSeat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md shadow-xl">
            <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Seat {selectedSeat.seatNumber} Details</h3>
            <div className="space-y-4">
              <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Full Shift Occupant</p>
                <p className="text-gray-900 dark:text-white font-medium">{selectedSeat.occupants.full ? selectedSeat.occupants.full.fullName : 'None'}</p>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Morning Shift Occupant</p>
                <p className="text-gray-900 dark:text-white font-medium">{selectedSeat.occupants.morning ? selectedSeat.occupants.morning.fullName : 'None'}</p>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Day Shift Occupant</p>
                <p className="text-gray-900 dark:text-white font-medium">{selectedSeat.occupants.day ? selectedSeat.occupants.day.fullName : 'None'}</p>
              </div>
            </div>
            <button onClick={() => setSelectedSeat(null)} className="mt-6 w-full py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Seats;
