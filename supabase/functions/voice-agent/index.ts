import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY =
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY
);

const FUNCTION_URL =
  "https://cwlntqhxzipeuyoyrzfw.supabase.co/functions/v1/voice-agent";

/* =========================================================
   XML
========================================================= */

function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function twiml(content: string) {
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>
<Response>
${content}
</Response>`,
    {
      status: 200,
      headers: {
        "Content-Type": "text/xml; charset=UTF-8",
      },
    }
  );
}

/* =========================================================
   SPEAK + LISTEN
========================================================= */

function ask(
  step: string,
  message: string,
  params: Record<string, string> = {}
) {
  const query = new URLSearchParams({
    step,
    ...params,
  });

  const action = `${FUNCTION_URL}?${query.toString()}`;

  return `
<Gather
  input="speech"
  action="${escapeXml(action)}"
  method="POST"
  language="en-IN"
  speechTimeout="auto"
  timeout="10">

  <Say voice="alice">
    ${escapeXml(message)}
  </Say>

</Gather>

<Say voice="alice">
  I didn't hear your response. Let's try that again.
</Say>

${askAgain(step, params)}
`;
}

function askAgain(
  step: string,
  params: Record<string, string>
) {
  const query = new URLSearchParams({
    step,
    ...params,
  });

  const action = `${FUNCTION_URL}?${query.toString()}`;

  return `
<Gather
  input="speech"
  action="${escapeXml(action)}"
  method="POST"
  language="en-IN"
  speechTimeout="auto"
  timeout="10">

  <Say voice="alice">
    Please tell me your answer when you're ready.
  </Say>

</Gather>
`;
}

/* =========================================================
   NORMALIZE
========================================================= */

function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[.,!?]/g, " ")
    .replace(/\bdoctor\b/g, " ")
    .replace(/\bdr\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/* =========================================================
   DOCTOR MATCHING
========================================================= */

function findDoctor(
  speech: string,
  doctors: any[]
) {
  const spoken = normalize(speech);

  console.log(
    "NORMALIZED DOCTOR SPEECH:",
    spoken
  );

  for (const doctor of doctors) {
    const name = normalize(doctor.name);

    console.log(
      "COMPARING:",
      spoken,
      "WITH:",
      name
    );

    if (
      spoken === name ||
      spoken.includes(name) ||
      name.includes(spoken)
    ) {
      return doctor;
    }

    const words = spoken.split(" ");

    for (const word of words) {
      if (
        word.length >= 3 &&
        name.includes(word)
      ) {
        return doctor;
      }
    }
  }

  return null;
}

/* =========================================================
   DATE HELPERS
========================================================= */

const months: Record<string, number> = {
  january: 0,
  february: 1,
  march: 2,
  april: 3,
  may: 4,
  june: 5,
  july: 6,
  august: 7,
  september: 8,
  october: 9,
  november: 10,
  december: 11,
};

const weekdays: Record<string, number> = {
  sunday: 0,
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
};

function formatDate(date: Date): string {
  return `${date.getFullYear()}-${String(
    date.getMonth() + 1
  ).padStart(2, "0")}-${String(
    date.getDate()
  ).padStart(2, "0")}`;
}

function spokenDate(date: string): string {
  const d = new Date(`${date}T00:00:00`);

  return d.toLocaleDateString(
    "en-IN",
    {
      day: "numeric",
      month: "long",
      year: "numeric",
    }
  );
}

function parseDate(text: string): string | null {
  let value = text
    .toLowerCase()
    .trim();

  value = value
    .replace(/(\d+)(st|nd|rd|th)/g, "$1")
    .replace(/[,]/g, " ");

  const now = new Date();

  /* TODAY */

  if (
    value.includes("today")
  ) {
    return formatDate(now);
  }

  /* TOMORROW */

  if (
    value.includes("tomorrow")
  ) {
    const d = new Date(now);

    d.setDate(
      d.getDate() + 1
    );

    return formatDate(d);
  }

  /* DAY AFTER TOMORROW */

  if (
    value.includes("day after tomorrow")
  ) {
    const d = new Date(now);

    d.setDate(
      d.getDate() + 2
    );

    return formatDate(d);
  }

  /* NUMERIC DATE */

  const numeric = value.match(
    /(\d{1,2})[\/\-](\d{1,2})(?:[\/\-](\d{4}))?/
  );

  if (numeric) {
    const day = Number(numeric[1]);
    const month = Number(numeric[2]) - 1;
    const year = numeric[3]
      ? Number(numeric[3])
      : now.getFullYear();

    const d = new Date(
      year,
      month,
      day
    );

    return formatDate(d);
  }

  /* MONTH + DAY */

  for (const monthName in months) {
    if (
      value.includes(monthName)
    ) {
      const match = value.match(
        /\b(\d{1,2})\b/
      );

      if (match) {
        const day = Number(match[1]);

        let year =
          now.getFullYear();

        let d = new Date(
          year,
          months[monthName],
          day
        );

        if (
          d.getTime() <
          new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate()
          ).getTime()
        ) {
          d = new Date(
            year + 1,
            months[monthName],
            day
          );
        }

        return formatDate(d);
      }
    }
  }

  /* DAY + MONTH */

  const dayMonth = value.match(
    /\b(\d{1,2})\s+([a-z]+)\b/
  );

  if (dayMonth) {
    const day = Number(dayMonth[1]);
    const monthName = dayMonth[2];

    if (
      months[monthName] !== undefined
    ) {
      let year =
        now.getFullYear();

      let d = new Date(
        year,
        months[monthName],
        day
      );

      if (
        d <
        new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate()
        )
      ) {
        d = new Date(
          year + 1,
          months[monthName],
          day
        );
      }

      return formatDate(d);
    }
  }

  /* WEEKDAY */

  for (const dayName in weekdays) {
    if (
      value.includes(dayName)
    ) {
      const today =
        now.getDay();

      const target =
        weekdays[dayName];

      let difference =
        target - today;

      if (difference <= 0) {
        difference += 7;
      }

      const d = new Date(now);

      d.setDate(
        d.getDate() + difference
      );

      return formatDate(d);
    }
  }

  return null;
}

/* =========================================================
   TIME
========================================================= */

function parseTime(text: string): string | null {
  const value = text
    .toLowerCase()
    .replace(/\./g, "")
    .trim();

  let meridiem:
    | "am"
    | "pm"
    | null = null;

  if (
    value.includes("morning")
  ) {
    meridiem = "am";
  }

  if (
    value.includes("afternoon") ||
    value.includes("evening") ||
    value.includes("night")
  ) {
    meridiem = "pm";
  }

  const match = value.match(
    /(\d{1,2})(?:\s*(?:[:]\s*(\d{1,2})))?\s*(am|pm)?/
  );

  if (!match) {
    return null;
  }

  let hour = Number(match[1]);

  const minute = Number(
    match[2] || "0"
  );

  if (match[3]) {
    meridiem = match[3] as
      | "am"
      | "pm";
  }

  if (
    hour < 1 ||
    hour > 23 ||
    minute > 59
  ) {
    return null;
  }

  if (
    meridiem === "pm" &&
    hour < 12
  ) {
    hour += 12;
  }

  if (
    meridiem === "am" &&
    hour === 12
  ) {
    hour = 0;
  }

  /*
   * If user says "5" without AM/PM,
   * interpret it according to common
   * appointment hours.
   */

  if (!meridiem) {
    if (
      hour >= 1 &&
      hour <= 7
    ) {
      hour += 12;
    }
  }

  return `${String(hour).padStart(
    2,
    "0"
  )}:${String(minute).padStart(
    2,
    "0"
  )}:00`;
}

function spokenTime(time: string): string {
  const [h, m] =
    time.split(":");

  let hour = Number(h);

  const period =
    hour >= 12 ? "PM" : "AM";

  if (hour === 0) {
    hour = 12;
  }

  if (hour > 12) {
    hour -= 12;
  }

  if (Number(m) === 0) {
    return `${hour} ${period}`;
  }

  return `${hour}:${m} ${period}`;
}

/* =========================================================
   MAIN
========================================================= */

Deno.serve(async (req) => {
  console.log(
    "========== MEDIPAL VOICE AGENT =========="
  );

  try {
    const url = new URL(req.url);

    const step =
      url.searchParams.get("step") ||
      "doctor";

    const doctor =
      url.searchParams.get("doctor") ||
      "";

    const date =
      url.searchParams.get("date") ||
      "";

    const time =
      url.searchParams.get("time") ||
      "";

    console.log(
      "STEP:",
      step
    );

    console.log(
      "DOCTOR:",
      doctor
    );

    console.log(
      "DATE:",
      date
    );

    console.log(
      "TIME:",
      time
    );

    /* =====================================================
       START CALL
    ===================================================== */

    if (req.method !== "POST") {
      return twiml(
        ask(
          "doctor",
          "Welcome to MediPal. I’m your virtual appointment assistant. I can help you find a doctor and book an appointment. To get started, which doctor would you like to see?"
        )
      );
    }

    /* =====================================================
       READ SPEECH
    ===================================================== */

    const form =
      await req.formData();

    const speechValue =
      form.get("SpeechResult");

    const speech = speechValue
      ? String(speechValue).trim()
      : "";

    console.log(
      "SPEECH RESULT:",
      speech
    );

    /* =====================================================
       DOCTOR
    ===================================================== */

    if (
      step === "doctor"
    ) {
      if (!speech) {
        return twiml(
          ask(
            "doctor",
            "I didn't catch the doctor's name. Please tell me which doctor you'd like to see."
          )
        );
      }

      console.log(
        "DOCTOR SPEECH RECEIVED:",
        speech
      );

      const {
        data: doctors,
        error,
      } = await supabase
        .from("doctors")
        .select(
          "id,name,specialization,active"
        )
        .eq(
          "active",
          true
        );

      if (error) {
        console.error(
          "DOCTOR QUERY ERROR:",
          error
        );

        throw error;
      }

      const matched =
        findDoctor(
          speech,
          doctors || []
        );

      console.log(
        "MATCHED DOCTOR:",
        JSON.stringify(
          matched
        )
      );

      if (!matched) {
        return twiml(
          ask(
            "doctor",
            "I’m sorry, I couldn’t identify that doctor. Please say the doctor's name again."
          )
        );
      }

      return twiml(
        ask(
          "date",
          `Certainly. You would like to see ${matched.name}. What date would you prefer for your appointment? You can say a date such as 25 September, tomorrow, or Monday.`,
          {
            doctor:
              matched.name,
          }
        )
      );
    }

    /* =====================================================
       DATE
    ===================================================== */

    if (
      step === "date"
    ) {
      console.log(
        "DATE SPEECH RECEIVED:",
        speech
      );

      if (!speech) {
        return twiml(
          ask(
            "date",
            "I didn't catch the date. Please tell me your preferred appointment date.",
            {
              doctor,
            }
          )
        );
      }

      const parsed =
        parseDate(speech);

      console.log(
        "PARSED DATE:",
        parsed
      );

      if (!parsed) {
        return twiml(
          ask(
            "date",
            "I’m sorry, I didn't understand that date. Please say something like 25 September, tomorrow, or Monday.",
            {
              doctor,
            }
          )
        );
      }

      /*
       * Don't immediately ask again.
       * Confirm what we understood.
       */

      return twiml(
        ask(
          "time",
          `Thank you. I have your preferred date as ${spokenDate(parsed)}. What time would you prefer for the appointment?`,
          {
            doctor,
            date: parsed,
          }
        )
      );
    }

    /* =====================================================
       TIME
    ===================================================== */

    if (
      step === "time"
    ) {
      console.log(
        "TIME SPEECH RECEIVED:",
        speech
      );

      if (!speech) {
        return twiml(
          ask(
            "time",
            "I didn't catch the time. Please tell me what time you'd like the appointment.",
            {
              doctor,
              date,
            }
          )
        );
      }

      const parsed =
        parseTime(speech);

      console.log(
        "PARSED TIME:",
        parsed
      );

      if (!parsed) {
        return twiml(
          ask(
            "time",
            "I’m sorry, I didn't understand the time. Please say something like 10 AM, 2 PM, or 5 in the evening.",
            {
              doctor,
              date,
            }
          )
        );
      }

      /*
       * Check if slot already exists
       */

      const {
        data: existing,
        error,
      } = await supabase
        .from("appointments")
        .select("id")
        .eq(
          "doctor",
          doctor
        )
        .eq(
          "appointment_date",
          date
        )
        .eq(
          "appointment_time",
          parsed
        )
        .neq(
          "status",
          "cancelled"
        )
        .limit(1);

      if (error) {
        console.error(
          "SLOT CHECK ERROR:",
          error
        );

        throw error;
      }

      if (
        existing &&
        existing.length > 0
      ) {
        return twiml(
          ask(
            "time",
            `I'm sorry, ${spokenTime(parsed)} is already booked for ${doctor}. Please choose another time.`,
            {
              doctor,
              date,
            }
          )
        );
      }

      /*
       * Ask reason
       */

      return twiml(
        ask(
          "reason",
          `Perfect. ${spokenTime(parsed)} is available with ${doctor}. Before I confirm the appointment, may I know the reason for your visit?`,
          {
            doctor,
            date,
            time: parsed,
          }
        )
      );
    }

    /* =====================================================
       REASON
    ===================================================== */

    if (
      step === "reason"
    ) {
      console.log(
        "REASON:",
        speech
      );

      if (!speech) {
        return twiml(
          ask(
            "reason",
            "I didn't catch that. Could you briefly tell me the reason for your visit?",
            {
              doctor,
              date,
              time,
            }
          )
        );
      }

      /*
       * Final confirmation before booking
       */

      return twiml(
        ask(
          "confirm",
          `Let me confirm the details. Your appointment is with ${doctor}, on ${spokenDate(date)}, at ${spokenTime(time)}. You mentioned that the reason for your visit is ${speech}. Shall I confirm this appointment? Please say yes or no.`,
          {
            doctor,
            date,
            time,
            reason: speech,
          }
        )
      );
    }

    /* =====================================================
       CONFIRMATION
    ===================================================== */

    if (
      step === "confirm"
    ) {
      const answer =
        speech.toLowerCase();

      console.log(
        "CONFIRMATION ANSWER:",
        answer
      );

      const positive =
        answer.includes("yes") ||
        answer.includes("confirm") ||
        answer.includes("correct") ||
        answer.includes("okay") ||
        answer.includes("ok");

      const negative =
        answer.includes("no") ||
        answer.includes("cancel") ||
        answer.includes("change");

      if (negative) {
        return twiml(`
<Say voice="alice">
No problem. I haven't booked the appointment.
Thank you for contacting MediPal.
</Say>

<Hangup/>
`);
      }

      if (!positive) {
        return twiml(
          ask(
            "confirm",
            "Would you like me to confirm the appointment? Please say yes or no.",
            {
              doctor,
              date,
              time,
              reason:
                url.searchParams.get(
                  "reason"
                ) || "",
            }
          )
        );
      }

      const reason =
        url.searchParams.get(
          "reason"
        ) || "General consultation";

      /*
       * CREATE APPOINTMENT
       */

      const {
        data: appointment,
        error,
      } = await supabase
        .from("appointments")
        .insert({
          doctor,
          appointment_date: date,
          appointment_time: time,
          notes: reason,
          status: "confirmed",
        })
        .select()
        .single();

      if (error) {
        console.error(
          "APPOINTMENT INSERT ERROR:",
          error
        );

        throw error;
      }

      console.log(
        "APPOINTMENT CREATED:",
        appointment?.id
      );

      return twiml(`
<Say voice="alice">
Your appointment has been successfully confirmed.
You are booked with ${escapeXml(
        doctor
      )} on ${escapeXml(
        spokenDate(date)
      )} at ${escapeXml(
        spokenTime(time)
      )}.
Thank you for choosing MediPal.
We look forward to helping you.
</Say>

<Hangup/>
`);
    }

    /* =====================================================
       UNKNOWN STEP
    ===================================================== */

    console.log(
      "UNKNOWN STEP:",
      step
    );

    return twiml(`
<Say voice="alice">
I'm sorry, I couldn't continue with your appointment.
Please call MediPal again and I'll be happy to help.
</Say>

<Hangup/>
`);
  } catch (error) {
    console.error(
      "MEDIPAL VOICE AGENT ERROR:",
      error
    );

    return twiml(`
<Say voice="alice">
I'm sorry, something went wrong while processing your appointment.
Please try again in a moment.
</Say>

<Hangup/>
`);
  }
});