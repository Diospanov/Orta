import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { createTeam } from "../api";

export default function CreateTeam() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [maxMembers, setMaxMembers] = useState(5);
  const [isPublic, setIsPublic] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    try {
      const newTeam = await createTeam({
        name,
        description: description || null,
        max_members: Number(maxMembers),
        is_public: isPublic,
      });

      navigate("/my-teams");
    } catch (error) {
      setErrorMessage(error.message);
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

      <main className="mx-auto max-w-3xl px-6 py-12">
        <h1 className="text-center text-5xl font-bold uppercase">
          Create Team
        </h1>

        <div className="mt-10 rounded-3xl border border-white/30 bg-[#0b6e95]/80 p-8 shadow-xl backdrop-blur-sm">
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="mb-2 block text-sm font-medium">
                Team Name
              </label>
              <input
                type="text"
                placeholder="Enter team name"
                value={name}
                onChange={(e) => setName(e.target.value)}
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
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-xl border border-white/40 bg-transparent px-4 py-3 text-white placeholder:text-white/70 outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Team Size
              </label>
              <input
                type="number"
                min="2"
                value={maxMembers}
                onChange={(e) => setMaxMembers(e.target.value)}
                className="w-full rounded-xl border border-white/40 bg-transparent px-4 py-3 text-white placeholder:text-white/70 outline-none"
              />
            </div>

            <div className="flex items-center gap-3">
              <input
                id="is_public"
                type="checkbox"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
              />
              <label htmlFor="is_public" className="text-sm font-medium">
                Public team
              </label>
            </div>

            {errorMessage && (
              <p className="text-sm text-red-200">{errorMessage}</p>
            )}

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