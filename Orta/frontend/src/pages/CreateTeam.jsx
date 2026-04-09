import Navbar from "../components/Navbar";

export default function CreateTeam() {
  return (
    <div
      className="min-h-screen bg-cover bg-center text-white"
      style={{
        backgroundImage:
          "linear-gradient(rgba(0,120,145,0.78), rgba(0,120,145,0.78)), url('https://images.unsplash.com/photo-1497366754035-f200968a6e72?q=80&w=1600&auto=format&fit=crop')",
      }}
    >
      <Navbar />

      <main className="mx-auto max-w-3xl px-6 py-12">
        <h1 className="text-center text-5xl font-bold uppercase">
          Create Team
        </h1>

        <div className="mt-10 rounded-3xl border border-white/30 bg-[#0b6e95]/80 p-8 shadow-xl backdrop-blur-sm">
          <form className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium">
                Team Name
              </label>
              <input
                type="text"
                placeholder="Enter team name"
                className="w-full rounded-xl border border-white/40 bg-transparent px-4 py-3 text-white placeholder:text-white/70 outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Category
              </label>
              <input
                type="text"
                placeholder="Enter category"
                className="w-full rounded-xl border border-white/40 bg-transparent px-4 py-3 text-white placeholder:text-white/70 outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Description
              </label>
              <textarea
                placeholder="Enter description"
                rows="5"
                className="w-full rounded-xl border border-white/40 bg-transparent px-4 py-3 text-white placeholder:text-white/70 outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Team Size
              </label>
              <input
                type="number"
                placeholder="Enter max team size"
                className="w-full rounded-xl border border-white/40 bg-transparent px-4 py-3 text-white placeholder:text-white/70 outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-xl bg-teal-500 py-3 text-lg font-semibold text-white transition hover:bg-teal-400"
            >
              Create Team
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}