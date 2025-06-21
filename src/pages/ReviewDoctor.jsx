// File: /src/pages/AppointmentsListPage.jsx

import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import ReviewForm from '../components/ReviewForm';

export default function AppointmentsListPage() {
  const [appointments, setAppointments] = useState([]);
  const userId = localStorage.getItem('user_id'); // or use your auth method

  useEffect(() => {
    const fetchAppointments = async () => {
      const { data, error } = await supabase
        .from('appointments')
        .select('*, doctors(name)')
        .eq('user_id', userId)
        .order('date', { ascending: false });

      if (data) setAppointments(data);
    };

    fetchAppointments();
  }, [userId]);

  return (
    <div style={{ padding: '20px' }}>
      <h2>My Past Appointments</h2>
      {appointments.map((appt) => (
        <div key={appt.id} style={{ border: '1px solid #ccc', padding: '15px', marginBottom: '15px', borderRadius: '10px' }}>
          <h4>Doctor: {appt.doctors?.name || 'Unknown'}</h4>
          <p>Date: {new Date(appt.date).toLocaleDateString()}</p>
          <p>Time: {appt.time}</p>

          {/* ✅ Review Form for Completed Appointments */}
          {new Date(appt.date) < new Date() && (
            <ReviewForm userId={userId} doctorId={appt.doctor_id} />
          )}
        </div>
      ))}
    </div>
  );
}
