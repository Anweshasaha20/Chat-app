import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
//@ts-ignore
import { useAuthStore } from "@/store/useAuthStore";
import { Mic, MicOff, Video, VideoOff, PhoneOff } from "lucide-react";

type CallPageState = {
  peerUserId?: string;
  isCaller?: boolean;
};

type SignalPayload = {
  to: string;
  from: string;
  roomId: string;
  sdp?: RTCSessionDescriptionInit;
  candidate?: RTCIceCandidateInit;
};

const ICE_SERVERS: RTCIceServer[] = [
  { urls: "stun:stun.l.google.com:19302" },
  { urls: "stun:stun1.l.google.com:19302" },
];

export default function CallPage() {
  const { roomId } = useParams<{ roomId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { authUser, socket } = useAuthStore();

  const state = (location.state as CallPageState | null) ?? null;
  const peerUserId = state?.peerUserId ?? null;
  const isCaller = state?.isCaller ?? true;

  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteStreamRef = useRef<MediaStream | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const timeoutRef = useRef<number | null>(null);
  const isEndingRef = useRef(false);
  const callAcceptedRef = useRef(false);
  const offerSentRef = useRef(false);
  const pendingOfferRef = useRef<RTCSessionDescriptionInit | null>(null);
  const pendingIceCandidatesRef = useRef<RTCIceCandidateInit[]>([]);
  const [callStatus, setCallStatus] = useState("Connecting...");
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);

  const cleanupMedia = useCallback(() => {
    localStreamRef.current?.getTracks().forEach((track) => track.stop());
    localStreamRef.current = null;
    remoteStreamRef.current = null;

    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }

    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }

    if (peerConnectionRef.current) {
      peerConnectionRef.current.onicecandidate = null;
      peerConnectionRef.current.ontrack = null;
      peerConnectionRef.current.onconnectionstatechange = null;
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
  }, []);

  const toggleAudio = () => {
    const stream = localStreamRef.current;
    if (!stream) return;

    const nextMuted = !isAudioMuted;
    stream.getAudioTracks().forEach((track) => {
      track.enabled = !nextMuted;
    });
    setIsAudioMuted(nextMuted);
  };

  const toggleVideo = () => {
    const stream = localStreamRef.current;
    if (!stream) return;

    const nextVideoOff = !isVideoOff;
    stream.getVideoTracks().forEach((track) => {
      track.enabled = !nextVideoOff;
    });
    setIsVideoOff(nextVideoOff);
  };

  const endCall = useCallback(
    (notifyPeer: boolean) => {
      if (isEndingRef.current) return;
      isEndingRef.current = true;

      if (notifyPeer && socket && peerUserId && roomId && authUser?.userId) {
        socket.emit("call:hangup", {
          to: peerUserId,
          from: authUser.userId,
          roomId,
        });
      }

      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }

      cleanupMedia();
      navigate("/");
    },
    [authUser?.userId, cleanupMedia, navigate, peerUserId, roomId, socket],
  );

  useEffect(() => {
    if (!roomId || !peerUserId) {
      navigate(-1);
      return;
    }

    isEndingRef.current = false;
    callAcceptedRef.current = false;
    offerSentRef.current = false;
    pendingOfferRef.current = null;
    pendingIceCandidatesRef.current = [];
    setCallStatus(isCaller ? "Waiting for answer..." : "Waiting for caller...");

    let cancelled = false;

    const createPeerConnection = () => {
      if (peerConnectionRef.current || !localStreamRef.current) {
        return peerConnectionRef.current;
      }

      const peerConnection = new RTCPeerConnection({ iceServers: ICE_SERVERS });
      const remoteStream = new MediaStream();
      remoteStreamRef.current = remoteStream;

      localStreamRef.current.getTracks().forEach((track) => {
        peerConnection.addTrack(track, localStreamRef.current as MediaStream);
      });

      peerConnection.ontrack = (event) => {
        event.streams[0]?.getTracks().forEach((track) => {
          if (
            !remoteStream
              .getTracks()
              .some((existing) => existing.id === track.id)
          ) {
            remoteStream.addTrack(track);
          }
        });

        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = remoteStream;
        }

        setCallStatus("In call");
      };

      peerConnection.onicecandidate = (event) => {
        if (
          !event.candidate ||
          !socket ||
          !peerUserId ||
          !roomId ||
          !authUser?.userId
        ) {
          return;
        }

        socket.emit("call:ice-candidate", {
          to: peerUserId,
          from: authUser.userId,
          roomId,
          candidate: event.candidate.toJSON(),
        } satisfies SignalPayload);
      };

      peerConnection.onconnectionstatechange = () => {
        if (
          ["failed", "disconnected", "closed"].includes(
            peerConnection.connectionState,
          )
        ) {
          endCall(false);
        }
      };

      peerConnectionRef.current = peerConnection;
      return peerConnection;
    };

    const addPendingIceCandidates = async (
      peerConnection: RTCPeerConnection,
    ) => {
      while (pendingIceCandidatesRef.current.length) {
        const candidate = pendingIceCandidatesRef.current.shift();
        if (!candidate) continue;

        try {
          await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (error) {
          console.error("Error adding ICE candidate:", error);
        }
      }
    };

    const sendOffer = async () => {
      if (
        !socket ||
        !peerUserId ||
        !roomId ||
        !authUser?.userId ||
        offerSentRef.current
      ) {
        return;
      }

      const peerConnection = createPeerConnection();
      if (!peerConnection) return;

      offerSentRef.current = true;
      setCallStatus("Creating offer...");

      try {
        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);

        socket.emit("call:offer", {
          to: peerUserId,
          from: authUser.userId,
          roomId,
          sdp: offer,
        } satisfies SignalPayload);

        setCallStatus("Waiting for answer...");
      } catch (error) {
        console.error("Error creating offer:", error);
        toast.error("Could not start WebRTC call");
        endCall(false);
      }
    };

    const handleOffer = async (sdp: RTCSessionDescriptionInit) => {
      const peerConnection = createPeerConnection();
      if (!peerConnection) {
        pendingOfferRef.current = sdp;
        return;
      }

      try {
        setCallStatus("Connecting...");
        await peerConnection.setRemoteDescription(
          new RTCSessionDescription(sdp),
        );
        await addPendingIceCandidates(peerConnection);

        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);

        if (socket && peerUserId && roomId && authUser?.userId) {
          socket.emit("call:answer", {
            to: peerUserId,
            from: authUser.userId,
            roomId,
            sdp: answer,
          } satisfies SignalPayload);
        }

        setCallStatus("In call");
      } catch (error) {
        console.error("Error handling offer:", error);
        toast.error("Could not connect call");
        endCall(false);
      }
    };

    const handleAnswer = async (sdp: RTCSessionDescriptionInit) => {
      const peerConnection = createPeerConnection();
      if (!peerConnection) return;

      try {
        await peerConnection.setRemoteDescription(
          new RTCSessionDescription(sdp),
        );
        await addPendingIceCandidates(peerConnection);
        setCallStatus("In call");
      } catch (error) {
        console.error("Error handling answer:", error);
        toast.error("Could not connect call");
        endCall(false);
      }
    };

    const handleIceCandidate = async (candidate: RTCIceCandidateInit) => {
      const peerConnection = createPeerConnection();
      if (!peerConnection) {
        pendingIceCandidatesRef.current.push(candidate);
        return;
      }

      if (!peerConnection.remoteDescription) {
        pendingIceCandidatesRef.current.push(candidate);
        return;
      }

      try {
        await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (error) {
        console.error("Error adding remote ICE candidate:", error);
      }
    };

    const handleAccepted = (payload: { roomId: string; from: string }) => {
      if (payload.roomId !== roomId || payload.from !== peerUserId) return;

      callAcceptedRef.current = true;
      setCallStatus("Call accepted");

      if (isCaller) {
        void sendOffer();
      }
    };

    const handleHangup = (payload: { roomId: string; from: string }) => {
      if (payload.roomId !== roomId || payload.from !== peerUserId) return;
      endCall(false);
    };

    const initMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        localStreamRef.current = stream;
        setIsAudioMuted(false);
        setIsVideoOff(false);

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

        createPeerConnection();

        if (pendingOfferRef.current && !isCaller) {
          const pendingOffer = pendingOfferRef.current;
          pendingOfferRef.current = null;
          await handleOffer(pendingOffer);
          return;
        }

        if (isCaller && callAcceptedRef.current) {
          await sendOffer();
          return;
        }

        setCallStatus(
          isCaller ? "Waiting for answer..." : "Waiting for caller...",
        );
      } catch (error) {
        console.error("Error accessing media devices:", error);
        toast.error(
          "Camera and microphone access are required for video calls",
        );
        navigate("/");
      }
    };

    const handleIncomingOffer = async (payload: {
      roomId: string;
      from: string;
      sdp?: RTCSessionDescriptionInit;
    }) => {
      if (
        payload.roomId !== roomId ||
        payload.from !== peerUserId ||
        !payload.sdp
      )
        return;

      if (isCaller) return;

      if (!localStreamRef.current) {
        pendingOfferRef.current = payload.sdp;
        return;
      }

      await handleOffer(payload.sdp);
    };

    const handleIncomingAnswer = async (payload: {
      roomId: string;
      from: string;
      sdp?: RTCSessionDescriptionInit;
    }) => {
      if (
        payload.roomId !== roomId ||
        payload.from !== peerUserId ||
        !payload.sdp
      )
        return;
      await handleAnswer(payload.sdp);
    };

    const handleIncomingIceCandidate = async (payload: {
      roomId: string;
      from: string;
      candidate?: RTCIceCandidateInit;
    }) => {
      if (
        payload.roomId !== roomId ||
        payload.from !== peerUserId ||
        !payload.candidate
      )
        return;
      await handleIceCandidate(payload.candidate);
    };

    const handleAcceptedListener = (payload: {
      roomId: string;
      from: string;
    }) => {
      handleAccepted(payload);
    };

    void initMedia();

    timeoutRef.current = window.setTimeout(
      () => {
        endCall(true);
      },
      60 * 60 * 1000,
    );

    socket?.on("call:accepted", handleAcceptedListener);
    socket?.on("call:hangup", handleHangup);
    socket?.on("call:offer", handleIncomingOffer);
    socket?.on("call:answer", handleIncomingAnswer);
    socket?.on("call:ice-candidate", handleIncomingIceCandidate);

    return () => {
      cancelled = true;

      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }

      socket?.off("call:accepted", handleAcceptedListener);
      socket?.off("call:hangup", handleHangup);
      socket?.off("call:offer", handleIncomingOffer);
      socket?.off("call:answer", handleIncomingAnswer);
      socket?.off("call:ice-candidate", handleIncomingIceCandidate);

      cleanupMedia();
    };
  }, [
    authUser?.userId,
    cleanupMedia,
    endCall,
    isCaller,
    navigate,
    peerUserId,
    roomId,
    socket,
  ]);

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-slate-950 text-white">
      <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
        <div>
          <p className="text-sm font-medium text-white/70">WebRTC call</p>
          <p className="text-lg font-semibold">{callStatus}</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleAudio}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-slate-950 transition hover:bg-slate-200"
            aria-label={isAudioMuted ? "Unmute microphone" : "Mute microphone"}
          >
            {isAudioMuted ? (
              <MicOff className="h-5 w-5" />
            ) : (
              <Mic className="h-5 w-5" />
            )}
          </button>

          <button
            type="button"
            onClick={toggleVideo}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-slate-950 transition hover:bg-slate-200"
            aria-label={isVideoOff ? "Turn camera on" : "Turn camera off"}
          >
            {isVideoOff ? (
              <VideoOff className="h-5 w-5" />
            ) : (
              <Video className="h-5 w-5" />
            )}
          </button>

          <button
            type="button"
            onClick={() => endCall(true)}
            className="flex h-11 items-center gap-2 rounded-full bg-rose-500 px-4 text-sm font-medium text-white transition hover:bg-rose-600"
            aria-label="End call"
          >
            <PhoneOff className="h-5 w-5" />
            End call
          </button>
        </div>
      </div>

      <div className="grid flex-1 min-h-0 gap-4 p-4 lg:grid-cols-[1fr_320px]">
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-black">
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="h-full w-full object-cover"
          />

          <div className="absolute left-4 top-4 rounded-full bg-black/60 px-3 py-1 text-xs text-white/80">
            Remote video
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="overflow-hidden rounded-3xl border border-white/10 bg-black">
            <video
              ref={localVideoRef}
              autoPlay
              muted
              playsInline
              className="h-full w-full object-cover"
            />

            <div className="border-t border-white/10 px-4 py-3 text-sm text-white/70">
              Your camera
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
