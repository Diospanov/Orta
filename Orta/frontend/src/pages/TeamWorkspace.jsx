import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import {
  getTeamMembers,
  getTeamMessages,
  getTeamWorkspace,
} from "../api";
import {
  OverviewTab,
  GoalsTab,
  FilesTab,
  ScheduleTab,
  RequestsTab,
  SettingsTab,
} from "../components/workspace/WorkspaceFeatureTabs";


function getInitial(name) {
  return name?.trim()?.charAt(0)?.toUpperCase() || "T";
}

function getCurrentUserIdFromToken() {
  const token = localStorage.getItem("token");
  if (!token) return null;

  try {
    const payloadBase64 = token.split(".")[1];
    const normalized = payloadBase64.replace(/-/g, "+").replace(/_/g, "/");
    const payload = JSON.parse(atob(normalized));

    return payload?.sub ? Number(payload.sub) : null;
  } catch (error) {
    console.error("Failed to parse token:", error);
    return null;
  }
}

function NavItem({ active, children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full rounded-xl px-4 py-3 text-left text-sm font-medium transition ${
        active
          ? "bg-[#0e8398] text-[#f1f3b0]"
          : "text-[#1ed3a9] hover:bg-white/5"
      }`}
    >
      {children}
    </button>
  );
}

export default function TeamWorkspace() {
  const { teamId } = useParams();

  const [team, setTeam] = useState(null);
  const [members, setMembers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [currentUserId, setCurrentUserId] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");

  const socketRef = useRef(null);
  const chatContainerRef = useRef(null);

  const [incomingCall, setIncomingCall] = useState(null);
  const [callStatus, setCallStatus] = useState("idle");
  // idle | calling | ringing | connecting | connected

  const [callMode, setCallMode] = useState(null);
  // audio | video

  const [activeCallUserId, setActiveCallUserId] = useState(null);
  const [activeCallUsername, setActiveCallUsername] = useState("");

  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);

  const peerConnectionRef = useRef(null);
  const localStreamRef = useRef(null);
  const remoteStreamRef = useRef(null);
  const callStatusRef = useRef("idle");
  const callModeRef = useRef(null);
  const activeCallUserIdRef = useRef(null);
  const pendingIceCandidatesRef = useRef([]);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  const loadWorkspaceData = async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      const [teamData, membersData, messagesData] = await Promise.all([
        getTeamWorkspace(teamId),
        getTeamMembers(teamId),
        getTeamMessages(teamId),
      ]);

      setTeam(teamData);
      setMembers(Array.isArray(membersData) ? membersData : []);
      setMessages(Array.isArray(messagesData) ? messagesData : []);
    } catch (error) {
      setErrorMessage(error.message || "Failed to load team workspace");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const userId = getCurrentUserIdFromToken();
    setCurrentUserId(userId);
  }, []);

  useEffect(() => {
    loadWorkspaceData();
  }, [teamId]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    let socket = null;
    let cancelled = false;

    const apiUrl = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

    const wsBaseUrl = apiUrl
      .replace(/^http:\/\//, "ws://")
      .replace(/^https:\/\//, "wss://")
      .replace(/\/$/, "");

    const wsUrl = `${wsBaseUrl}/teams/${teamId}/ws?token=${encodeURIComponent(
      token
    )}`;

    const connectTimer = setTimeout(() => {
      if (cancelled) return;

      console.log("Connecting to WS:", wsUrl);

      socket = new WebSocket(wsUrl);
      socketRef.current = socket;

      socket.onopen = () => {
        if (!cancelled) {
          console.log("WebSocket connected");
        }
      };

      socket.onmessage = (event) => {
        if (cancelled) return;

        try {
          const data = JSON.parse(event.data);

          if (data.type === "new_message" && data.message) {
            setMessages((prev) => [...prev, data.message]);
          }

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
          }

          if (data.type === "call_accept") {
            setCallStatusSafe("connecting");
            createAndSendOffer(Number(data.from_user_id));
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
            handleWebrtcOffer(data);
          }

          if (data.type === "webrtc_answer") {
            handleWebrtcAnswer(data);
          }

          if (data.type === "ice_candidate") {
            handleIceCandidate(data);
          }

          if (data.type === "error") {
            console.error("WS server error:", data.detail);
          }
        } catch (error) {
          console.error("Failed to parse WS message:", error);
        }
      };

      socket.onerror = (error) => {
        if (!cancelled) {
          console.error("WebSocket error:", error);
        }
      };

      socket.onclose = (event) => {
        if (!cancelled) {
          console.log("WebSocket closed:", event.code, event.reason);
        }
      };
    }, 100);

    return () => {
      cancelled = true;
      clearTimeout(connectTimer);

      if (socket) {
        socket.onopen = null;
        socket.onmessage = null;
        socket.onerror = null;
        socket.onclose = null;

        if (
          socket.readyState === WebSocket.OPEN ||
          socket.readyState === WebSocket.CONNECTING
        ) {
          socket.close();
        }
      }

      if (socketRef.current === socket) {
        socketRef.current = null;
      }
    };
  }, [teamId]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const availableSpots = useMemo(() => {
    if (!team) return 0;

    return Math.max((team.max_members || 0) - (team.member_count || 0), 0);
  }, [team]);

  const isCurrentUserOwner = useMemo(() => {
    if (!team || !currentUserId) return false;

    if (Number(team.owner_id) === Number(currentUserId)) {
      return true;
    }

    return members.some((member) => {
      const memberUserId = Number(member.user_id ?? member.user?.id ?? member.id);
      const role = String(member.role || "").toLowerCase();

      return memberUserId === Number(currentUserId) && role === "owner";
    });
  }, [team, members, currentUserId]);


  const setCallStatusSafe = (status) => {
    callStatusRef.current = status;
    setCallStatus(status);
  };

  const setActiveCallTarget = (userId, username = "") => {
    const normalizedUserId = Number(userId);

    activeCallUserIdRef.current = normalizedUserId;
    setActiveCallUserId(normalizedUserId);
    setActiveCallUsername(username);
  };

  const sendWsEvent = (payload) => {
    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
      console.error("WebSocket is not connected.");
      return false;
    }

    socketRef.current.send(JSON.stringify(payload));
    return true;
  };

  const getLocalMedia = async (mode) => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: mode === "video",
    });

    localStreamRef.current = stream;
    setLocalStream(stream);

    return stream;
  };

  const createPeerConnection = (targetUserId, stream) => {
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
    }

    const pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
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
      if (["failed", "disconnected", "closed"].includes(pc.connectionState)) {
        console.log("WebRTC connection state:", pc.connectionState);
      }
    };

    return pc;
  };

  const flushPendingIceCandidates = async () => {
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
  };

  const createAndSendOffer = async (targetUserId) => {
    const stream =
      localStreamRef.current || (await getLocalMedia(callModeRef.current || "audio"));

    const pc = createPeerConnection(targetUserId, stream);

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    sendWsEvent({
      type: "webrtc_offer",
      target_user_id: targetUserId,
      call_mode: callModeRef.current || "audio",
      offer,
    });
  };

  const handleWebrtcOffer = async (data) => {
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
  };

  const handleWebrtcAnswer = async (data) => {
    const pc = peerConnectionRef.current;
    if (!pc) return;

    await pc.setRemoteDescription(new RTCSessionDescription(data.answer));
    await flushPendingIceCandidates();

    setCallStatusSafe("connected");
  };

  const handleIceCandidate = async (data) => {
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
  };

  const startCall = async (mode, targetUserId, targetUsername = "") => {
    try {
      callModeRef.current = mode;
      setCallMode(mode);
      setActiveCallTarget(targetUserId, targetUsername);
      setCallStatusSafe("calling");

      await getLocalMedia(mode);

      sendWsEvent({
        type: "call_invite",
        target_user_id: targetUserId,
        call_mode: mode,
      });
    } catch (error) {
      console.error("Failed to start call:", error);
      cleanupCall(false);
      alert("Could not access camera/microphone.");
    }
  };

  const acceptCall = async () => {
    if (!incomingCall) return;

    try {
      const mode = incomingCall.call_mode || "audio";
      const fromUserId = Number(incomingCall.from_user_id);

      callModeRef.current = mode;
      setCallMode(mode);
      setActiveCallTarget(fromUserId, incomingCall.from_username || "");
      setCallStatusSafe("connecting");

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
  };

  const rejectCall = () => {
    if (!incomingCall) return;

    sendWsEvent({
      type: "call_reject",
      target_user_id: incomingCall.from_user_id,
    });

    setIncomingCall(null);
    setCallStatusSafe("idle");
  };

  const cleanupCall = (notifyOtherUser = true) => {
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
    setCallStatusSafe("idle");
  };

  const handleSendMessage = () => {
    const cleaned = messageInput.trim();

    if (
      !cleaned ||
      !socketRef.current ||
      socketRef.current.readyState !== WebSocket.OPEN
    ) {
      return;
    }

    socketRef.current.send(
      JSON.stringify({
        content: cleaned,
      })
    );

    setMessageInput("");
  };

  const handleMessageKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSendMessage();
    }
  };

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  useEffect(() => {
    return () => {
      cleanupCall(false);
    };
  }, []);

  return (
    <>
      <div
        className="min-h-screen text-white"
        style={{
          backgroundImage:
            "linear-gradient(rgba(8,125,146,0.84), rgba(8,125,146,0.84)), url('https://images.unsplash.com/photo-1497366754035-f200968a6e72?q=80&w=1600&auto=format&fit=crop')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <Navbar />

        <main className="mx-auto max-w-7xl px-4 pb-16 pt-6 md:px-6 md:pt-8">
          {loading ? (
            <p className="mt-10 text-center text-lg">Loading workspace...</p>
          ) : errorMessage ? (
            <div className="mx-auto mt-10 max-w-2xl rounded-[22px] border border-white/20 bg-[#0b6f95]/90 p-8 text-center shadow-xl">
              <h2 className="text-2xl font-bold text-white">Access denied</h2>

              <p className="mt-3 text-white/80">{errorMessage}</p>

              <Link
                to="/browse-teams"
                className="mt-6 inline-block rounded-xl bg-[#12c39b] px-5 py-3 text-sm font-semibold text-white"
              >
                Back to Browse Teams
              </Link>
            </div>
          ) : !team ? (
            <p className="mt-10 text-center">Team not found.</p>
          ) : (
            <div className="grid gap-5 lg:grid-cols-[260px_minmax(0,1fr)] xl:grid-cols-[0.9fr_1.8fr_1.05fr] xl:items-start">
              <aside className="space-y-4">
                <div className="rounded-[18px] border border-white/30 bg-[#0b6f95]/92 p-4 shadow-xl">
                  <h3 className="mb-4 text-xl font-bold text-white">
                    Navigation
                  </h3>

                  <div className="space-y-2">
                    <NavItem
                      active={activeTab === "overview"}
                      onClick={() => setActiveTab("overview")}
                    >
                      ◎ Overview
                    </NavItem>

                    <NavItem
                      active={activeTab === "goals"}
                      onClick={() => setActiveTab("goals")}
                    >
                      🎯 Goals
                    </NavItem>

                    <NavItem
                      active={activeTab === "files"}
                      onClick={() => setActiveTab("files")}
                    >
                      📁 Files
                    </NavItem>

                    <NavItem
                      active={activeTab === "schedule"}
                      onClick={() => setActiveTab("schedule")}
                    >
                      🗓️ Schedule
                    </NavItem>

                    <NavItem
                      active={activeTab === "requests"}
                      onClick={() => setActiveTab("requests")}
                    >
                      📩 Requests
                    </NavItem>

                    <NavItem
                      active={activeTab === "settings"}
                      onClick={() => setActiveTab("settings")}
                    >
                      ⚙️ Settings
                    </NavItem>
                  </div>
                </div>

                <div className="rounded-[18px] border border-white/30 bg-[#0b6f95]/92 p-4 shadow-xl">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-xl font-bold text-white">
                      Members ({members.length || team.member_count || 0}/
                      {team.max_members})
                    </h3>
                  </div>

                  <div className="space-y-3">
                    {members.length > 0 ? (
                      members.map((member) => {
                        const isOwner = String(member.role).toLowerCase() === "owner";

                        const memberUserId = Number(
                          member.user_id ?? member.user?.id ?? member.id
                        );

                        const isMe = memberUserId === Number(currentUserId);

                        return (
                          <div
                            key={member.id}
                            className="flex items-center gap-3 rounded-xl bg-[#0d8a99] px-3 py-3"
                          >
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#11c8a1] text-sm font-bold text-white">
                              {getInitial(member.username || member.user?.username)}
                            </div>

                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-white">
                                {member.username || member.user?.username || "Unknown user"}
                              </p>

                              <p className="text-xs text-[#63e0b5]">
                                {isOwner ? "Creator" : "Member"}
                              </p>
                            </div>

                            {!isMe && (
                              <div className="ml-auto flex gap-2">
                                <button
                                  type="button"
                                  onClick={() =>
                                    startCall(
                                      "video",
                                      memberUserId,
                                      member.username || member.user?.username || "Unknown user"
                                    )
                                  }
                                  className="rounded-lg border border-white/20 px-2 py-1 text-xs text-white hover:bg-white/10"
                                  title="Video call"
                                >
                                  📹
                                </button>

                                <button
                                  type="button"
                                  onClick={() =>
                                    startCall(
                                      "audio",
                                      memberUserId,
                                      member.username || member.user?.username || "Unknown user"
                                    )
                                  }
                                  className="rounded-lg border border-white/20 px-2 py-1 text-xs text-white hover:bg-white/10"
                                  title="Audio call"
                                >
                                  📞
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-sm text-white/75">No members data.</p>
                    )}
                  </div>
                </div>
              </aside>

              <section className="min-w-0 rounded-[18px] border border-white/30 bg-[#0b6f95]/92 p-4 shadow-xl sm:p-5">
                {activeTab === "overview" && (
                  <OverviewTab team={team} availableSpots={availableSpots} />
                )}

                {activeTab === "goals" && <GoalsTab teamId={team.id} />}

                {activeTab === "files" && <FilesTab teamId={team.id} />}

                {activeTab === "schedule" && <ScheduleTab teamId={team.id} />}

                {activeTab === "requests" && (
                  <RequestsTab
                    teamId={team.id}
                    canManage={isCurrentUserOwner}
                    onRequestAccepted={loadWorkspaceData}
                  />
                )}

                {activeTab === "settings" && (
                  <SettingsTab
                    teamId={team.id}
                    team={team}
                    members={members}
                    isOwner={isCurrentUserOwner}
                    onTeamUpdated={loadWorkspaceData}
                  />
                )}
              </section>

              <aside className="min-w-0 flex h-[620px] flex-col overflow-hidden rounded-[18px] border border-white/30 bg-[#0b6f95]/92 p-0 shadow-xl lg:col-span-2 xl:sticky xl:top-24 xl:col-span-1 xl:h-[calc(100vh-120px)]">
                <div className="shrink-0 flex items-center justify-between border-b border-white/20 px-4 py-4">
                  <h3 className="text-xl font-bold text-white sm:text-2xl">Team Chat</h3>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      className="rounded-lg border border-white/25 px-3 py-2 text-sm text-white"
                    >
                      📹
                    </button>

                    <button
                      type="button"
                      className="rounded-lg border border-white/25 px-3 py-2 text-sm text-white"
                    >
                      📞
                    </button>
                  </div>
                </div>

                <div
                  ref={chatContainerRef}
                  className="min-h-0 flex-1 overflow-y-auto px-4 py-4"
                >
                  <div className="space-y-5">
                    {messages.length > 0 ? (
                      messages.map((message) => {
                        const isMine = Number(message.user_id) === Number(currentUserId);

                        return (
                          <div
                            key={message.id}
                            className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                          >
                            <div
                              className={`flex max-w-[88%] min-w-0 items-end gap-2 sm:max-w-[78%] sm:gap-3 ${
                                isMine ? "flex-row-reverse" : "flex-row"
                              }`}
                            >
                              <div
                                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${
                                  isMine
                                    ? "bg-[#efe8a7] text-[#0b6f95]"
                                    : "bg-[#11c8a1] text-[#0a6787]"
                                }`}
                              >
                                {isMine ? "Y" : getInitial(message.username)}
                              </div>

                              <div
                                className={`min-w-0 flex flex-col ${
                                  isMine ? "items-end" : "items-start"
                                }`}
                              >
                                <div
                                  className={`mb-1 flex items-center gap-2 ${
                                    isMine ? "flex-row-reverse" : "flex-row"
                                  }`}
                                >
                                  <p className="text-sm font-semibold text-white">
                                    {isMine ? "You" : message.username || "Unknown user"}
                                  </p>

                                  <span className="text-xs text-white/50">
                                    {message.created_at
                                      ? new Date(message.created_at).toLocaleTimeString([], {
                                          hour: "2-digit",
                                          minute: "2-digit",
                                        })
                                      : ""}
                                  </span>
                                </div>

                                <div
                                  className={`max-w-full overflow-hidden whitespace-pre-wrap break-words rounded-2xl px-4 py-3 text-sm leading-6 shadow-sm [overflow-wrap:anywhere] ${
                                    isMine
                                      ? "rounded-br-md bg-[#f3efb0] text-[#0a6787]"
                                      : "rounded-bl-md bg-[#0d8a99] text-white"
                                  }`}
                                >
                                  {message.content}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-sm text-white/70">No messages yet.</p>
                    )}
                  </div>
                </div>

                <div className="shrink-0 border-t border-white/20 p-4">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      onKeyDown={handleMessageKeyDown}
                      placeholder="Type a message..."
                      className="min-w-0 flex-1 rounded-xl border border-white/20 bg-[#0d8a99] px-4 py-3 text-sm text-white placeholder:text-white/60 outline-none"
                    />

                    <button
                      type="button"
                      onClick={handleSendMessage}
                      className="rounded-xl bg-[#12c39b] px-4 py-3 text-white"
                    >
                      ➤
                    </button>
                  </div>
                </div>
              </aside>
            </div>
          )}
        </main>
      </div>

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

      {callStatus !== "idle" && callStatus !== "ringing" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-3xl rounded-[24px] border border-white/20 bg-[#0b6f95] p-6 text-white shadow-2xl">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold">
                  {callMode === "video" ? "Video call" : "Audio call"}
                </h2>

                <p className="mt-1 text-sm text-white/70">
                  {activeCallUsername || `User ${activeCallUserId}`} · {callStatus}
                </p>
              </div>

              <button
                type="button"
                onClick={() => cleanupCall(true)}
                className="rounded-xl bg-red-500 px-4 py-3 font-semibold text-white"
              >
                End
              </button>
            </div>

            {callMode === "video" ? (
              <div className="mt-6 grid gap-4 md:grid-cols-[1fr_220px]">
                <video
                  ref={remoteVideoRef}
                  autoPlay
                  playsInline
                  className="h-[360px] w-full rounded-2xl bg-black object-cover"
                />

                <video
                  ref={localVideoRef}
                  autoPlay
                  muted
                  playsInline
                  className="h-[180px] w-full rounded-2xl bg-black object-cover"
                />
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

      <Footer />
    </>
  );
}
