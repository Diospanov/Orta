import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const stats = [
  { icon: "👥", value: "4", label: "Total Teams" },
  { icon: "👑", value: "2", label: "Teams Created" },
  { icon: "✔", value: "8", label: "Goals Completed" },
  { icon: "🕘", value: "12", label: "Day Streak" },
];

const filters = ["All Teams", "Created by Me", "Joined Teams", "Archived"];

const teams = [
  {
    category: "Calculus & Math",
    role: "Creator",
    title: "Calculus Study Group for Beginners",
    description:
      "Weekly study sessions for Calculus I. We'll work through problems, review concepts, and prepare for exams together.",
    members: "6/8 members",
    activity: "Active 2 hours ago",
    progress: 65,
  },
  {
    category: "Calculus & Math",
    role: "Creator",
    title: "Calculus Study Group for Beginners",
    description:
      "Weekly study sessions for Calculus I. We'll work through problems, review concepts, and prepare for exams together.",
    members: "6/8 members",
    activity: "Active 2 hours ago",
    progress: 65,
  },
  {
    category: "Calculus & Math",
    role: "Creator",
    title: "Calculus Study Group for Beginners",
    description:
      "Weekly study sessions for Calculus I. We'll work through problems, review concepts, and prepare for exams together.",
    members: "6/8 members",
    activity: "Active 2 hours ago",
    progress: 65,
  },
  {
    category: "Calculus & Math",
    role: "Creator",
    title: "Calculus Study Group for Beginners",
    description:
      "Weekly study sessions for Calculus I. We'll work through problems, review concepts, and prepare for exams together.",
    members: "6/8 members",
    activity: "Active 2 hours ago",
    progress: 65,
  },
];

function StatCard({ icon, value, label }) {
  return (
    <div className="rounded-[24px] border border-[#d8d2a0] bg-[#0f6f95]/95 p-6 shadow-[0_8px_30px_rgba(0,0,0,0.18)] backdrop-blur-sm">
      <div className="flex items-center justify-between">
        <div className="text-6xl text-white md:text-7xl">{icon}</div>
        <div className="text-6xl font-light text-white md:text-7xl">{value}</div>
      </div>
      <div className="mt-4 text-right text-sm text-[#f5efbf] md:text-base">
        {label}
      </div>
    </div>
  );
}

function FilterButton({ text, active = false }) {
  return (
    <button
      className={`rounded-xl border px-5 py-2 text-sm font-medium transition ${
        active
          ? "border-[#10c7b0] bg-[#10c7b0] text-white"
          : "border-[#d8d2a0] bg-transparent text-white hover:bg-white/10"
      }`}
    >
      {text}
    </button>
  );
}

function TeamCard({ team }) {
  return (
    <div className="rounded-[24px] border border-[#13d0bb] bg-[#0f6f95]/95 p-6 shadow-[0_8px_30px_rgba(0,0,0,0.18)]">
      <div className="mb-5 flex items-center justify-between gap-3">
        <span className="rounded-full bg-[#0aa6a0]/50 px-3 py-1 text-xs text-[#f5efbf]">
          ▣ {team.category}
        </span>

        <span className="rounded-full bg-[#d8d2a0]/20 px-3 py-1 text-xs text-[#f5efbf]">
          👑 {team.role}
        </span>
      </div>

      <h3 className="max-w-[320px] text-[28px] font-semibold leading-tight text-white">
        {team.title}
      </h3>

      <p className="mt-5 min-h-[96px] text-[15px] leading-8 text-[#22cbb7]">
        {team.description}
      </p>

      <div className="mt-4 flex flex-wrap gap-5 text-sm text-[#d8d2a0]">
        <span>👥 {team.members}</span>
        <span>⏺ {team.activity}</span>
      </div>

      <div className="mt-6 border-t border-white/20 pt-5">
        <div className="mb-2 flex items-center justify-between text-sm text-white">
          <span>Team Progress</span>
          <span>{team.progress}%</span>
        </div>

        <div className="h-2 w-full rounded-full bg-[#1e2c87]">
          <div
            className="h-2 rounded-full bg-[#10c7b0]"
            style={{ width: `${team.progress}%` }}
          />
        </div>
      </div>

      <div className="mt-6 flex items-center gap-3">
        <button className="flex-1 rounded-xl border border-[#d8d2a0] px-4 py-3 font-medium text-white transition hover:bg-white/10">
          🏛 Open Team
        </button>

        <button className="rounded-xl bg-[#1e2c87] px-4 py-3 text-white">
          ⚙
        </button>

        <button className="rounded-xl bg-[#1e2c87] px-4 py-3 text-white">
          ⋮
        </button>
      </div>
    </div>
  );
}

export default function MyTeams() {
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

          <section className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat) => (
              <StatCard key={stat.label} {...stat} />
            ))}
          </section>

          <section className="mt-10 flex flex-wrap gap-4">
            {filters.map((filter, index) => (
              <FilterButton key={filter} text={filter} active={index === 0} />
            ))}
          </section>

          <section className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {teams.slice(0, 3).map((team, index) => (
              <TeamCard key={index} team={team} />
            ))}
          </section>

          <section className="mt-6 grid gap-6 xl:grid-cols-[1fr_1fr_1fr]">
            <div className="xl:col-span-1">
              <TeamCard team={teams[3]} />
            </div>

            <div className="hidden xl:col-span-2 xl:flex xl:items-end xl:justify-center">
              <img
                src="/bottom-character.png"
                alt="plant character"
                className="w-[320px]"
              />
            </div>
          </section>
        </main>
      </div>

      <Footer />
    </>
  );
}