import { useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
//@ts-ignore
import { useAuthStore } from "@/store/useAuthStore";

declare global {
  interface Window {
    JitsiMeetExternalAPI: any;
  }
}

export default function CallPage() {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const { authUser } = useAuthStore();

  const containerRef = useRef<HTMLDivElement | null>(null);
  const apiRef = useRef<any>(null);

  useEffect(() => {
    if (!roomId) {
      navigate(-1);
      return;
    }

    const displayName = authUser?.name || "Guest";
    const domain = "meet.jit.si";

    const createJitsi = () => {
      if (!containerRef.current) return;

      const options = {
        roomName: roomId,
        parentNode: containerRef.current,
        width: "100%",
        height: "100%",
        userInfo: {
          displayName,
        },
        configOverwrite: {
          disableDeepLinking: true,
          enableWelcomePage: false,
          prejoinPageEnabled: false,
        },
        interfaceConfigOverwrite: {
          SHOW_JITSI_WATERMARK: false,
          SHOW_WATERMARK_FOR_GUESTS: false,
          TOOLBAR_BUTTONS: [
            "microphone",
            "camera",
            "hangup",
            "chat",
            "tileview",
            "fullscreen",
            "settings",
          ],
        },
      };

      apiRef.current = new window.JitsiMeetExternalAPI(domain, options);

      apiRef.current.addEventListener("videoConferenceLeft", () => {
        navigate("/");
      });

      apiRef.current.addEventListener("readyToClose", () => {
        navigate("/");
      });
    };

    if (!window.JitsiMeetExternalAPI) {
      const script = document.createElement("script");
      script.src = "https://meet.jit.si/external_api.js";
      script.async = true;
      script.onload = createJitsi;
      document.body.appendChild(script);
    } else {
      createJitsi();
    }

    return () => {
      try {
        apiRef.current?.dispose();
      } catch (error) {
        console.error("Jitsi dispose error:", error);
      }
      apiRef.current = null;
    };
  }, [roomId, navigate, authUser?.name]);

  return (
    <div className="relative h-screen w-full bg-black">
      <div className="absolute left-4 top-4 z-50">
        <button
          className="rounded bg-white px-3 py-2 text-sm font-medium"
          onClick={() => {
            try {
              apiRef.current?.executeCommand("hangup");
            } catch (error) {
              console.error(error);
            }
            navigate("/");
          }}
        >
          Leave
        </button>
      </div>

      <div ref={containerRef} className="h-full w-full" />
    </div>
  );
}