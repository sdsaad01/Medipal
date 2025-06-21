import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import Chatbot from '../components/Chatbot';

interface Appointment {
  id: string;
  doctor_name: string;
  date: string;
  status: string;
  expected_fee?: number;
  final_fee?: number;
}

interface ReviewMap {
  [appointmentId: string]: boolean;
}

export default function Dashboard() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [reviews, setReviews] = useState<ReviewMap>({});
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUser(user);

      const { data: appointmentsData } = await supabase
        .from('appointments')
        .select('*')
        .eq('user_id', user.id);

      const { data: reviewsData } = await supabase
        .from('reviews')
        .select('*');

      const reviewMap: ReviewMap = {};
      reviewsData?.forEach((r: any) => {
        reviewMap[r.appointment_id] = true;
      });

      setAppointments(appointmentsData || []);
      setReviews(reviewMap);
    };

    fetchData();
  }, []);

  const handleReviewSubmit = async (appointmentId: string) => {
    if (!user) return;
    await supabase.from('reviews').insert({
      user_id: user.id,
      appointment_id: appointmentId,
      rating,
      review_text: reviewText
    });
    alert('Review submitted!');
    setReviewText('');
    setRating(0);
    setReviews((prev) => ({ ...prev, [appointmentId]: true }));
  };

  return (
    <div className="p-8 bg-gradient-to-br from-blue-50 via-cyan-50 to-sky-100 min-h-screen font-sans text-gray-800">
      <h2 className="text-4xl font-extrabold mb-10 text-center text-sky-800 drop-shadow flex items-center justify-center">
        🏥 <span className="ml-3">Welcome to <span className="text-blue-500">MediPal</span> Dashboard</span>
      </h2>

      {appointments.length === 0 && (
        <p className="text-center text-gray-600 text-lg italic">No appointments found.</p>
      )}

      <div className="overflow-x-auto rounded-xl shadow-md mt-6">
        <table className="min-w-full bg-white text-sm text-left text-gray-700">
          <thead className="bg-gradient-to-r from-sky-300 via-blue-400 to-cyan-400 text-white uppercase">
            <tr>
              <th className="px-6 py-3">Doctor 👨‍⚕️</th>
              <th className="px-6 py-3">Date 📅</th>
              <th className="px-6 py-3">Status 📍</th>
              <th className="px-6 py-3">Expected Fee 💰</th>
              <th className="px-6 py-3">Final Fee 💳</th>
              <th className="px-6 py-3">Actions ⚙️</th>
            </tr>
          </thead>
          <tbody>
            {appointments.map((appt, i) => (
              <tr key={appt.id} className={`${i % 2 === 0 ? 'bg-sky-50' : 'bg-white'} hover:bg-blue-100 transition`}>
                <td className="px-6 py-4 font-semibold text-blue-800">{appt.doctor_name}</td>
                <td className="px-6 py-4">{appt.date}</td>
                <td className="px-6 py-4">
                  <span className="inline-block bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-semibold">{appt.status}</span>
                </td>
                <td className="px-6 py-4">₹{appt.expected_fee ?? '-'}</td>
                <td className="px-6 py-4">₹{appt.final_fee ?? '-'}</td>
                <td className="px-6 py-4 space-y-2">
                  {appt.final_fee !== undefined && appt.expected_fee !== undefined && appt.final_fee !== appt.expected_fee && (
                    <div className="bg-yellow-100 border border-yellow-300 text-yellow-800 p-2 rounded text-sm">
                      ⚠️ Fee changed!
                      <button
                        onClick={async () => {
                          await supabase.from('appointments').update({ payment_status: 'refund_requested' }).eq('id', appt.id);
                          alert('Refund requested!');
                        }}
                        className="block text-red-700 underline hover:text-red-900 text-xs mt-1"
                      >
                        Request Refund
                      </button>
                    </div>
                  )}
                  {appt.status === 'completed' && !reviews[appt.id] && (
                    <div className="bg-blue-50 p-3 rounded shadow-sm border">
                      <p className="font-semibold text-blue-600 mb-1">⭐ Leave a Review</p>
                      <input
                        type="number"
                        placeholder="Rating (1-5)"
                        min="1"
                        max="5"
                        value={rating}
                        onChange={(e) => setRating(Number(e.target.value))}
                        className="border border-gray-300 p-2 rounded w-full mb-2 text-sm"
                      />
                      <textarea
                        placeholder="Write your feedback..."
                        value={reviewText}
                        onChange={(e) => setReviewText(e.target.value)}
                        className="border border-gray-300 p-2 rounded w-full text-sm mb-2"
                      />
                      <button
                        onClick={() => handleReviewSubmit(appt.id)}
                        className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 text-sm"
                      >
                        Submit
                      </button>
                    </div>
                  )}
                  {reviews[appt.id] && <p className="text-green-600 text-sm">✅ Reviewed</p>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Chatbot */}
      <div className="mt-20 bg-white p-8 rounded-2xl shadow-lg border border-blue-200 max-w-4xl mx-auto">
        <h3 className="text-2xl font-bold text-blue-800 mb-4">💬 MediPal Chatbot</h3>
        <Chatbot />
      </div>
    </div>
  );
}
