import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { createTeam } from "../api";

const CATEGORY_OPTIONS = [
  "Calculus & Math",
  "Programming",
  "Language Learning",
  "Professional Projects",
  "Academic Studies",
  "Creative Arts",
  "Fitness & Health",
  "Other",
];

const COMMUNICATION_OPTIONS = [
  "Video Calls (Google Meet/Zoom)",
  "Chat Only",
  "Hybrid",
];

const MEETING_OPTIONS = [
  "Daily",
  "Weekly",
  "Bi-weekly",
  "Monthly",
  "Flexible",
];

const TIMEZONE_OPTIONS = [
  "Almaty (GMT+5)",
  "PST (Pacific Time)",
  "EST (Eastern Time)",
  "GMT (Greenwich Mean Time)",
  "CET (Central European Time)",
];

const COLLAB_OPTIONS = [
  "Orta Platform (Built-in)",
  "Google Drive",
  "Notion",
  "Discord",
];

const DEFAULT_CONDITIONS = [
  "Weekly commitment",
  "Camera on for sessions",
  "Respectful communication",
];

const INITIAL_FORM = {
  name: "",
  description: "",
  category: "",
  custom_category: "",
  max_members: 6,
  is_public: true,
  conditions_to_join: DEFAULT_CONDITIONS,
  communication_method: "Video Calls (Google Meet/Zoom)",
  meeting_frequency: "Weekly",
  timezone: "Almaty (GMT+5)",
  collaboration_method: "Orta Platform (Built-in)",
};

function SectionTitle({ title, subtitle }) {
  return (
    <div className="mb-5">
      <div className="inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[#dff5a6]">
        {title}
      </div>
      {subtitle ? (
        <p className="mt-3 text-sm text-white/70">{subtitle}</p>
      ) : null}
    </div>
  );
}

function InfoPill({ children }) {
  return (
    <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs text-white/80">
      {children}
    </span>
  );
}

export default function CreateTeam() {
  const [form, setForm] = useState(INITIAL_FORM);
  const [conditionInput, setConditionInput] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const setField = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const teamSizeLabel = useMemo(() => {
    if (form.max_members <= 4) return "Small";
    if (form.max_members <= 8) return "Medium";
    return "Large";
  }, [form.max_members]);

  const addCondition = () => {
    const cleaned = conditionInput.trim();
    if (!cleaned) return;

    const alreadyExists = form.conditions_to_join.some(
      (item) => item.toLowerCase() === cleaned.toLowerCase()
    );

    if (alreadyExists) {
      setConditionInput("");
      return;
    }

    setForm((prev) => ({
      ...prev,
      conditions_to_join: [...prev.conditions_to_join, cleaned],
    }));
    setConditionInput("");
  };

  const removeCondition = (conditionToRemove) => {
    setForm((prev) => ({
      ...prev,
      conditions_to_join: prev.conditions_to_join.filter(
        (condition) => condition !== conditionToRemove
      ),
    }));
  };

  const resetForm = () => {
    setForm(INITIAL_FORM);
    setConditionInput("");
    setErrorMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setLoading(true);

    try {
      const finalCategory =
        form.category === "Other"
          ? form.custom_category.trim() || "Other"
          : form.category || null;

      await createTeam({
        name: form.name.trim(),
        description: form.description.trim() || null,
        category: finalCategory,
        max_members: Number(form.max_members),
        is_public: form.is_public,
        conditions_to_join: form.conditions_to_join,
        communication_method: form.communication_method || null,
        meeting_frequency: form.meeting_frequency || null,
        timezone: form.timezone || null,
        collaboration_method: form.collaboration_method || null,
      });

      navigate("/my-teams");
    } catch (error) {
      setErrorMessage(error.message || "Failed to create team");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#067b96] text-white">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(4,122,145,0.82), rgba(4,122,145,0.88)), url('https://images.unsplash.com/photo-1497366754035-f200968a6e72?q=80&w=1600&auto=format&fit=crop')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />

      <div className="absolute -left-24 top-20 h-72 w-72 rounded-full bg-[#27d3ba]/20 blur-3xl" />
      <div className="absolute right-0 top-0 h-96 w-96 rounded-full bg-[#dff5a6]/10 blur-3xl" />
      <div className="absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-[#76e1ff]/10 blur-3xl" />

      <div
        className="absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage:
            "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)",
          backgroundSize: "42px 42px",
        }}
      />

      <div className="relative z-10">
        <Navbar />

        <main className="mx-auto max-w-7xl px-4 pb-12 pt-8 md:px-6 lg:px-8">
          <div className="mb-10 text-center">
            <p className="mb-3 inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-[#dff5a6]">
              Team Builder
            </p>
            <h1 className="text-4xl font-bold uppercase tracking-wide md:text-6xl">
              Create Your Team
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-sm text-white/75 md:text-base">
              Build a team page that feels clear, attractive, and inviting so
              people instantly understand what your group is about.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]"
          >
            <section className="space-y-6">
              <div className="rounded-[30px] border border-white/15 bg-white/10 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.18)] backdrop-blur-xl">
                <SectionTitle
                  title="Team Basics"
                  subtitle="Start with the main identity of your team: name, category, and purpose."
                />

                <div className="space-y-5">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-white/90">
                      Team Name
                    </label>
                    <input
                      type="text"
                      placeholder="Enter team name"
                      value={form.name}
                      onChange={(e) => setField("name", e.target.value)}
                      className="w-full rounded-2xl border border-white/20 bg-[#0a87a2]/80 px-4 py-3 text-white placeholder:text-white/55 outline-none transition duration-200 focus:border-[#dff5a6] focus:bg-[#0d8ca8]"
                      required
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-white/90">
                      Category
                    </label>

                    <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                      {CATEGORY_OPTIONS.map((category) => {
                        const active = form.category === category;

                        return (
                          <button
                            key={category}
                            type="button"
                            onClick={() => {
                              setField("category", category);
                              if (category !== "Other") {
                                setField("custom_category", "");
                              }
                            }}
                            className={`group rounded-2xl border px-3 py-4 text-sm font-medium transition-all duration-200 ${
                              active
                                ? "border-[#dff5a6] bg-gradient-to-br from-[#1bd0b8] to-[#10b7c5] text-white shadow-lg shadow-cyan-900/30"
                                : "border-white/15 bg-white/5 text-white/85 hover:-translate-y-0.5 hover:border-[#dff5a6]/60 hover:bg-white/10"
                            }`}
                          >
                            {category}
                          </button>
                        );
                      })}
                    </div>

                    {form.category === "Other" && (
                      <div className="mt-4">
                        <label className="mb-2 block text-sm font-medium text-white/85">
                          Write your category
                        </label>
                        <input
                          type="text"
                          placeholder="Enter your custom category"
                          value={form.custom_category}
                          onChange={(e) => setField("custom_category", e.target.value)}
                          className="w-full rounded-2xl border border-white/20 bg-[#0a87a2]/80 px-4 py-3 text-white placeholder:text-white/55 outline-none transition duration-200 focus:border-[#dff5a6] focus:bg-[#0d8ca8]"
                          required
                        />
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-white/90">
                      Description
                    </label>
                    <textarea
                      placeholder="Describe your team's goals, activities, and who should join"
                      rows="5"
                      value={form.description}
                      onChange={(e) => setField("description", e.target.value)}
                      className="w-full rounded-2xl border border-white/20 bg-[#0a87a2]/80 px-4 py-3 text-white placeholder:text-white/55 outline-none transition duration-200 focus:border-[#dff5a6] focus:bg-[#0d8ca8]"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="rounded-[30px] border border-white/15 bg-white/10 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.18)] backdrop-blur-xl">
                <SectionTitle
                  title="Team Setup"
                  subtitle="Choose the size, visibility, and conditions people should expect before joining."
                />

                <div className="space-y-6">
                  <div>
                    <div className="mb-3 flex items-center justify-between">
                      <label className="text-sm font-medium text-white/90">
                        Team Size
                      </label>
                      <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-2 text-right">
                        <div className="text-2xl font-bold leading-none">
                          {form.max_members}
                        </div>
                        <div className="mt-1 text-xs text-white/65">
                          {teamSizeLabel}
                        </div>
                      </div>
                    </div>

                    <input
                      type="range"
                      min="2"
                      max="20"
                      value={form.max_members}
                      onChange={(e) =>
                        setField("max_members", Number(e.target.value))
                      }
                      className="w-full cursor-pointer accent-[#dff5a6]"
                    />

                    <div className="mt-2 flex justify-between text-xs text-white/60">
                      <span>2</span>
                      <span>Best for focused groups</span>
                      <span>20</span>
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-white/90">
                      Team Visibility
                    </label>

                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setField("is_public", true)}
                        className={`rounded-2xl border px-4 py-4 text-left transition ${
                          form.is_public
                            ? "border-[#dff5a6] bg-gradient-to-br from-[#16c8b5] to-[#10b0c1] shadow-lg shadow-cyan-900/30"
                            : "border-white/15 bg-white/5 hover:bg-white/10"
                        }`}
                      >
                        <div className="text-sm font-semibold">Public</div>
                        <div className="mt-1 text-xs text-white/75">
                          Anyone can discover the team
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setField("is_public", false)}
                        className={`rounded-2xl border px-4 py-4 text-left transition ${
                          !form.is_public
                            ? "border-[#dff5a6] bg-gradient-to-br from-[#16c8b5] to-[#10b0c1] shadow-lg shadow-cyan-900/30"
                            : "border-white/15 bg-white/5 hover:bg-white/10"
                        }`}
                      >
                        <div className="text-sm font-semibold">Private</div>
                        <div className="mt-1 text-xs text-white/75">
                          Join requests must be approved
                        </div>
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-white/90">
                      Conditions to Join
                    </label>

                    <div className="rounded-3xl border border-white/10 bg-[#0b88a0]/55 p-4">
                      <div className="mb-4 flex flex-wrap gap-2">
                        {form.conditions_to_join.map((condition) => (
                          <span
                            key={condition}
                            className="inline-flex items-center gap-2 rounded-full border border-[#dff5a6]/30 bg-white/10 px-3 py-2 text-sm text-white/90"
                          >
                            {condition}
                            <button
                              type="button"
                              onClick={() => removeCondition(condition)}
                              className="rounded-full px-1 text-white/60 transition hover:bg-white/10 hover:text-white"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>

                      <div className="flex flex-col gap-2 sm:flex-row">
                        <input
                          type="text"
                          value={conditionInput}
                          onChange={(e) => setConditionInput(e.target.value)}
                          placeholder="Add custom condition"
                          className="flex-1 rounded-2xl border border-white/15 bg-[#f3eeb3] px-4 py-3 text-slate-800 placeholder:text-slate-500 outline-none"
                        />
                        <button
                          type="button"
                          onClick={addCondition}
                          className="rounded-2xl bg-[#eaf3aa] px-5 py-3 font-semibold text-[#0b7f94] transition hover:brightness-105"
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-[30px] border border-white/15 bg-white/10 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.18)] backdrop-blur-xl">
                <SectionTitle
                  title="Communication"
                  subtitle="Set expectations for how members will meet, communicate, and collaborate."
                />

                <div className="grid gap-5 md:grid-cols-2">
                  <div className="md:col-span-2">
                    <label className="mb-2 block text-sm font-medium text-white/90">
                      Primary Communication Method
                    </label>
                    <select
                      value={form.communication_method}
                      onChange={(e) =>
                        setField("communication_method", e.target.value)
                      }
                      className="w-full rounded-2xl border border-white/15 bg-[#14c6b4] px-4 py-3 text-white outline-none"
                    >
                      {COMMUNICATION_OPTIONS.map((option) => (
                        <option
                          key={option}
                          value={option}
                          className="text-slate-900"
                        >
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-white/90">
                      Meeting Frequency
                    </label>
                    <select
                      value={form.meeting_frequency}
                      onChange={(e) =>
                        setField("meeting_frequency", e.target.value)
                      }
                      className="w-full rounded-2xl border border-white/15 bg-[#14c6b4] px-4 py-3 text-white outline-none"
                    >
                      {MEETING_OPTIONS.map((option) => (
                        <option
                          key={option}
                          value={option}
                          className="text-slate-900"
                        >
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-white/90">
                      Primary Timezone
                    </label>
                    <select
                      value={form.timezone}
                      onChange={(e) => setField("timezone", e.target.value)}
                      className="w-full rounded-2xl border border-white/15 bg-[#14c6b4] px-4 py-3 text-white outline-none"
                    >
                      {TIMEZONE_OPTIONS.map((option) => (
                        <option
                          key={option}
                          value={option}
                          className="text-slate-900"
                        >
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="mb-2 block text-sm font-medium text-white/90">
                      File Sharing & Collaboration
                    </label>
                    <select
                      value={form.collaboration_method}
                      onChange={(e) =>
                        setField("collaboration_method", e.target.value)
                      }
                      className="w-full rounded-2xl border border-white/15 bg-[#14c6b4] px-4 py-3 text-white outline-none"
                    >
                      {COLLAB_OPTIONS.map((option) => (
                        <option
                          key={option}
                          value={option}
                          className="text-slate-900"
                        >
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </section>

            <aside className="space-y-6">
              <div className="sticky top-6 rounded-[30px] border border-white/15 bg-white/10 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.18)] backdrop-blur-xl">
                <div className="mb-5 flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#dff5a6]">
                      Live Preview
                    </p>
                    <h2 className="mt-2 text-3xl font-bold">Team Preview</h2>
                  </div>

                  <div className="flex -space-x-2">
                    <div className="h-9 w-9 rounded-full border-2 border-white/30 bg-[#dff5a6]" />
                    <div className="h-9 w-9 rounded-full border-2 border-white/30 bg-[#8be4ff]" />
                    <div className="h-9 w-9 rounded-full border-2 border-white/30 bg-[#14c6b4]" />
                  </div>
                </div>

                <div className="rounded-[28px] border border-white/10 bg-gradient-to-br from-[#117d96] to-[#0b6784] p-5 shadow-inner">
                  <div className="mb-4 flex flex-wrap items-center gap-2">
                    <InfoPill>
                      {form.category === "Other"
                        ? form.custom_category || "Custom Category"
                        : form.category || "Select a Category"}
                    </InfoPill>
                    <InfoPill>{form.is_public ? "Open Team" : "Private Team"}</InfoPill>
                    <InfoPill>{form.meeting_frequency}</InfoPill>
                  </div>

                  <h3 className="text-3xl font-bold leading-tight">
                    {form.name || "Your Team Name Will Appear Here"}
                  </h3>

                  <p className="mt-3 text-sm leading-6 text-white/78">
                    {form.description ||
                      "Your team description will appear here. This is what people will read first when they discover your group."}
                  </p>

                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <div className="rounded-2xl border border-white/10 bg-white/10 p-3">
                      <p className="text-xs text-white/60">Members</p>
                      <p className="mt-1 text-lg font-semibold">
                        1 / {form.max_members}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/10 p-3">
                      <p className="text-xs text-white/60">Timezone</p>
                      <p className="mt-1 text-sm font-semibold">{form.timezone}</p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/10 p-3">
                      <p className="text-xs text-white/60">Communication</p>
                      <p className="mt-1 text-sm font-semibold">
                        {form.communication_method}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/10 p-3">
                      <p className="text-xs text-white/60">Collaboration</p>
                      <p className="mt-1 text-sm font-semibold">
                        {form.collaboration_method}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5">
                    <p className="mb-3 text-sm font-semibold">
                      Conditions to join
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {form.conditions_to_join.length > 0 ? (
                        form.conditions_to_join.map((condition) => (
                          <span
                            key={condition}
                            className="rounded-full border border-white/10 bg-white/10 px-3 py-2 text-xs text-white/88"
                          >
                            {condition}
                          </span>
                        ))
                      ) : (
                        <span className="text-sm text-white/65">
                          No conditions added yet
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mt-6 rounded-2xl border border-[#dff5a6]/20 bg-[#dff5a6]/10 px-4 py-3 text-sm text-white/85">
                    This card updates live so you can see how your team will
                    look before publishing it.
                  </div>
                </div>

                <div className="mt-5 rounded-2xl border border-white/10 bg-white/10 p-4">
                  <p className="text-sm font-semibold text-white/90">
                    What members will get
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <InfoPill>Built-in chat</InfoPill>
                    <InfoPill>File sharing</InfoPill>
                    <InfoPill>Simple team management</InfoPill>
                    <InfoPill>Structured collaboration</InfoPill>
                  </div>
                </div>
              </div>

              <div className="rounded-[30px] border border-white/15 bg-white/10 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.18)] backdrop-blur-xl">
                <div className="mb-4">
                  <p className="text-sm font-semibold text-white/90">
                    Ready to publish?
                  </p>
                  <p className="mt-1 text-sm text-white/65">
                    Double-check the preview, then create the team.
                  </p>
                </div>

                {errorMessage ? (
                  <p className="mb-4 rounded-2xl border border-red-300/20 bg-red-500/15 px-4 py-3 text-sm text-red-100">
                    {errorMessage}
                  </p>
                ) : null}

                <div className="flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="flex-1 rounded-2xl border border-white/15 bg-white/5 px-4 py-3 font-semibold text-white transition hover:bg-white/10"
                  >
                    Reset Form
                  </button>

                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 rounded-2xl bg-[#eef2aa] px-4 py-3 font-bold text-[#0b7f94] shadow-lg shadow-[#eef2aa]/20 transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {loading ? "Creating..." : "Create Team"}
                  </button>
                </div>
              </div>
            </aside>
          </form>
        </main>
        <Footer />
      </div>
    </div>
  );
}