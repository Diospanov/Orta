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

    const protocol = window.location.protocol === "https:" ? "wss" : "ws";

    const wsHost = import.meta.env.VITE_API_URL
      ? import.meta.env.VITE_API_URL.replace(/^https?:\/\//, "").replace(/\/$/, "")
      : "127.0.0.1:8000";

    const wsUrl = `${protocol}://${wsHost}/teams/${teamId}/ws?token=${encodeURIComponent(
      token
    )}`;

    console.log("Connecting to WS:", wsUrl);

    const socket = new WebSocket(wsUrl);
    socketRef.current = socket;

    socket.onopen = () => {
      console.log("WebSocket connected");
    };

    socket.onmessage = (event) => {
      console.log("WS message received:", event.data);

      try {
        const data = JSON.parse(event.data);

        if (data.type === "new_message" && data.message) {
          setMessages((prev) => [...prev, data.message]);
        }

        if (data.type === "error") {
          console.error("WS server error:", data.detail);
        }
      } catch (error) {
        console.error("Failed to parse WS message:", error);
      }
    };

    socket.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    socket.onclose = (event) => {
      console.log("WebSocket closed:", event.code, event.reason);
    };

    return () => {
      socket.close();
      socketRef.current = null;
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

        <main className="mx-auto max-w-7xl px-4 pb-16 pt-8 md:px-6">
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
            <div className="grid gap-5 xl:grid-cols-[0.9fr_1.8fr_1.05fr]">
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
                        const isOwner =
                          String(member.role).toLowerCase() === "owner";

                        return (
                          <div
                            key={member.id}
                            className="flex items-center gap-3 rounded-xl bg-[#0d8a99] px-3 py-3"
                          >
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#11c8a1] text-sm font-bold text-white">
                              {getInitial(
                                member.username || member.user?.username
                              )}
                            </div>

                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-white">
                                {member.username ||
                                  member.user?.username ||
                                  "Unknown user"}
                              </p>

                              <p className="text-xs text-[#63e0b5]">
                                {isOwner ? "Creator" : "Member"}
                              </p>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-sm text-white/75">No members data.</p>
                    )}
                  </div>
                </div>
              </aside>

              <section className="rounded-[18px] border border-white/30 bg-[#0b6f95]/92 p-5 shadow-xl">
                {activeTab === "overview" && (
                  <OverviewTab team={team} availableSpots={availableSpots} />
                )}

                {activeTab === "goals" && <GoalsTab teamId={team.id} />}

                {activeTab === "files" && <FilesTab teamId={team.id} />}

                {activeTab === "schedule" && <ScheduleTab teamId={team.id} />}

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

              <aside className="rounded-[18px] border border-white/30 bg-[#0b6f95]/92 p-0 shadow-xl">
                <div className="flex items-center justify-between border-b border-white/20 px-4 py-4">
                  <h3 className="text-2xl font-bold text-white">Team Chat</h3>

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
                  className="h-[520px] overflow-y-auto px-4 py-4"
                >
                  <div className="space-y-5">
                    {messages.length > 0 ? (
                      messages.map((message) => {
                        const isMine =
                          Number(message.user_id) === Number(currentUserId);

                        return (
                          <div
                            key={message.id}
                            className={`flex ${
                              isMine ? "justify-end" : "justify-start"
                            }`}
                          >
                            <div
                              className={`flex max-w-[82%] items-end gap-3 ${
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
                                className={`flex flex-col ${
                                  isMine ? "items-end" : "items-start"
                                }`}
                              >
                                <div
                                  className={`mb-1 flex items-center gap-2 ${
                                    isMine ? "flex-row-reverse" : "flex-row"
                                  }`}
                                >
                                  <p className="text-sm font-semibold text-white">
                                    {isMine
                                      ? "You"
                                      : message.username || "Unknown user"}
                                  </p>

                                  <span className="text-xs text-white/50">
                                    {message.created_at
                                      ? new Date(
                                          message.created_at
                                        ).toLocaleTimeString([], {
                                          hour: "2-digit",
                                          minute: "2-digit",
                                        })
                                      : ""}
                                  </span>
                                </div>

                                <div
                                  className={`rounded-2xl px-4 py-3 text-sm leading-6 shadow-sm ${
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

                <div className="border-t border-white/20 p-4">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      onKeyDown={handleMessageKeyDown}
                      placeholder="Type a message..."
                      className="flex-1 rounded-xl border border-white/20 bg-[#0d8a99] px-4 py-3 text-sm text-white placeholder:text-white/60 outline-none"
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

      <Footer />
    </>
  );
}