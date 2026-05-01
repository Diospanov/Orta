import { createContext, useContext, useEffect, useRef, useState } from "react";

const CallContext = createContext(null);

function getInitial(name) {
  return name?.trim()?.charAt(0)?.toUpperCase() || "U";
}

function buildIceServers() {
  const iceServers = [
    {
      urls: import.meta.env.VITE_STUN_URL || "stun:stun.l.google.com:19302",
    },
  ];

  if (
    import.meta.env.VITE_TURN_URL &&
    import.meta.env.VITE_TURN_USERNAME &&
    import.meta.env.VITE_TURN_CREDENTIAL
  ) {
    iceServers.push({
      urls: import.meta.env.VITE_TURN_URL,
      username: import.meta.env.VITE_TURN_USERNAME,
      credential: import.meta.env.VITE_TURN_CREDENTIAL,
    });
  }

  return iceServers;
}

export function CallProvider({ children }) {
  const [incomingCall, setIncomingCall] = useState(null);
  const [callStatus, setCallStatus] = useState("idle");
  const [callMode, setCallMode] = useState(null);

  const [activeCallUserId, setActiveCallUserId] = useState(null);
  const [activeCallUsername, setActiveCallUsername] = useState("");

  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);

  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [isCallMinimized, setIsCallMinimized] = useState(false);

  const socketRef = useRef(null);
  const currentTeamIdRef = useRef(null);

  const peerConnectionRef = useRef(null);
  const localStreamRef = useRef(null);
  const remoteStreamRef = useRef(null);

  const callStatusRef = useRef("idle");
  const callModeRef = useRef(null);
  const activeCallUserIdRef = useRef(null);
  const pendingIceCandidatesRef = useRef([]);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  const remoteVideoContainerRef = useRef(null);
  const [isRemoteFullscreen, setIsRemoteFullscreen] = useState(false);

  const screenStreamRef = useRef(null);
  const [isScreenSharing, setIsScreenSharing] = useState(false);

  function setCallStatusSafe(status) {
    callStatusRef.current = status;
    setCallStatus(status);
  }

  function setActiveCallTarget(userId, username = "") {
    const normalizedUserId = Number(userId);

    activeCallUserIdRef.current = normalizedUserId;
    setActiveCallUserId(normalizedUserId);
    setActiveCallUsername(username);
  }

  function sendWsEvent(payload) {
    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
      console.error("Call WebSocket is not connected.");
      return false;
    }

    socketRef.current.send(JSON.stringify(payload));
    return true;
  }

  function connectCallSocket(teamId) {
    return new Promise((resolve, reject) => {
      const normalizedTeamId = Number(teamId);

      if (
        socketRef.current &&
        socketRef.current.readyState === WebSocket.OPEN &&
        currentTeamIdRef.current === normalizedTeamId
      ) {
        resolve(true);
        return;
      }

      if (
        socketRef.current &&
        socketRef.current.readyState === WebSocket.CONNECTING &&
        currentTeamIdRef.current === normalizedTeamId
      ) {
        resolve(true);
        return;
      }

      const token = localStorage.getItem("token");

      if (!token) {
        reject(new Error("No auth token found"));
        return;
      }

      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
      }

      const apiUrl = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

      const wsBaseUrl = apiUrl
        .replace(/^http:\/\//, "ws://")
        .replace(/^https:\/\//, "wss://")
        .replace(/\/$/, "");

      const wsUrl = `${wsBaseUrl}/teams/${normalizedTeamId}/ws?token=${encodeURIComponent(
        token
      )}`;

      const socket = new WebSocket(wsUrl);

      socketRef.current = socket;
      currentTeamIdRef.current = normalizedTeamId;

      socket.onopen = () => {
        console.log("Call WebSocket connected:", wsUrl);
        resolve(true);
      };

      socket.onmessage = async (event) => {
        try {
          const data = JSON.parse(event.data);
          await handleSocketData(data);
        } catch (error) {
          console.error("Failed to handle call socket message:", error);
        }
      };

      socket.onerror = (error) => {
        console.error("Call WebSocket error:", error);
        reject(error);
      };

      socket.onclose = (event) => {
        console.log("Call WebSocket closed:", event.code, event.reason);
      };
    });
  }

  async function handleSocketData(data) {
    if (data.type === "call_invite") {
      if (callStatusRef.current !== "idle") {
        sendWsEvent({
          type: "call_reject",
          target_user_id: data.from_user_id,
        });
        return;
      }

      setIncomingCall(data);
      callModeRef.current = data.call_mode;
      setCallMode(data.call_mode);
      setCallStatusSafe("ringing");
      setIsCallMinimized(false);
    }

    if (data.type === "call_accept") {
      setCallStatusSafe("connecting");
      await createAndSendOffer(Number(data.from_user_id));
    }

    if (data.type === "call_reject") {
      alert(`${data.from_username} rejected the call.`);
      cleanupCall(false);
    }

    if (data.type === "call_end") {
      alert(`${data.from_username} ended the call.`);
      cleanupCall(false);
    }

    if (data.type === "webrtc_offer") {
      await handleWebrtcOffer(data);
    }

    if (data.type === "webrtc_answer") {
      await handleWebrtcAnswer(data);
    }

    if (data.type === "ice_candidate") {
      await handleIceCandidate(data);
    }

    if (data.type === "error") {
      console.error("WS server error:", data.detail);
    }
  }

  async function getLocalMedia(mode) {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: mode === "video",
    });

    stream.getAudioTracks().forEach((track) => {
      track.enabled = true;
    });

    stream.getVideoTracks().forEach((track) => {
      track.enabled = true;
    });

    localStreamRef.current = stream;
    setLocalStream(stream);

    setIsMicMuted(false);
    setIsCameraOff(false);

    return stream;
  }

  function createPeerConnection(targetUserId, stream) {
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
    }

    const pc = new RTCPeerConnection({
      iceServers: buildIceServers(),
    });

    peerConnectionRef.current = pc;

    stream.getTracks().forEach((track) => {
      pc.addTrack(track, stream);
    });

    pc.ontrack = (event) => {
      const [streamFromRemote] = event.streams;

      remoteStreamRef.current = streamFromRemote;
      setRemoteStream(streamFromRemote);
      setCallStatusSafe("connected");
    };

    pc.onicecandidate = (event) => {
      if (!event.candidate) return;

      sendWsEvent({
        type: "ice_candidate",
        target_user_id: targetUserId,
        candidate: event.candidate,
      });
    };

    pc.onconnectionstatechange = () => {
      console.log("WebRTC state:", pc.connectionState);
    };

    return pc;
  }

  async function flushPendingIceCandidates() {
    const pc = peerConnectionRef.current;
    if (!pc || !pc.remoteDescription) return;

    const candidates = pendingIceCandidatesRef.current;
    pendingIceCandidatesRef.current = [];

    for (const candidate of candidates) {
      try {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (error) {
        console.error("Failed to add queued ICE candidate:", error);
      }
    }
  }

  async function createAndSendOffer(targetUserId) {
    const stream =
      localStreamRef.current ||
      (await getLocalMedia(callModeRef.current || "audio"));

    const pc = createPeerConnection(targetUserId, stream);

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    sendWsEvent({
      type: "webrtc_offer",
      target_user_id: targetUserId,
      call_mode: callModeRef.current || "audio",
      offer,
    });
  }

  async function handleWebrtcOffer(data) {
    const fromUserId = Number(data.from_user_id);
    const mode = data.call_mode || callModeRef.current || "audio";

    callModeRef.current = mode;
    setCallMode(mode);
    setActiveCallTarget(fromUserId, data.from_username || "");

    const stream = localStreamRef.current || (await getLocalMedia(mode));
    const pc = createPeerConnection(fromUserId, stream);

    await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
    await flushPendingIceCandidates();

    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);

    sendWsEvent({
      type: "webrtc_answer",
      target_user_id: fromUserId,
      answer,
    });

    setCallStatusSafe("connected");
  }

  async function handleWebrtcAnswer(data) {
    const pc = peerConnectionRef.current;
    if (!pc) return;

    await pc.setRemoteDescription(new RTCSessionDescription(data.answer));
    await flushPendingIceCandidates();

    setCallStatusSafe("connected");
  }

  async function handleIceCandidate(data) {
    const pc = peerConnectionRef.current;

    if (!pc || !pc.remoteDescription) {
      pendingIceCandidatesRef.current.push(data.candidate);
      return;
    }

    try {
      await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
    } catch (error) {
      console.error("Failed to add ICE candidate:", error);
    }
  }

  async function startCall(mode, teamId, targetUserId, targetUsername = "") {
    try {
      await connectCallSocket(teamId);

      callModeRef.current = mode;
      setCallMode(mode);
      setActiveCallTarget(targetUserId, targetUsername);
      setCallStatusSafe("calling");
      setIsCallMinimized(false);

      await getLocalMedia(mode);

      sendWsEvent({
        type: "call_invite",
        target_user_id: targetUserId,
        call_mode: mode,
      });
    } catch (error) {
      console.error("Failed to start call:", error);
      cleanupCall(false);
      alert("Could not start call.");
    }
  }

  async function acceptCall() {
    if (!incomingCall) return;

    try {
      const mode = incomingCall.call_mode || "audio";
      const fromUserId = Number(incomingCall.from_user_id);

      callModeRef.current = mode;
      setCallMode(mode);
      setActiveCallTarget(fromUserId, incomingCall.from_username || "");
      setCallStatusSafe("connecting");
      setIsCallMinimized(false);

      await getLocalMedia(mode);

      sendWsEvent({
        type: "call_accept",
        target_user_id: fromUserId,
        call_mode: mode,
      });

      setIncomingCall(null);
    } catch (error) {
      console.error("Failed to accept call:", error);
      alert("Could not access camera/microphone.");
      rejectCall();
    }
  }

  async function startScreenShare() {
    try {
        const pc = peerConnectionRef.current;

        if (!pc) {
        alert("Call is not connected yet.");
        return;
        }

        if (callModeRef.current !== "video") {
        alert("Screen sharing is available during video calls.");
        return;
        }

        const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false,
        });

        const screenTrack = screenStream.getVideoTracks()[0];

        if (!screenTrack) {
        return;
        }

        screenStreamRef.current = screenStream;

        const videoSender = pc
        .getSenders()
        .find((sender) => sender.track && sender.track.kind === "video");

        if (!videoSender) {
        alert("No video track found for this call.");
        return;
        }

        await videoSender.replaceTrack(screenTrack);

        setIsScreenSharing(true);

        // Show your own screen in local preview
        setLocalStream(screenStream);

        screenTrack.onended = () => {
        stopScreenShare();
        };
    } catch (error) {
        console.error("Failed to start screen sharing:", error);
    }
    }

    async function stopScreenShare() {
    const pc = peerConnectionRef.current;
    const cameraStream = localStreamRef.current;

    if (!pc || !cameraStream) {
        return;
    }

    const cameraTrack = cameraStream.getVideoTracks()[0];

    if (!cameraTrack) {
        return;
    }

    const videoSender = pc
        .getSenders()
        .find((sender) => sender.track && sender.track.kind === "video");

    if (videoSender) {
        await videoSender.replaceTrack(cameraTrack);
    }

    if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach((track) => track.stop());
        screenStreamRef.current = null;
    }

    setIsScreenSharing(false);

    // Return local preview back to camera
    setLocalStream(cameraStream);
  }

  function rejectCall() {
    if (!incomingCall) return;

    sendWsEvent({
      type: "call_reject",
      target_user_id: incomingCall.from_user_id,
    });

    setIncomingCall(null);
    setCallStatusSafe("idle");
  }

  function cleanupCall(notifyOtherUser = true) {

    closeRemoteFullscreen();
    const targetUserId = activeCallUserIdRef.current;

    if (notifyOtherUser && targetUserId) {
      sendWsEvent({
        type: "call_end",
        target_user_id: targetUserId,
      });
    }

    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
    }

    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach((track) => track.stop());
    }
    screenStreamRef.current = null;
    setIsScreenSharing(false);

    localStreamRef.current = null;
    remoteStreamRef.current = null;
    activeCallUserIdRef.current = null;
    callModeRef.current = null;
    pendingIceCandidatesRef.current = [];

    setLocalStream(null);
    setRemoteStream(null);
    setIncomingCall(null);
    setActiveCallUserId(null);
    setActiveCallUsername("");
    setCallMode(null);
    setIsMicMuted(false);
    setIsCameraOff(false);
    setIsCallMinimized(false);
    setCallStatusSafe("idle");
  }

  function toggleMic() {
    const stream = localStreamRef.current;
    if (!stream) return;

    const nextMutedState = !isMicMuted;

    stream.getAudioTracks().forEach((track) => {
      track.enabled = !nextMutedState;
    });

    setIsMicMuted(nextMutedState);
  }

  function toggleCamera() {
    const stream = localStreamRef.current;
    if (!stream) return;

    const videoTracks = stream.getVideoTracks();
    if (videoTracks.length === 0) return;

    const nextCameraOffState = !isCameraOff;

    videoTracks.forEach((track) => {
      track.enabled = !nextCameraOffState;
    });

    setIsCameraOff(nextCameraOffState);
  }

  async function openRemoteFullscreen() {
    try {
        const element = remoteVideoContainerRef.current;

        if (!element) return;

        if (document.fullscreenElement) {
        await document.exitFullscreen();
        return;
        }

        await element.requestFullscreen();
    } catch (error) {
        console.error("Failed to toggle fullscreen:", error);
    }
    }

    async function closeRemoteFullscreen() {
    try {
        if (document.fullscreenElement) {
        await document.exitFullscreen();
        }
    } catch (error) {
        console.error("Failed to exit fullscreen:", error);
    }
  }

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream, isCallMinimized, callStatus]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream, isCallMinimized, callStatus]);

  useEffect(() => {
    const handleFullscreenChange = () => {
        setIsRemoteFullscreen(
        document.fullscreenElement === remoteVideoContainerRef.current
        );
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);

    return () => {
        document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  useEffect(() => {
    return () => {
      cleanupCall(false);

      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, []);

  return (
    <CallContext.Provider
      value={{
        connectCallSocket,
        startCall,
      }}
    >
      {children}

      {incomingCall && callStatus === "ringing" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md rounded-[24px] border border-white/20 bg-[#0b6f95] p-6 text-white shadow-2xl">
            <h2 className="text-2xl font-bold">
              Incoming {incomingCall.call_mode === "video" ? "video" : "audio"} call
            </h2>

            <p className="mt-3 text-white/80">
              {incomingCall.from_username} is calling you.
            </p>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={acceptCall}
                className="flex-1 rounded-xl bg-[#12c39b] px-4 py-3 font-semibold text-white"
              >
                Accept
              </button>

              <button
                type="button"
                onClick={rejectCall}
                className="flex-1 rounded-xl bg-red-500 px-4 py-3 font-semibold text-white"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}

      {callStatus !== "idle" && callStatus !== "ringing" && !isCallMinimized && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-3xl rounded-[24px] border border-white/20 bg-[#0b6f95] p-6 text-white shadow-2xl">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold">
                  {callMode === "video" ? "Video call" : "Audio call"}
                </h2>

                <p className="mt-1 text-sm text-white/70">
                  {activeCallUsername || `User ${activeCallUserId}`} · {callStatus}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setIsCallMinimized(true)}
                  className="rounded-xl bg-white/10 px-4 py-3 font-semibold text-white hover:bg-white/20"
                >
                  Minimize
                </button>

                <button
                  type="button"
                  onClick={toggleMic}
                  className={`rounded-xl px-4 py-3 font-semibold text-white ${
                    isMicMuted ? "bg-yellow-500" : "bg-[#12c39b]"
                  }`}
                >
                  {isMicMuted ? "Unmute" : "Mute"}
                </button>

                {callMode === "video" && (
                  <button
                    type="button"
                    onClick={toggleCamera}
                    className={`rounded-xl px-4 py-3 font-semibold text-white ${
                      isCameraOff ? "bg-yellow-500" : "bg-[#12c39b]"
                    }`}
                  >
                    {isCameraOff ? "Camera On" : "Camera Off"}
                  </button>
                )}

                {callMode === "video" && (
                  <button
                    type="button"
                    onClick={isScreenSharing ? stopScreenShare : startScreenShare}
                    className={`rounded-xl px-4 py-3 font-semibold text-white ${
                      isScreenSharing ? "bg-yellow-500" : "bg-[#12c39b]"
                    }`}
                  >
                    {isScreenSharing ? "Stop Share" : "Share Screen"}
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => cleanupCall(true)}
                  className="rounded-xl bg-red-500 px-4 py-3 font-semibold text-white"
                >
                  End
                </button>
              </div>
            </div>

            {callMode === "video" ? (
              <div className="mt-6 grid gap-4 md:grid-cols-[1fr_220px]">
                <div
                    ref={remoteVideoContainerRef}
                    className={`relative overflow-hidden rounded-2xl bg-black ${
                        isRemoteFullscreen ? "h-screen w-screen rounded-none" : "h-[360px] w-full"
                    }`}
                    >
                    <video
                        ref={remoteVideoRef}
                        autoPlay
                        playsInline
                        className="h-full w-full object-contain"
                    />

                    <button
                        type="button"
                        onClick={openRemoteFullscreen}
                        className="absolute right-4 top-4 rounded-xl bg-black/60 px-4 py-2 text-sm font-semibold text-white backdrop-blur hover:bg-black/75"
                    >
                        {isRemoteFullscreen ? "Exit full screen" : "Full screen"}
                    </button>

                    {isRemoteFullscreen && (
                        <button
                        type="button"
                        onClick={closeRemoteFullscreen}
                        className="absolute bottom-4 right-4 rounded-xl bg-red-500 px-4 py-2 text-sm font-semibold text-white"
                        >
                        Close
                        </button>
                    )}
                </div>

                <div className="relative h-[180px] w-full overflow-hidden rounded-2xl bg-black">
                  <video
                    ref={localVideoRef}
                    autoPlay
                    muted
                    playsInline
                    className="h-full w-full object-cover"
                  />

                  {isCameraOff && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black text-sm font-semibold text-white">
                      Camera off
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="mt-6 rounded-2xl bg-[#0d8a99] p-8 text-center">
                <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-[#11c8a1] text-4xl font-bold text-white">
                  {getInitial(activeCallUsername)}
                </div>

                <p className="mt-4 text-lg font-semibold">
                  {activeCallUsername || "Audio call"}
                </p>

                <p className="mt-1 text-sm text-white/70">
                  {callStatus === "calling"
                    ? "Calling..."
                    : callStatus === "connecting"
                    ? "Connecting..."
                    : "Connected"}
                </p>

                <video ref={remoteVideoRef} autoPlay playsInline className="hidden" />
                <video ref={localVideoRef} autoPlay muted playsInline className="hidden" />
              </div>
            )}
          </div>
        </div>
      )}

      {callStatus !== "idle" && callStatus !== "ringing" && isCallMinimized && (
        <div className="fixed bottom-5 right-5 z-50 w-[300px] overflow-hidden rounded-[22px] border border-white/20 bg-[#0b6f95] text-white shadow-2xl">
          <div className="flex items-center justify-between border-b border-white/15 px-4 py-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-bold">
                {callMode === "video" ? "Video call" : "Audio call"}
              </p>

              <p className="truncate text-xs text-white/70">
                {activeCallUsername || `User ${activeCallUserId}`} · {callStatus}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsCallMinimized(false)}
              className="rounded-lg bg-white/10 px-3 py-2 text-xs font-semibold hover:bg-white/20"
            >
              Open
            </button>
          </div>

          {callMode === "video" ? (
            <div className="relative h-[170px] bg-black">
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="h-full w-full object-cover"
              />

              <div className="absolute bottom-3 right-3 h-20 w-28 overflow-hidden rounded-xl border border-white/30 bg-black">
                <video
                  ref={localVideoRef}
                  autoPlay
                  muted
                  playsInline
                  className="h-full w-full object-cover"
                />

                {isCameraOff && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black text-[11px] font-semibold text-white">
                    Off
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="px-4 py-5 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#11c8a1] text-2xl font-bold">
                {getInitial(activeCallUsername)}
              </div>

              <p className="mt-3 text-sm font-semibold">
                {activeCallUsername || "Audio call"}
              </p>

              <video ref={remoteVideoRef} autoPlay playsInline className="hidden" />
              <video ref={localVideoRef} autoPlay muted playsInline className="hidden" />
            </div>
          )}

          <div className="flex gap-2 border-t border-white/15 p-3">
            <button
              type="button"
              onClick={toggleMic}
              className={`flex-1 rounded-xl px-3 py-2 text-sm font-semibold ${
                isMicMuted ? "bg-yellow-500" : "bg-[#12c39b]"
              }`}
            >
              {isMicMuted ? "Unmute" : "Mute"}
            </button>

            <button
              type="button"
              onClick={() => cleanupCall(true)}
              className="flex-1 rounded-xl bg-red-500 px-3 py-2 text-sm font-semibold"
            >
              End
            </button>
          </div>
        </div>
      )}
    </CallContext.Provider>
  );
}

export function useCall() {
  const context = useContext(CallContext);

  if (!context) {
    throw new Error("useCall must be used inside CallProvider");
  }

  return context;
}