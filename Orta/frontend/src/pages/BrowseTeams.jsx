import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const teams = Array(6).fill({
  category: "Calculus & Math",
  spots: "4 spots left",
  title: "Calculus Study Group for Beginners",
  description:
    "Weekly study sessions for Calculus I. We'll work through problems, review concepts, and prepare for exams together. All skill levels welcome!",
  members: "4/8 members",
  created: "Created 3 days ago",
  conditions: [
    "Basic algebra knowledge",
    "Weekly commitment",
    "Camera on for sessions",
  ],
  owner: "Aruzhan B.",
  joined: "Joined Orta 2 weeks ago",
});

export default function BrowseTeams() {
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

        <div className="mt-8 flex flex-col gap-4 md:flex-row md:items-center">
          <input
            placeholder="Search"
            className="w-full rounded-xl border border-white/40 bg-transparent px-4 py-3 text-white placeholder:text-white/70 outline-none md:w-64"
          />

          <span className="text-lg font-medium">Filter by:</span>

          <select className="rounded-xl border border-white/40 bg-transparent px-4 py-3 text-white outline-none">
            <option className="text-black">All Categories</option>
          </select>

          <select className="rounded-xl border border-white/40 bg-transparent px-4 py-3 text-white outline-none">
            <option className="text-black">All Statuses</option>
          </select>

          <select className="rounded-xl border border-white/40 bg-transparent px-4 py-3 text-white outline-none">
            <option className="text-black">Any Size</option>
          </select>
        </div>

        <h2 className="mt-12 text-4xl font-bold uppercase">Available Teams</h2>

        <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {teams.map((team, index) => (
            <div
              key={index}
              className="rounded-3xl border border-white/30 bg-[#0b6e95]/80 p-6 shadow-xl backdrop-blur-sm"
            >
              <div className="flex items-center justify-between text-sm text-teal-200">
                <span className="rounded-full bg-white/10 px-3 py-1">
                  {team.category}
                </span>
                <span>{team.spots}</span>
              </div>

              <h3 className="mt-5 text-3xl font-bold leading-tight">
                {team.title}
              </h3>

              <p className="mt-4 text-sm leading-7 text-white/90">
                {team.description}
              </p>

              <div className="mt-5 flex gap-6 text-sm text-white/80">
                <span>{team.members}</span>
                <span>{team.created}</span>
              </div>

              <div className="my-5 h-px bg-white/40" />

              <div>
                <p className="font-semibold">Conditions to join:</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {team.conditions.map((condition) => (
                    <span
                      key={condition}
                      className="rounded-full bg-white/10 px-3 py-2 text-xs"
                    >
                      {condition}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between">
                <div>
                  <p className="font-medium">{team.owner}</p>
                  <p className="text-sm text-white/70">{team.joined}</p>
                </div>

                <button className="rounded-xl bg-teal-500 px-5 py-2 font-semibold text-white transition hover:bg-teal-400">
                  Join Team
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
     <Footer />
    </div>
  );
}