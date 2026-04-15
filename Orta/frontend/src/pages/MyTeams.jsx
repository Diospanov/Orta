import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { getMyTeams, leaveTeam } from "../api";

function TeamCard({ team, onLeave }) {
  return (
    <div className="rounded-[24px] border border-[#13d0bb] bg-[#0f6f95]/95 p-6 shadow-[0_8px_30px_rgba(0,0,0,0.18)]">
      <div className="mb-5 flex items-center justify-between gap-3">
        <span className="rounded-full bg-[#0aa6a0]/50 px-3 py-1 text-xs text-[#f5efbf]">
          Team
        </span>

        <span className="rounded-full bg-[#d8d2a0]/20 px-3 py-1 text-xs text-[#f5efbf]">
          {team.status}
        </span>
      </div>

      <h3 className="max-w-[320px] text-[28px] font-semibold leading-tight text-white">
        {team.name}
      </h3>

      <p className="mt-5 min-h-[96px] text-[15px] leading-8 text-[#22cbb7]">
        {team.description || "No description"}
      </p>

      <div className="mt-4 flex flex-wrap gap-5 text-sm text-[#d8d2a0]">
        <span>
          👥 {team.member_count}/{team.max_members} members
        </span>
        <span>🌐 {team.is_public ? "Public" : "Private"}</span>
        <span>👤 {team.owner_name || "Unknown owner"}</span>
      </div>

      <div className="mt-6 flex items-center gap-3">
        <button className="flex-1 rounded-xl border border-[#d8d2a0] px-4 py-3 font-medium text-white transition hover:bg-white/10">
          Open Team
        </button>

        <button
          onClick={() => onLeave(team.id)}
          className="rounded-xl bg-[#1e2c87] px-4 py-3 text-white"
        >
          Leave
        </button>
      </div>
    </div>
  );
}

export default function MyTeams() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const loadMyTeams = async () => {
    try {
      setLoading(true);
      const data = await getMyTeams();
      setTeams(data);
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMyTeams();
  }, []);

  const handleLeave = async (teamId) => {
    try {
      await leaveTeam(teamId);
      setTeams((prev) => prev.filter((team) => team.id !== teamId));
    } catch (error) {
      alert(error.message);
    }
  };

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

        <main className="mx-auto max-w-[1500px] px-6 pb-12 pt-6 md:px-10">
          <h1 className="text-center text-5xl font-medium uppercase tracking-[0.12em] text-white md:text-7xl">
            My Teams
          </h1>

          <section className="mt-10">
            <p className="text-lg text-white/80">Total teams: {teams.length}</p>
          </section>

          {loading && <p className="mt-8">Loading my teams...</p>}
          {errorMessage && <p className="mt-8 text-red-200">{errorMessage}</p>}

          <section className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {teams.map((team) => (
              <TeamCard key={team.id} team={team} onLeave={handleLeave} />
            ))}
          </section>
        </main>
      </div>

      <Footer />
    </>
  );
}