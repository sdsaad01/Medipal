import "jsr:@supabase/functions-js/edge-runtime.d.ts";

function base64UrlEncode(data: Uint8Array): string {
  let binary = "";

  for (const byte of data) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function encode(value: unknown): string {
  return base64UrlEncode(
    new TextEncoder().encode(JSON.stringify(value)),
  );
}

async function signHS256(
  data: string,
  secret: string,
): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    {
      name: "HMAC",
      hash: "SHA-256",
    },
    false,
    ["sign"],
  );

  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(data),
  );

  return base64UrlEncode(
    new Uint8Array(signature),
  );
}

Deno.serve(async (req) => {
  try {
    if (req.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "content-type",
        },
      });
    }

    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({
          error: "POST required",
        }),
        {
          status: 405,
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
    }

    const accountSid =
      Deno.env.get("TWILIO_ACCOUNT_SID");

    const apiKeySid =
      Deno.env.get("TWILIO_API_KEY_SID");

    const apiKeySecret =
      Deno.env.get("TWILIO_API_KEY_SECRET");

    const twimlAppSid =
      Deno.env.get("TWILIO_TWIML_APP_SID");

    if (
      !accountSid ||
      !apiKeySid ||
      !apiKeySecret ||
      !twimlAppSid
    ) {
      console.error(
        "Missing Twilio configuration",
      );

      return new Response(
        JSON.stringify({
          error: "Twilio configuration is incomplete",
        }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        },
      );
    }

    const identity =
      `medipal-${crypto.randomUUID()}`;

    const now =
      Math.floor(Date.now() / 1000);

    /*
     * Twilio Access Token header
     *
     * cty is required by Twilio's
     * Access Token format.
     */
    const header = {
      typ: "JWT",
      alg: "HS256",
      cty: "twilio-fpa;v=1",
    };

    /*
     * Twilio Voice Access Token payload
     */
    const payload = {
      jti: `${apiKeySid}-${now}`,
      iss: apiKeySid,
      sub: accountSid,

      iat: now,
      exp: now + 3600,

      grants: {
        identity,

        voice: {
          outgoing: {
            application_sid: twimlAppSid,
          },

          incoming: {
            allow: true,
          },
        },
      },
    };

    const encodedHeader = encode(header);
    const encodedPayload = encode(payload);

    const unsignedToken =
      `${encodedHeader}.${encodedPayload}`;

    const signature = await signHS256(
      unsignedToken,
      apiKeySecret,
    );

    const token =
      `${unsignedToken}.${signature}`;

    console.log(
      "Generated Twilio Voice token for identity:",
      identity,
    );

    return new Response(
      JSON.stringify({
        token,
        identity,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      },
    );
  } catch (error) {
    console.error(
      "Twilio token generation error:",
      error,
    );

    return new Response(
      JSON.stringify({
        error:
          error instanceof Error
            ? error.message
            : "Token generation failed",
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      },
    );
  }
});