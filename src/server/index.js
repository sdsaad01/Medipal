import express from 'express';
import bodyParser from 'body-parser';
import { createClient } from '@supabase/supabase-js';
import axios from 'axios';

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Supabase setup
const supabase = createClient(
  'https://cwlntqhxzipeuyoyrzfw.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN3bG50cWh4emlwZXV5b3lyemZ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg5Nzg0NzUsImV4cCI6MjA2NDU1NDQ3NX0.hjg_lmPB-PpJk0AuQtqvaUKwxy1E2nb9OfuHZEfBLCo'
);

// First endpoint that answers call and asks for appointment info
app.post('/twilio-voice', (req, res) => {
  const twiml = `
  <Response>
    <Gather input="speech" action="/voice-webhook" method="POST">
      <Say>Welcome to MediPal. Please tell me which doctor, date, and time you want the appointment for.</Say>
    </Gather>
  </Response>
  `;
  res.type('text/xml');
  res.send(twiml);
});

// Second endpoint that receives speech, uses Ollama to extract data, and stores in Supabase
app.post('/voice-webhook', async (req, res) => {
  const speech = req.body.SpeechResult;

  try {
    const aiResponse = await axios.post('http://localhost:11434/api/chat', {
      model: 'llama3', // Replace with the model name you're running (like 'mistral', 'llama3', etc.)
      messages: [
        {
          role: 'user',
          content: `Extract doctor, date, time, and reason from this: "${speech}". Respond ONLY in JSON with keys: doctor, date, time, reason.`,
        },
      ],
    });

    const info = JSON.parse(aiResponse.data.message.content);

    await supabase.from('appointments').insert([
      {
        doctor_name: info.doctor,
        date: info.date,
        time: info.time,
        notes: info.reason,
      },
    ]);

    res.type('text/xml');
    res.send(`<Response><Say>Your appointment has been booked. Thank you!</Say></Response>`);
  } catch (error) {
    console.error('Error:', error.message);
    res.type('text/xml');
    res.send(`<Response><Say>Sorry, I couldn't process your request. Please try again.</Say></Response>`);
  }
});

app.listen(5173, () => {
  console.log('Server running on http://localhost:5173');
});
