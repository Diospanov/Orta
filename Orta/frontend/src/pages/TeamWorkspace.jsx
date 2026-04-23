import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { getTeamWorkspace, getTeamMembers } from "../api";

function getInitial(name) {
  return name?.trim()?.charAt(0)?.toUpperCase() || "T";
}

function formatRelativeDate(dateString) {
  if (!dateString) return "Recently";

  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now - date;

  if (Number.isNaN(date.getTime())) return "Recently";

  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (days < 1) return "Today";
  if (days < 7) return `${days} day${days === 1 ? "" : "s"} ago`;

  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks} week${weeks === 1 ? "" : "s"} ago`;

  const months = Math.floor(days / 30);
  return `${months} month${months === 1 ? "" : "s"} ago`;
}

function NavItem({ active, children }) {
  return (
    <button
      type="button"
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

function StatCard({ label, value }) {
  return (
    <div className="rounded-[16px] border border-[#d9ef9d]/20 bg-[#0d8a99] p-5">
      <p className="text-sm text-white/80">{label}</p>
      <p className="mt-3 text-4xl font-bold text-white">{value}</p>
    </div>
  );
}

const demoMessages = [
  { id: 1, user: "Alex Johnson", time: "10:30 AM", text: "Hey everyone! Ready for our study session tonight?", mine: false },
  { id: 2, user: "Sam Rivera", time: "10:32 AM", text: "Yes! I've been working through the practice problems.", mine: false },
  { id: 3, user: "You", time: "10:35 AM", text: "Count me in! I have some questions about chain rule.", mine: true },
  { id: 4, user: "Jordan Lee", time: "10:37 AM", text: "I can help with that! I just uploaded my study guide.", mine: false },
  { id: 5, user: "Maria Gonzalez", time: "10:40 AM", text: "Perfect timing! See you all at 7 PM.", mine: false },
];

export default function TeamWorkspace() {
  const { teamId } = useParams();

  const [team, setTeam] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setErrorMessage("");

        const [teamData, membersData] = await Promise.all([
          getTeamWorkspace(teamId),
          getTeamMembers(teamId),
        ]);

        setTeam(teamData);
        setMembers(Array.isArray(membersData) ? membersData : []);
      } catch (error) {
        setErrorMessage(error.message || "Failed to load team workspace");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [teamId]);

  const availableSpots = useMemo(() => {
    if (!team) return 0;
    return Math.max((team.max_members || 0) - (team.member_count || 0), 0);
  }, [team]);

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
                  <h3 className="mb-4 text-xl font-bold text-white">Navigation</h3>
                  <div className="space-y-2">
                    <NavItem active>Overview</NavItem>
                    <NavItem>Goals</NavItem>
                    <NavItem>Files</NavItem>
                    <NavItem>Schedule</NavItem>
                    <NavItem>Settings</NavItem>
                  </div>
                </div>

                <div className="rounded-[18px] border border-white/30 bg-[#0b6f95]/92 p-4 shadow-xl">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-xl font-bold text-white">
                      Members ({members.length || team.member_count || 0}/{team.max_members})
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
                              {getInitial(member.username)}
                            </div>

                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-white">
                                {member.username || "Unknown user"}
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
                <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h1 className="text-4xl font-bold text-white">Team Overview</h1>
                    <p className="mt-2 text-sm text-white/75">{team.name}</p>
                  </div>

                  <button
                    type="button"
                    className="rounded-xl bg-[#12c39b] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#16d1a7]"
                  >
                    Start Video Call
                  </button>
                </div>

                <div className="mb-5 h-px bg-white/20" />

                <div className="grid gap-4 md:grid-cols-2">
                  <StatCard label="Members" value={team.member_count || 0} />
                  <StatCard label="Available Spots" value={availableSpots} />
                  <StatCard label="Days Active" value={team.created_at ? Math.max(Math.floor((new Date() - new Date(team.created_at)) / (1000 * 60 * 60 * 24)), 1) : 1} />
                  <StatCard label="Conditions" value={team.conditions_to_join?.length || 0} />
                </div>

                <div className="mt-5 rounded-[18px] bg-[#0d8a99] p-5">
                  <h2 className="text-2xl font-bold text-white">About This Team</h2>

                  <p className="mt-4 text-base leading-8 text-white/92">
                    {team.description || "No team description provided."}
                  </p>

                  <div className="mt-5 flex flex-wrap gap-2">
                    {(team.conditions_to_join?.length
                      ? team.conditions_to_join
                      : ["No special conditions"]
                    ).map((condition) => (
                      <span
                        key={condition}
                        className="rounded-full bg-[#0f7f9a] px-3.5 py-2 text-xs font-medium text-[#f1f3b0]"
                      >
                        {condition}
                      </span>
                    ))}
                  </div>

                  <div className="mt-6 grid gap-3 md:grid-cols-2">
                    <div className="rounded-xl bg-white/10 p-4">
                      <p className="text-xs uppercase tracking-wide text-white/65">
                        Communication
                      </p>
                      <p className="mt-2 text-sm font-semibold text-white">
                        {team.communication_method || "Not specified"}
                      </p>
                    </div>

                    <div className="rounded-xl bg-white/10 p-4">
                      <p className="text-xs uppercase tracking-wide text-white/65">
                        Schedule
                      </p>
                      <p className="mt-2 text-sm font-semibold text-white">
                        {team.meeting_frequency || "Not specified"}
                      </p>
                    </div>

                    <div className="rounded-xl bg-white/10 p-4">
                      <p className="text-xs uppercase tracking-wide text-white/65">
                        Timezone
                      </p>
                      <p className="mt-2 text-sm font-semibold text-white">
                        {team.timezone || "Not specified"}
                      </p>
                    </div>

                    <div className="rounded-xl bg-white/10 p-4">
                      <p className="text-xs uppercase tracking-wide text-white/65">
                        Created
                      </p>
                      <p className="mt-2 text-sm font-semibold text-white">
                        {formatRelativeDate(team.created_at)}
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              <aside className="rounded-[18px] border border-white/30 bg-[#0b6f95]/92 p-0 shadow-xl">
                <div className="flex items-center justify-between border-b border-white/20 px-4 py-4">
                  <h3 className="text-2xl font-bold text-white">Team Chat</h3>

                  <div className="flex gap-2">
                    <button className="rounded-lg border border-white/25 px-3 py-2 text-sm text-white">
                      📹
                    </button>
                    <button className="rounded-lg border border-white/25 px-3 py-2 text-sm text-white">
                      📞
                    </button>
                  </div>
                </div>

                <div className="h-[520px] overflow-y-auto px-4 py-4">
                  <div className="space-y-5">
                    {demoMessages.map((message) => (
                      <div key={message.id}>
                        {!message.mine ? (
                          <div className="flex items-start gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#11c8a1] text-[11px] font-bold text-white">
                              {getInitial(message.user)}
                            </div>

                            <div>
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-semibold text-white">
                                  {message.user}
                                </p>
                                <span className="text-xs text-white/50">
                                  {message.time}
                                </span>
                              </div>
                              <p className="mt-1 text-sm leading-6 text-white/88">
                                {message.text}
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-start justify-end gap-3">
                            <div className="max-w-[80%] rounded-2xl bg-[#ebe8ab] px-4 py-3 text-sm leading-6 text-[#0b6f95]">
                              {message.text}
                            </div>
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#11c8a1] text-[11px] font-bold text-white">
                              Y
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t border-white/20 p-4">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Type a message..."
                      className="flex-1 rounded-xl border border-white/20 bg-[#0d8a99] px-4 py-3 text-sm text-white placeholder:text-white/60 outline-none"
                    />
                    <button
                      type="button"
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