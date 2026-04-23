import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { getMyTeams, leaveTeam } from "../api";

function formatRelativeDate(dateString) {
  if (!dateString) return "Recently created";

  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now - date;

  if (Number.isNaN(date.getTime())) return "Recently created";

  const minutes = Math.floor(diffMs / (1000 * 60));
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (minutes < 1) return "Just created";
  if (minutes < 60) return `${minutes} min ago`;
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  if (days < 7) return `${days} day${days === 1 ? "" : "s"} ago`;

  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks} week${weeks === 1 ? "" : "s"} ago`;

  const months = Math.floor(days / 30);
  if (months < 12) return `${months} month${months === 1 ? "" : "s"} ago`;

  const years = Math.floor(days / 365);
  return `${years} year${years === 1 ? "" : "s"} ago`;
}

function getInitial(name) {
  return name?.trim()?.charAt(0)?.toUpperCase() || "T";
}

function Badge({ children, variant = "default" }) {
  const styles = {
    default: "bg-[#0f7f9a] text-white/95",
    green: "bg-[#0f7f9a] text-[#9ff4af]",
    lime: "bg-[#0f7f9a] text-[#e6ff9f]",
    soft: "bg-white/10 text-white/85",
    status: "bg-[#d8d2a0]/20 text-[#f5efbf]",
  };

  return (
    <span className={`rounded-full px-3 py-1.5 text-xs font-medium ${styles[variant]}`}>
      {children}
    </span>
  );
}

function SummaryCard({ title, value, subtitle }) {
  return (
    <div className="rounded-[20px] border border-white/20 bg-white/10 p-5 shadow-lg backdrop-blur-sm">
      <p className="text-sm text-white/75">{title}</p>
      <h3 className="mt-2 text-3xl font-bold text-white">{value}</h3>
      <p className="mt-1 text-sm text-white/65">{subtitle}</p>
    </div>
  );
}

function TeamCard({ team, onLeave, leaving }) {
  const createdLabel = formatRelativeDate(team.created_at);
  const spotsLeft = Math.max((team.max_members || 0) - (team.member_count || 0), 0);

  return (
    <div className="rounded-[22px] border border-white/30 bg-[#0b6f95]/88 p-6 shadow-xl backdrop-blur-sm transition duration-200 hover:-translate-y-1 hover:bg-[#0d749b]/90">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          <Badge variant="green">{team.category || "General"}</Badge>
          <Badge variant="soft">{team.is_public ? "Public" : "Private"}</Badge>
          <Badge variant="status">{team.status || "active"}</Badge>
        </div>

        <Badge variant="lime">
          {spotsLeft} spot{spotsLeft === 1 ? "" : "s"} left
        </Badge>
      </div>

      <h3 className="text-[28px] font-bold leading-[1.15] text-white">
        {team.name}
      </h3>

      <p className="mt-4 min-h-[96px] text-[15px] leading-7 text-white/90">
        {team.description || "No description provided."}
      </p>

      <div className="mt-4 flex flex-wrap gap-5 text-sm text-white/85">
        <span>👥 {team.member_count}/{team.max_members} members</span>
        <span>🌐 {team.is_public ? "Public" : "Private"}</span>
        <span>⏱ {createdLabel}</span>
      </div>

      <div className="my-5 h-px bg-white/25" />

      <div>
        <p className="mb-3 text-sm font-semibold text-white">
          Conditions to join:
        </p>

        <div className="flex flex-wrap gap-2">
          {team.conditions_to_join?.length ? (
            team.conditions_to_join.slice(0, 4).map((condition) => (
              <span
                key={condition}
                className="rounded-full bg-[#0f7d99] px-3.5 py-2 text-xs font-medium text-white"
              >
                {condition}
              </span>
            ))
          ) : (
            <span className="rounded-full bg-[#0f7d99] px-3.5 py-2 text-xs font-medium text-white/85">
              No special conditions
            </span>
          )}
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#7a4dff] text-sm font-semibold text-white">
            {getInitial(team.owner_name)}
          </div>

          <div>
            <p className="text-sm font-semibold text-white">
              {team.owner_name || "Unknown owner"}
            </p>
            <p className="text-xs text-white/70">Team owner</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to={`/teams/${team.id}`}
            className="rounded-xl border border-[#d8d2a0] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-white/10"
          >
            Open Team
          </Link>

          <button
            onClick={() => onLeave(team.id)}
            disabled={leaving}
            className="rounded-xl bg-[#1e2c87] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#2637a3] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {leaving ? "Leaving..." : "Leave"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function MyTeams() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [leavingTeamId, setLeavingTeamId] = useState(null);

  const loadMyTeams = async () => {
    try {
      setLoading(true);
      setErrorMessage("");
      const data = await getMyTeams();
      setTeams(Array.isArray(data) ? data : []);
    } catch (error) {
      setErrorMessage(error.message || "Failed to load my teams");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMyTeams();
  }, []);

  const handleLeave = async (teamId) => {
    const confirmed = window.confirm("Are you sure you want to leave this team?");
    if (!confirmed) return;

    try {
      setLeavingTeamId(teamId);
      await leaveTeam(teamId);
      setTeams((prev) => prev.filter((team) => team.id !== teamId));
    } catch (error) {
      alert(error.message || "Failed to leave team");
    } finally {
      setLeavingTeamId(null);
    }
  };

  const totalMembers = useMemo(() => {
    return teams.reduce((sum, team) => sum + (team.member_count || 0), 0);
  }, [teams]);

  const publicTeamsCount = useMemo(() => {
    return teams.filter((team) => team.is_public).length;
  }, [teams]);

  return (
    <>
      <div
        className="min-h-screen text-white"
        style={{
          backgroundImage:
            "linear-gradient(rgba(8,125,146,0.82), rgba(8,125,146,0.82)), url('https://images.unsplash.com/photo-1497366754035-f200968a6e72?q=80&w=1600&auto=format&fit=crop')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <Navbar />

        <main className="mx-auto max-w-7xl px-4 pb-16 pt-8 md:px-6">
          <div className="text-center">
            <h1 className="text-4xl font-bold uppercase md:text-6xl">
              My Teams
            </h1>
            <p className="mx-auto mt-3 max-w-2xl text-base text-white/80">
              Manage the teams you are part of, check their details, and leave a
              team whenever you want.
            </p>
          </div>

          <section className="mt-10 grid gap-4 md:grid-cols-3">
            <SummaryCard
              title="Total Teams"
              value={teams.length}
              subtitle="Teams you are currently part of"
            />
            <SummaryCard
              title="Public Teams"
              value={publicTeamsCount}
              subtitle="Visible to other users"
            />
            <SummaryCard
              title="Total Members"
              value={totalMembers}
              subtitle="Combined members across your teams"
            />
          </section>

          {loading ? (
            <p className="mt-10 text-center text-lg">Loading my teams...</p>
          ) : errorMessage ? (
            <p className="mt-10 text-center text-base text-red-200">
              {errorMessage}
            </p>
          ) : teams.length === 0 ? (
            <div className="mt-12 rounded-[22px] border border-white/20 bg-white/10 p-10 text-center backdrop-blur-sm">
              <h2 className="text-2xl font-bold text-white">No teams yet</h2>
              <p className="mt-3 text-white/80">
                You are not a member of any team yet. Create one or join a team
                from the browse page.
              </p>
            </div>
          ) : (
            <section className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {teams.map((team) => (
                <TeamCard
                  key={team.id}
                  team={team}
                  onLeave={handleLeave}
                  leaving={leavingTeamId === team.id}
                />
              ))}
            </section>
          )}
        </main>
      </div>

      <Footer />
    </>
  );
}