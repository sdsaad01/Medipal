// File: /src/components/ReviewForm.jsx

import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

export default function ReviewForm({ userId, doctorId }) {
  const [canReview, setCanReview] = useState(false);
  const [review, setReview] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAppointment = async () => {
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('user_id', userId)
        .eq('doctor_id', doctorId)
        .lt('date', new Date().toISOString()); // only past appointments

      if (data && data.length > 0) {
        setCanReview(true);
      }
      setLoading(false);
    };

    checkAppointment();
  }, [userId, doctorId]);

  const handleSubmit = async () => {
    if (!review.trim()) {
      setMessage("Review cannot be empty.");
      return;
    }

    const { error } = await supabase.from('reviews').insert({
      user_id: userId,
      doctor_id: doctorId,
      review_text: review,
    });

    setMessage(error ? "❌ Failed to submit review." : "✅ Review submitted successfully!");
    if (!error) setReview('');
  };

  if (loading) return <p>Checking appointment history...</p>;

  if (!canReview) return <p style={{ color: 'gray' }}>❌ You can only review doctors you've had appointments with.</p>;

  return (
    <div style={{ marginTop: '10px', padding: '10px', border: '1px solid #ccc', borderRadius: '10px' }}>
      <textarea
        rows="3"
        style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
        placeholder="Write your review here..."
        value={review}
        onChange={(e) => setReview(e.target.value)}
      />
      <button onClick={handleSubmit} style={{ backgroundColor: '#28a745', color: 'white', padding: '6px 12px', border: 'none', borderRadius: '6px' }}>
        Submit Review
      </button>
      <p>{message}</p>
    </div>
  );
}
