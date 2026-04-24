import { useEffect, useMemo, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { getAllTeams, joinTeam } from "../api";

function formatRelativeDate(dateString) {
  if (!dateString) return "Recently created";

  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now - date;

  if (Number.isNaN(date.getTime())) return "Recently created";

  const minutes = Math.floor(diffMs / (1000 * 60));
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (minutes < 1) return "Created just now";
  if (minutes < 60) return `Created ${minutes} min ago`;
  if (hours < 24) return `Created ${hours}h ago`;
  if (days < 7) return `Created ${days} day${days === 1 ? "" : "s"} ago`;

  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `Created ${weeks} week${weeks === 1 ? "" : "s"} ago`;

  const months = Math.floor(days / 30);
  if (months < 12) return `Created ${months} month${months === 1 ? "" : "s"} ago`;

  const years = Math.floor(days / 365);
  return `Created ${years} year${years === 1 ? "" : "s"} ago`;
}

function getInitial(name) {
  return name?.trim()?.charAt(0)?.toUpperCase() || "T";
}

function InfoChip({ children, tone = "default" }) {
  const classes =
    tone === "lime"
      ? "bg-[#0f8b9f] text-[#dff29c]"
      : tone === "green"
      ? "bg-[#12c39b] text-white"
      : "bg-[#0f7d99] text-white/95";

  return (
    <span
      className={`rounded-full px-3 py-1.5 text-xs font-medium md:text-sm ${classes}`}
    >
      {children}
    </span>
  );
}

function StatItem({ label, value }) {
  return (
    <div className="rounded-2xl bg-white/8 px-4 py-3">
      <p className="text-xs text-white/65 md:text-sm">{label}</p>
      <p className="mt-1 text-sm font-semibold text-white md:text-base">
        {value}
      </p>
    </div>
  );
}

function TeamCard({ team, onJoin }) {
  const spotsLeft = Math.max((team.max_members || 0) - (team.member_count || 0), 0);
  const createdLabel = formatRelativeDate(team.created_at);

  return (
    <div className="rounded-[22px] border border-white/30 bg-[#0a6f95]/88 p-5 shadow-xl backdrop-blur-sm transition duration-200 hover:-translate-y-1 hover:bg-[#0b769d]/90">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-2">
          <InfoChip tone="lime">{team.category || "General"}</InfoChip>
          <InfoChip>{team.is_public ? "Public Team" : "Private Team"}</InfoChip>
        </div>

        <InfoChip tone="green">
          {spotsLeft} spot{spotsLeft === 1 ? "" : "s"} left
        </InfoChip>
      </div>

      <h3 className="text-2xl font-bold leading-tight text-white md:text-[30px]">
        {team.name}
      </h3>

      <p className="mt-4 min-h-[96px] text-sm leading-7 text-white/90 md:text-[15px]">
        {team.description || "No description provided yet."}
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-white/85">
        <span>
          {team.member_count}/{team.max_members} members
        </span>
        <span>{createdLabel}</span>
      </div>

      <div className="my-5 h-px bg-white/25" />

      <div>
        <p className="mb-3 text-sm font-semibold text-white md:text-base">
          Conditions to join:
        </p>

        <div className="flex flex-wrap gap-2">
          {team.conditions_to_join?.length ? (
            team.conditions_to_join.slice(0, 4).map((condition) => (
              <span
                key={condition}
                className="rounded-full bg-[#0f7d99] px-3 py-2 text-xs text-white/95 md:text-sm"
              >
                {condition}
              </span>
            ))
          ) : (
            <span className="rounded-full bg-[#0f7d99] px-3 py-2 text-xs text-white/90 md:text-sm">
              No special conditions
            </span>
          )}
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <StatItem
          label="Communication"
          value={team.communication_method || "Not specified"}
        />
        <StatItem label="Timezone" value={team.timezone || "Not specified"} />
      </div>

      <div className="mt-5 flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#7a4dff] text-sm font-bold text-white">
            {getInitial(team.owner_name)}
          </div>

          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white md:text-base">
              {team.owner_name || "Unknown owner"}
            </p>
            <p className="text-xs text-white/70 md:text-sm">Team owner</p>
          </div>
        </div>

        {team.is_member ? (
          <button
            disabled
            className="rounded-xl bg-white/20 px-5 py-2.5 text-sm font-semibold text-white/75 md:px-6 md:py-3"
          >
            Joined
          </button>
        ) : (
          <button
            type="button"
            onClick={() => onJoin(team.id)}
            className="rounded-xl bg-[#12c39b] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#16d1a7] md:px-6 md:py-3"
          >
            Join Team
          </button>
        )}
      </div>
    </div>
  );
}

export default function BrowseTeams() {
  const [teams, setTeams] = useState([]);
  const [search, setSearch] = useState("");
  const [visibility, setVisibility] = useState("all");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const PAGE_SIZE = 9;
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [activeSearch, setActiveSearch] = useState("");

  const loadTeams = async (searchValue = "", pageValue = 1) => {
    try {
      setLoading(true);
      setErrorMessage("");

      const data = await getAllTeams(searchValue, pageValue, PAGE_SIZE);

      setTeams(data.items || []);
      setTotal(data.total || 0);
      setPages(data.pages || 1);
      setPage(data.page || pageValue);
    } catch (error) {
      setErrorMessage(error.message || "Failed to load teams");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTeams(activeSearch, page);
  }, [activeSearch, page]);

  const handleSearch = async (e) => {
    e.preventDefault();
    setPage(1);
    setActiveSearch(search);
  };

  const handleJoin = async (teamId) => {
    try {
      const result = await joinTeam(teamId);

      setTeams((prev) =>
        prev.map((team) =>
          team.id === teamId
            ? {
                ...team,
                is_member: true,
                member_count: team.member_count + 1,
              }
            : team
        )
      );

      alert(result.message || "Joined successfully");
    } catch (error) {
      alert(error.message || "Failed to join team");
    }
  };

  const filteredTeams = useMemo(() => {
    return teams.filter((team) => {
      if (visibility === "public") return team.is_public;
      if (visibility === "private") return !team.is_public;
      return true;
    });
  }, [teams, visibility]);

  return (
    <div
      className="min-h-screen bg-cover bg-center text-white"
      style={{
        backgroundImage:
          "linear-gradient(rgba(0,120,145,0.78), rgba(0,120,145,0.78)), url('https://images.unsplash.com/photo-1497366754035-f200968a6e72?q=80&w=1600&auto=format&fit=crop')",
      }}
    >
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 pb-16 md:px-6">
        <div className="pt-8 text-center">
          <h1 className="text-4xl font-bold uppercase md:text-5xl">
            Find your perfect team
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-white/80 md:text-base">
            Explore groups and join the one that matches your goals, schedule,
            and interests.
          </p>
        </div>

        <form
          onSubmit={handleSearch}
          className="mx-auto mt-8 rounded-[22px] border border-white/25 bg-[#0a6f95]/70 p-4 shadow-lg backdrop-blur-sm"
        >
          <div className="grid gap-4 xl:grid-cols-[1fr_auto_auto] xl:items-center">
            <input
              placeholder="Search teams..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-2xl border border-white/30 bg-transparent px-5 py-4 text-white placeholder:text-white/70 outline-none"
            />

            <div className="flex flex-wrap gap-2 xl:flex-nowrap">
              <button
                type="button"
                onClick={() => setVisibility("all")}
                className={`rounded-2xl px-5 py-3 text-sm font-semibold transition ${
                  visibility === "all"
                    ? "bg-[#dff29c] text-[#0a6f95]"
                    : "border border-white/35 bg-transparent text-white hover:bg-white/10"
                }`}
              >
                All
              </button>

              <button
                type="button"
                onClick={() => setVisibility("public")}
                className={`rounded-2xl px-5 py-3 text-sm font-semibold transition ${
                  visibility === "public"
                    ? "bg-[#dff29c] text-[#0a6f95]"
                    : "border border-white/35 bg-transparent text-white hover:bg-white/10"
                }`}
              >
                Public
              </button>

              <button
                type="button"
                onClick={() => setVisibility("private")}
                className={`rounded-2xl px-5 py-3 text-sm font-semibold transition ${
                  visibility === "private"
                    ? "bg-[#dff29c] text-[#0a6f95]"
                    : "border border-white/35 bg-transparent text-white hover:bg-white/10"
                }`}
              >
                Private
              </button>
            </div>

            <button
              type="submit"
              className="rounded-2xl bg-[#12c39b] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#16d1a7]"
            >
              Search
            </button>
          </div>
        </form>

        <div className="mt-8 flex items-center justify-between">
          <h2 className="text-2xl font-bold uppercase md:text-3xl">
            Available Teams
          </h2>
          {!loading && !errorMessage ? (
            <span className="text-sm text-white/80">
              {total} found
            </span>
          ) : null}
        </div>

        {loading ? (
          <p className="mt-10 text-center text-base">Loading teams...</p>
        ) : errorMessage ? (
          <p className="mt-10 text-center text-base text-red-200">
            {errorMessage}
          </p>
        ) : filteredTeams.length === 0 ? (
          <p className="mt-10 text-center text-base text-white/85">
            No teams found.
          </p>
        ) : (
          <>
            <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {filteredTeams.map((team) => (
                <TeamCard key={team.id} team={team} onJoin={handleJoin} />
              ))}
            </div>

            {pages > 1 && (
              <div className="mt-10 flex items-center justify-center gap-4">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                  className="rounded-2xl border border-white/35 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Previous
                </button>

                <span className="rounded-2xl bg-[#0a6f95]/80 px-5 py-3 text-sm font-semibold text-white">
                  Page {page} of {pages}
                </span>

                <button
                  type="button"
                  disabled={page >= pages}
                  onClick={() => setPage((prev) => Math.min(prev + 1, pages))}
                  className="rounded-2xl border border-white/35 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}