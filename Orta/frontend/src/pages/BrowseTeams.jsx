import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { getAllTeams, joinTeam } from "../api";

export default function BrowseTeams() {
  const [teams, setTeams] = useState([]);
  const [search, setSearch] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const loadTeams = async (searchValue = "") => {
    try {
      setLoading(true);
      setErrorMessage("");
      const data = await getAllTeams(searchValue);
      setTeams(data);
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTeams();
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    await loadTeams(search);
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
      alert(error.message);
    }
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center text-white"
      style={{
        backgroundImage:
          "linear-gradient(rgba(0,120,145,0.78), rgba(0,120,145,0.78)), url('https://images.unsplash.com/photo-1497366754035-f200968a6e72?q=80&w=1600&auto=format&fit=crop')",
      }}
    >
      <Navbar />

      <main className="mx-auto max-w-7xl px-6 pb-16">
        <h1 className="mt-8 text-center text-5xl font-bold uppercase md:text-6xl">
          Find your perfect team
        </h1>

        <form
          onSubmit={handleSearch}
          className="mt-8 flex flex-col gap-4 md:flex-row md:items-center"
        >
          <input
            placeholder="Search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-white/40 bg-transparent px-4 py-3 text-white placeholder:text-white/70 outline-none md:w-64"
          />

          <button
            type="submit"
            className="rounded-xl bg-teal-500 px-5 py-3 font-semibold text-white transition hover:bg-teal-400"
          >
            Search
          </button>
        </form>

        <h2 className="mt-12 text-4xl font-bold uppercase">Available Teams</h2>

        {loading && <p className="mt-6">Loading teams...</p>}
        {errorMessage && <p className="mt-6 text-red-200">{errorMessage}</p>}

        <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {teams.map((team) => {
            const spotsLeft = Math.max(
              team.max_members - team.member_count,
              0
            );

            return (
              <div
                key={team.id}
                className="rounded-3xl border border-white/30 bg-[#0b6e95]/80 p-6 shadow-xl backdrop-blur-sm"
              >
                <div className="flex items-center justify-between text-sm text-teal-200">
                  <span className="rounded-full bg-white/10 px-3 py-1">
                    {team.is_public ? "Public Team" : "Private Team"}
                  </span>
                  <span>{spotsLeft} spots left</span>
                </div>

                <h3 className="mt-5 text-3xl font-bold leading-tight">
                  {team.name}
                </h3>

                <p className="mt-4 text-sm leading-7 text-white/90">
                  {team.description || "No description"}
                </p>

                <div className="mt-5 flex flex-wrap gap-6 text-sm text-white/80">
                  <span>
                    {team.member_count}/{team.max_members} members
                  </span>
                  <span>Status: {team.status}</span>
                </div>

                <div className="my-5 h-px bg-white/40" />

                <div className="mt-6 flex items-center justify-between gap-4">
                  <div>
                    <p className="font-medium">
                      {team.owner_name || "Unknown owner"}
                    </p>
                    <p className="text-sm text-white/70">Team owner</p>
                  </div>

                  {team.is_member ? (
                    <button
                      disabled
                      className="rounded-xl bg-white/20 px-5 py-2 font-semibold text-white/70"
                    >
                      Joined
                    </button>
                  ) : (
                    <button
                      onClick={() => handleJoin(team.id)}
                      className="rounded-xl bg-teal-500 px-5 py-2 font-semibold text-white transition hover:bg-teal-400"
                    >
                      Join Team
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </main>

      <Footer />
    </div>
  );
}