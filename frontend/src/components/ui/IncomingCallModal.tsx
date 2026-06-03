//@ts-ignore
import { useAuthStore } from "@/store/useAuthStore";
import { useNavigate } from "react-router-dom";

export default function IncomingCallModal() {
  const { incomingCall, rejectCall, acceptCall, authUser } = useAuthStore();
  const navigate = useNavigate();

  if (!incomingCall) return null;

  const handleAccept = () => {
    acceptCall(incomingCall.roomId, incomingCall.from);
    navigate(`/call/${incomingCall.roomId}`);
  };

  const handleReject = () => {
    rejectCall(incomingCall.roomId, incomingCall.from);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
        <p className="text-lg font-semibold text-gray-900">Incoming video call</p>
        <p className="mt-2 text-sm text-gray-600">
          {authUser?.name || "Someone"} is calling you.
        </p>

        <div className="mt-6 flex gap-3">
          <button
            onClick={handleReject}
            className="flex-1 rounded-xl border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
          >
            Reject
          </button>
          <button
            onClick={handleAccept}
            className="flex-1 rounded-xl bg-gray-900 px-4 py-2 text-white hover:bg-black"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}