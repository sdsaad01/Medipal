import { useEffect, useRef, useState } from "react";
import { Device, Call } from "@twilio/voice-sdk";

const TOKEN_URL =
  "https://cwlntqhxzipeuyoyrzfw.supabase.co/functions/v1/twilio-token";

export default function Consultation() {
  const [isCallActive, setIsCallActive] = useState(false);
  const [status, setStatus] = useState("Ready to call");

  const deviceRef = useRef<Device | null>(null);
  const callRef = useRef<Call | null>(null);

  const startCall = async () => {
    try {
      setStatus("Getting secure voice token...");

      const response = await fetch(TOKEN_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(
          `Token request failed: ${response.status}`,
        );
      }

      const data = await response.json();

      if (!data.token) {
        throw new Error(
          data.error || "No Twilio token received",
        );
      }

      setStatus("Connecting to MediPal...");

      const device = new Device(data.token, {
        logLevel: 1,
      });

      deviceRef.current = device;

      device.on("registered", () => {
        console.log("Twilio Device registered");
      });

      device.on("error", (error) => {
        console.error("Twilio Device error:", error);
        setStatus(`Call error: ${error.message}`);
        setIsCallActive(false);
      });

      device.on("incoming", (call) => {
        console.log("Incoming call:", call);
      });

      await device.register();

      console.log("Twilio Device ready");

      const call = await device.connect();

      callRef.current = call;

      call.on("accept", () => {
        console.log("Call accepted");
        setIsCallActive(true);
        setStatus("MediPal AI is connected");
      });

      call.on("disconnect", () => {
        console.log("Call disconnected");
        setIsCallActive(false);
        setStatus("Call ended");
      });

      call.on("cancel", () => {
        console.log("Call cancelled");
        setIsCallActive(false);
        setStatus("Call cancelled");
      });

      call.on("reject", () => {
        console.log("Call rejected");
        setIsCallActive(false);
        setStatus("Call rejected");
      });

      call.on("error", (error) => {
        console.error("Call error:", error);
        setIsCallActive(false);
        setStatus(`Call error: ${error.message}`);
      });

    } catch (error) {
      console.error("Start call error:", error);

      setIsCallActive(false);

      setStatus(
        error instanceof Error
          ? error.message
          : "Unable to start call",
      );
    }
  };

  const endCall = () => {
    console.log("Ending call...");

    callRef.current?.disconnect();

    deviceRef.current?.disconnectAll();

    deviceRef.current?.destroy();

    callRef.current = null;
    deviceRef.current = null;

    setIsCallActive(false);
    setStatus("Call ended");
  };

  useEffect(() => {
    return () => {
      callRef.current?.disconnect();
      deviceRef.current?.destroy();
    };
  }, []);

  return (
    <div className="max-w-2xl mx-auto p-6">

      <div className="bg-white rounded-2xl shadow-lg p-8 text-center">

        <h1 className="text-3xl font-bold mb-3">
          MediPal AI Consultation
        </h1>

        <p className="text-gray-600 mb-8">
          Talk to MediPal's AI voice assistant.
        </p>

        <div className="mb-6">
          <p className="text-sm text-gray-500">
            Status
          </p>

          <p className="font-medium mt-1">
            {status}
          </p>
        </div>

        {!isCallActive ? (
          <button
            onClick={startCall}
            className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-xl font-semibold text-lg"
          >
            📞 Start MediPal Call
          </button>
        ) : (
          <button
            onClick={endCall}
            className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-xl font-semibold text-lg"
          >
            ☎️ End Call
          </button>
        )}

      </div>

    </div>
  );
}