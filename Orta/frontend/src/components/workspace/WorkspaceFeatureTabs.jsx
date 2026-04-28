import { useEffect, useState } from "react";
import {
  acceptJoinRequest,
  getTeamJoinRequests,
  rejectJoinRequest,
  getTeamGoals,
  createTeamGoal,
  updateTeamGoal,
  deleteTeamGoal,
  getTeamSchedule,
  createTeamScheduleEvent,
  updateTeamScheduleEvent,
  deleteTeamScheduleEvent,
  updateTeam,
  updateTeamMemberRole,
  removeTeamMember,
  transferTeamOwnership,
  deleteTeamFile, 
  getTeamFiles, 
  uploadTeamFile 
} from "../../api";


function storageKey(teamId, feature) {
  return `orta-team-${teamId}-${feature}`;
}

function readStorage(teamId, feature) {
  try {
    const raw = localStorage.getItem(storageKey(teamId, feature));
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function useTeamStorage(teamId, feature) {
  const [items, setItemsState] = useState(() => readStorage(teamId, feature));

  useEffect(() => {
    setItemsState(readStorage(teamId, feature));
  }, [teamId, feature]);

  const setItems = (updater) => {
    setItemsState((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      localStorage.setItem(storageKey(teamId, feature), JSON.stringify(next));
      return next;
    });
  };

  return [items, setItems];
}

function formatDateTime(value) {
  if (!value) return "Not set";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not set";

  return date.toLocaleString([], {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatFileSize(bytes) {
  const size = Number(bytes || 0);

  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;

  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function Card({ children, className = "" }) {
  return (
    <div className={`rounded-[18px] bg-[#0d8a99] p-5 ${className}`}>
      {children}
    </div>
  );
}

function SectionHeader({ title, subtitle }) {
  return (
    <div className="mb-5">
      <h1 className="text-4xl font-bold text-white">{title}</h1>
      {subtitle && <p className="mt-2 text-sm text-white/75">{subtitle}</p>}
      <div className="mt-5 h-px bg-white/20" />
    </div>
  );
}

function EmptyState({ children }) {
  return (
    <div className="rounded-2xl border border-dashed border-white/30 bg-white/10 p-6 text-center text-sm text-white/70">
      {children}
    </div>
  );
}

export function OverviewTab({ team, availableSpots }) {
  const [goals, setGoals] = useState([]);
  const [files, setFiles] = useState([]);
  const [schedule, setSchedule] = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);

  const loadOverviewStats = async () => {
    try {
      setLoadingStats(true);

      const [goalsData, filesData, scheduleData] = await Promise.all([
        getTeamGoals(team.id),
        getTeamFiles(team.id),
        getTeamSchedule(team.id),
      ]);

      setGoals(Array.isArray(goalsData) ? goalsData : []);
      setFiles(Array.isArray(filesData) ? filesData : []);
      setSchedule(Array.isArray(scheduleData) ? scheduleData : []);
    } catch (error) {
      console.error("Failed to load overview stats:", error);
    } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    if (team?.id) {
      loadOverviewStats();
    }
  }, [team?.id]);

  const completedGoals = goals.filter((goal) => goal.completed).length;
  const upcomingEvents = schedule.filter((event) => !event.completed).length;

  return (
    <>
      <SectionHeader title="Team Overview" subtitle={team.name} />

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <p className="text-sm text-white/80">Total Goals</p>
          <p className="mt-3 text-4xl font-bold text-white">
            {loadingStats ? "..." : goals.length}
          </p>
        </Card>

        <Card>
          <p className="text-sm text-white/80">Completed Goals</p>
          <p className="mt-3 text-4xl font-bold text-white">
            {loadingStats ? "..." : completedGoals}
          </p>
        </Card>

        <Card>
          <p className="text-sm text-white/80">Files Shared</p>
          <p className="mt-3 text-4xl font-bold text-white">
            {loadingStats ? "..." : files.length}
          </p>
        </Card>

        <Card>
          <p className="text-sm text-white/80">Upcoming Events</p>
          <p className="mt-3 text-4xl font-bold text-white">
            {loadingStats ? "..." : upcomingEvents}
          </p>
        </Card>
      </div>

      <Card className="mt-5">
        <h2 className="text-2xl font-bold text-white">Goal Progress</h2>

        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-white/75">
            {completedGoals}/{goals.length} completed
          </p>

          <p className="text-sm font-semibold text-[#f1f3b0]">
            {goals.length
              ? Math.round((completedGoals / goals.length) * 100)
              : 0}
            %
          </p>
        </div>

        <div className="mt-3 h-3 rounded-full bg-white/15">
          <div
            className="h-3 rounded-full bg-[#f1f3b0]"
            style={{
              width: `${
                goals.length
                  ? Math.round((completedGoals / goals.length) * 100)
                  : 0
              }%`,
            }}
          />
        </div>
      </Card>

      <Card className="mt-5">
        <h2 className="text-2xl font-bold text-white">About This Team</h2>

        <p className="mt-4 text-base leading-8 text-white/90">
          {team.description || "No team description provided."}
        </p>

        <div className="mt-6 grid gap-3 md:grid-cols-2">
          <div className="rounded-xl bg-white/10 p-4">
            <p className="text-xs uppercase text-white/60">Members</p>
            <p className="mt-2 font-semibold text-white">
              {team.member_count || 0}/{team.max_members}
            </p>
          </div>

          <div className="rounded-xl bg-white/10 p-4">
            <p className="text-xs uppercase text-white/60">Available Spots</p>
            <p className="mt-2 font-semibold text-white">{availableSpots}</p>
          </div>

          <div className="rounded-xl bg-white/10 p-4">
            <p className="text-xs uppercase text-white/60">Communication</p>
            <p className="mt-2 font-semibold text-white">
              {team.communication_method || "Not specified"}
            </p>
          </div>

          <div className="rounded-xl bg-white/10 p-4">
            <p className="text-xs uppercase text-white/60">Timezone</p>
            <p className="mt-2 font-semibold text-white">
              {team.timezone || "Not specified"}
            </p>
          </div>
        </div>
      </Card>
    </>
  );
}

export function GoalsTab({ teamId }) {
  const [goals, setGoals] = useState([]);
  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [loadingGoals, setLoadingGoals] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const loadGoals = async () => {
    try {
      setLoadingGoals(true);
      setErrorMessage("");

      const data = await getTeamGoals(teamId);
      setGoals(Array.isArray(data) ? data : []);
    } catch (error) {
      setErrorMessage(error.message || "Failed to load goals");
    } finally {
      setLoadingGoals(false);
    }
  };

  useEffect(() => {
    loadGoals();
  }, [teamId]);

  const completed = goals.filter((goal) => goal.completed).length;
  const progress = goals.length ? Math.round((completed / goals.length) * 100) : 0;

  const addGoal = async () => {
    if (!title.trim()) return;

    try {
      setErrorMessage("");

      const createdGoal = await createTeamGoal(teamId, {
        title: title.trim(),
        note: note.trim() || null,
        priority,
      });

      setGoals((prev) => [createdGoal, ...prev]);
      setTitle("");
      setNote("");
      setPriority("Medium");
    } catch (error) {
      setErrorMessage(error.message || "Failed to create goal");
    }
  };

  const toggleGoal = async (goal) => {
    try {
        const updatedGoal = await updateTeamGoal(teamId, goal.id, {
        completed: !goal.completed,
        });

        setGoals((prev) =>
        prev.map((item) => (item.id === goal.id ? updatedGoal : item))
        );
    } catch (error) {
        alert(error.message || "Failed to update goal");
    }
    };

  const removeGoal = async (goalId) => {
    try {
      await deleteTeamGoal(teamId, goalId);
      setGoals((prev) => prev.filter((goal) => goal.id !== goalId));
    } catch (error) {
      alert(error.message || "Failed to delete goal");
    }
  };

  return (
    <>
      <SectionHeader
        title="Goals"
        subtitle="Create goals, track progress, and mark completed tasks."
      />

      <Card>
        <div className="grid gap-3 md:grid-cols-[1fr_160px]">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Goal title..."
            className="rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-white placeholder:text-white/50 outline-none"
          />

          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="rounded-xl border border-white/20 bg-[#0b6f95] px-4 py-3 text-white outline-none"
          >
            <option>Low</option>
            <option>Medium</option>
            <option>High</option>
          </select>
        </div>

        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Goal note..."
          rows={3}
          className="mt-3 w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-white placeholder:text-white/50 outline-none"
        />

        <button
          type="button"
          onClick={addGoal}
          className="mt-3 rounded-xl bg-[#12c39b] px-5 py-3 font-semibold text-white hover:bg-[#16d1a7]"
        >
          Add Goal
        </button>

        {errorMessage && (
          <p className="mt-4 rounded-xl bg-red-500/20 p-3 text-sm text-red-100">
            {errorMessage}
          </p>
        )}
      </Card>

      <Card className="mt-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">Progress</h2>
          <p className="text-sm text-white/75">
            {completed}/{goals.length} completed
          </p>
        </div>

        <div className="h-3 rounded-full bg-white/15">
          <div
            className="h-3 rounded-full bg-[#f1f3b0]"
            style={{ width: `${progress}%` }}
          />
        </div>
      </Card>

      <div className="mt-5 space-y-3">
        {loadingGoals ? (
          <p className="text-sm text-white/70">Loading goals...</p>
        ) : goals.length === 0 ? (
          <EmptyState>No goals yet. Add your first team goal.</EmptyState>
        ) : (
          goals.map((goal) => (
            <div
                key={goal.id}
                className={`rounded-2xl border p-4 transition ${
                goal.completed
                    ? "border-green-300/40 bg-green-500/10"
                    : "border-white/15 bg-white/10"
                }`}
            >
                <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-3">
                    <span className="text-2xl">
                        {goal.completed ? "✅" : "⭕"}
                    </span>

                    <h3
                        className={`text-lg font-bold ${
                        goal.completed
                            ? "text-white/50 line-through"
                            : "text-white"
                        }`}
                    >
                        {goal.title}
                    </h3>
                    </div>

                    {goal.note && (
                    <p className="mt-2 text-sm leading-6 text-white/70">
                        {goal.note}
                    </p>
                    )}

                    <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span className="inline-block rounded-full bg-[#f1f3b0] px-3 py-1 text-xs font-bold text-[#0a6787]">
                        {goal.priority}
                    </span>

                    {goal.completed && (
                        <span className="inline-block rounded-full bg-green-400/20 px-3 py-1 text-xs font-semibold text-green-100">
                        Completed
                        </span>
                    )}
                    </div>
                </div>

                <div className="flex shrink-0 flex-col gap-2">
                    <button
                    type="button"
                    onClick={() => toggleGoal(goal)}
                    className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                        goal.completed
                        ? "bg-yellow-400/20 text-yellow-100 hover:bg-yellow-400/30"
                        : "bg-green-500 text-white hover:bg-green-600"
                    }`}
                    >
                    {goal.completed ? "Undo" : "Mark Done"}
                    </button>

                    <button
                    type="button"
                    onClick={() => removeGoal(goal.id)}
                    className="rounded-xl bg-red-500/20 px-4 py-2 text-sm text-red-100 hover:bg-red-500/35"
                    >
                    Delete
                    </button>
                </div>
                </div>
            </div>
            ))
        )}
      </div>
    </>
  );
}

export function FilesTab({ teamId }) {
  const [files, setFiles] = useState([]);
  const [loadingFiles, setLoadingFiles] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const loadFiles = async () => {
    try {
      setLoadingFiles(true);
      setErrorMessage("");

      const data = await getTeamFiles(teamId);
      setFiles(Array.isArray(data) ? data : []);
    } catch (error) {
      setErrorMessage(error.message || "Failed to load files");
    } finally {
      setLoadingFiles(false);
    }
  };

  useEffect(() => {
    loadFiles();
  }, [teamId]);

  const handleUpload = async (selectedFiles) => {
    const fileArray = Array.from(selectedFiles || []);

    if (fileArray.length === 0) return;

    try {
      setUploading(true);
      setErrorMessage("");

      const uploadedFiles = [];

      for (const file of fileArray) {
        const uploaded = await uploadTeamFile(teamId, file);
        uploadedFiles.push(uploaded);
      }

      setFiles((prev) => [...uploadedFiles, ...prev]);
    } catch (error) {
      setErrorMessage(error.message || "Failed to upload file");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (fileId) => {
    try {
      await deleteTeamFile(teamId, fileId);
      setFiles((prev) => prev.filter((file) => file.id !== fileId));
    } catch (error) {
      alert(error.message || "Failed to delete file");
    }
  };

  return (
    <>
      <SectionHeader
        title="Files"
        subtitle="Upload team files to Supabase Storage."
      />

      <Card>
        <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-white/35 bg-white/10 p-8 text-center hover:bg-white/15">
          <span className="text-4xl">📁</span>

          <span className="mt-3 text-lg font-bold text-white">
            {uploading ? "Uploading..." : "Upload files"}
          </span>

          <span className="mt-2 text-sm text-white/65">
            Files are uploaded to Supabase Storage.
          </span>

          <input
            type="file"
            multiple
            disabled={uploading}
            className="hidden"
            onChange={(e) => {
              handleUpload(e.target.files);
              e.target.value = "";
            }}
          />
        </label>

        {errorMessage && (
          <p className="mt-4 rounded-xl bg-red-500/20 p-3 text-sm text-red-100">
            {errorMessage}
          </p>
        )}
      </Card>

      <div className="mt-5 space-y-3">
        {loadingFiles ? (
          <p className="text-sm text-white/70">Loading files...</p>
        ) : files.length === 0 ? (
          <EmptyState>No files yet. Upload a file to show it here.</EmptyState>
        ) : (
          files.map((file) => (
            <div
              key={file.id}
              className="flex items-center justify-between gap-4 rounded-2xl border border-white/15 bg-white/10 p-4"
            >
              <div className="min-w-0">
                <p className="truncate text-lg font-bold text-white">
                  📄 {file.filename}
                </p>

                <p className="mt-1 text-sm text-white/65">
                  {formatFileSize(file.file_size)} •{" "}
                  {file.file_type || "Unknown type"} •{" "}
                  {formatDateTime(file.created_at)}
                </p>
              </div>

              <div className="flex gap-2">
                <a
                  href={file.file_url}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-lg bg-[#12c39b] px-3 py-2 text-sm font-semibold text-white hover:bg-[#16d1a7]"
                >
                  Open
                </a>

                <button
                  type="button"
                  onClick={() => handleDelete(file.id)}
                  className="rounded-lg bg-red-500/20 px-3 py-2 text-sm text-red-100 hover:bg-red-500/35"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
}

export function ScheduleTab({ teamId }) {
  const [events, setEvents] = useState([]);
  const [title, setTitle] = useState("");
  const [dateTime, setDateTime] = useState("");
  const [location, setLocation] = useState("");
  const [note, setNote] = useState("");
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const loadEvents = async () => {
    try {
      setLoadingEvents(true);
      setErrorMessage("");

      const data = await getTeamSchedule(teamId);
      setEvents(Array.isArray(data) ? data : []);
    } catch (error) {
      setErrorMessage(error.message || "Failed to load schedule");
    } finally {
      setLoadingEvents(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, [teamId]);

  const addEvent = async () => {
    if (!title.trim()) return;

    try {
      setErrorMessage("");

      const createdEvent = await createTeamScheduleEvent(teamId, {
        title: title.trim(),
        date_time: dateTime || null,
        location: location.trim() || null,
        note: note.trim() || null,
      });

      setEvents((prev) => [createdEvent, ...prev]);

      setTitle("");
      setDateTime("");
      setLocation("");
      setNote("");
    } catch (error) {
      setErrorMessage(error.message || "Failed to create event");
    }
  };

  const toggleEvent = async (event) => {
    try {
      const updatedEvent = await updateTeamScheduleEvent(teamId, event.id, {
        completed: !event.completed,
      });

      setEvents((prev) =>
        prev.map((item) => (item.id === event.id ? updatedEvent : item))
      );
    } catch (error) {
      alert(error.message || "Failed to update event");
    }
  };

  const removeEvent = async (eventId) => {
    try {
      await deleteTeamScheduleEvent(teamId, eventId);
      setEvents((prev) => prev.filter((event) => event.id !== eventId));
    } catch (error) {
      alert(error.message || "Failed to delete event");
    }
  };

  return (
    <>
      <SectionHeader
        title="Schedule"
        subtitle="Plan meetings, study sessions, deadlines, or team calls."
      />

      <Card>
        <div className="grid gap-3 md:grid-cols-2">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Event title..."
            className="rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-white placeholder:text-white/50 outline-none"
          />

          <input
            type="datetime-local"
            value={dateTime}
            onChange={(e) => setDateTime(e.target.value)}
            className="rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-white outline-none"
          />
        </div>

        <input
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Location or meeting link..."
          className="mt-3 w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-white placeholder:text-white/50 outline-none"
        />

        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Event note..."
          rows={3}
          className="mt-3 w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-white placeholder:text-white/50 outline-none"
        />

        <button
          type="button"
          onClick={addEvent}
          className="mt-3 rounded-xl bg-[#12c39b] px-5 py-3 font-semibold text-white hover:bg-[#16d1a7]"
        >
          Add Event
        </button>

        {errorMessage && (
          <p className="mt-4 rounded-xl bg-red-500/20 p-3 text-sm text-red-100">
            {errorMessage}
          </p>
        )}
      </Card>

      <div className="mt-5 space-y-3">
        {loadingEvents ? (
          <p className="text-sm text-white/70">Loading schedule...</p>
        ) : events.length === 0 ? (
          <EmptyState>No events yet. Add your first team event.</EmptyState>
        ) : (
          events.map((event) => (
            <div
              key={event.id}
              className="rounded-2xl border border-white/15 bg-white/10 p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <button
                    type="button"
                    onClick={() => toggleEvent(event)}
                    className={`text-left text-lg font-bold ${
                      event.completed ? "text-white/45 line-through" : "text-white"
                    }`}
                  >
                    {event.completed ? "✅" : "📅"} {event.title}
                  </button>

                  <p className="mt-2 text-sm text-white/70">
                    {formatDateTime(event.date_time)}
                  </p>

                  {event.location && (
                    <p className="mt-1 text-sm text-white/70">
                      📍 {event.location}
                    </p>
                  )}

                  {event.note && (
                    <p className="mt-2 text-sm leading-6 text-white/70">
                      {event.note}
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => removeEvent(event.id)}
                  className="rounded-lg bg-red-500/20 px-3 py-2 text-sm text-red-100 hover:bg-red-500/35"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
}

export function SettingsTab({
  teamId,
  team,
  members = [],
  isOwner,
  onTeamUpdated,
}) {
  const [formData, setFormData] = useState({
    name: team.name || "",
    description: team.description || "",
    category: team.category || "",
    max_members: team.max_members || 10,
    is_public: Boolean(team.is_public),
    communication_method: team.communication_method || "",
    meeting_frequency: team.meeting_frequency || "",
    timezone: team.timezone || "",
    collaboration_method: team.collaboration_method || "",
    conditions_to_join: Array.isArray(team.conditions_to_join)
      ? team.conditions_to_join.join(", ")
      : "",
  });

  const [savingTeam, setSavingTeam] = useState(false);
  const [teamError, setTeamError] = useState("");
  const [teamSuccess, setTeamSuccess] = useState("");
  const [memberActionId, setMemberActionId] = useState(null);

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSaveTeam = async () => {
    try {
      setSavingTeam(true);
      setTeamError("");
      setTeamSuccess("");

      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        category: formData.category.trim() || null,
        max_members: Number(formData.max_members),
        is_public: formData.is_public,
        communication_method: formData.communication_method.trim() || null,
        meeting_frequency: formData.meeting_frequency.trim() || null,
        timezone: formData.timezone.trim() || null,
        collaboration_method: formData.collaboration_method.trim() || null,
        conditions_to_join: formData.conditions_to_join
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
      };

      await updateTeam(teamId, payload);

      setTeamSuccess("Team updated successfully.");
      onTeamUpdated?.();
    } catch (error) {
      setTeamError(error.message || "Failed to update team");
    } finally {
      setSavingTeam(false);
    }
  };

  const handleRoleChange = async (memberId, newRole) => {
    try {
      setMemberActionId(memberId);
      await updateTeamMemberRole(teamId, memberId, newRole);
      onTeamUpdated?.();
    } catch (error) {
      alert(error.message || "Failed to update role");
    } finally {
      setMemberActionId(null);
    }
  };

  const handleTransferOwnership = async (member) => {
    const username =
        member.username || member.user?.username || "this member";

    const confirmed = window.confirm(
        `Transfer team ownership to ${username}? You will no longer be the owner.`
    );

    if (!confirmed) return;

    try {
        setMemberActionId(member.id);

        await transferTeamOwnership(teamId, member.id);

        alert("Ownership transferred successfully.");
        onTeamUpdated?.();
    } catch (error) {
        alert(error.message || "Failed to transfer ownership");
    } finally {
        setMemberActionId(null);
    }
  };

  const handleRemoveMember = async (memberId, username) => {
    const confirmed = window.confirm(
      `Remove ${username || "this member"} from the team?`
    );

    if (!confirmed) return;

    try {
      setMemberActionId(memberId);
      await removeTeamMember(teamId, memberId);
      onTeamUpdated?.();
    } catch (error) {
      alert(error.message || "Failed to remove member");
    } finally {
      setMemberActionId(null);
    }
  };

  if (!isOwner) {
    return (
      <>
        <SectionHeader
          title="Settings"
          subtitle="Only the team owner can manage team settings."
        />

        <Card>
          <p className="text-sm text-white/75">
            You can view this workspace, but only the team owner can edit team
            information or manage members.
          </p>
        </Card>
      </>
    );
  }

  return (
    <>
      <SectionHeader
        title="Settings"
        subtitle="Edit team information and manage members."
      />

      <Card>
        <h2 className="text-2xl font-bold text-white">Edit Team</h2>

        <div className="mt-5 grid gap-3 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm text-white/75">Team name</label>
            <input
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-white outline-none placeholder:text-white/50"
              placeholder="Team name"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-white/75">Category</label>
            <input
              value={formData.category}
              onChange={(e) => handleChange("category", e.target.value)}
              className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-white outline-none placeholder:text-white/50"
              placeholder="Category"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-white/75">Max members</label>
            <input
              type="number"
              min="1"
              value={formData.max_members}
              onChange={(e) => handleChange("max_members", e.target.value)}
              className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-white outline-none"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-white/75">Visibility</label>
            <select
              value={formData.is_public ? "public" : "private"}
              onChange={(e) =>
                handleChange("is_public", e.target.value === "public")
              }
              className="w-full rounded-xl border border-white/20 bg-[#0b6f95] px-4 py-3 text-white outline-none"
            >
              <option value="public">Public team</option>
              <option value="private">Private team</option>
            </select>
          </div>
        </div>

        <div className="mt-3">
          <label className="mb-2 block text-sm text-white/75">Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => handleChange("description", e.target.value)}
            rows={4}
            className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-white outline-none placeholder:text-white/50"
            placeholder="Team description"
          />
        </div>

        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm text-white/75">
              Communication method
            </label>
            <input
              value={formData.communication_method}
              onChange={(e) =>
                handleChange("communication_method", e.target.value)
              }
              className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-white outline-none"
              placeholder="Discord, Telegram, Zoom..."
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-white/75">
              Meeting frequency
            </label>
            <input
              value={formData.meeting_frequency}
              onChange={(e) =>
                handleChange("meeting_frequency", e.target.value)
              }
              className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-white outline-none"
              placeholder="Weekly, daily, every Friday..."
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-white/75">Timezone</label>
            <input
              value={formData.timezone}
              onChange={(e) => handleChange("timezone", e.target.value)}
              className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-white outline-none"
              placeholder="Almaty (GMT+5)"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-white/75">
              Collaboration method
            </label>
            <input
              value={formData.collaboration_method}
              onChange={(e) =>
                handleChange("collaboration_method", e.target.value)
              }
              className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-white outline-none"
              placeholder="Online, hybrid, offline..."
            />
          </div>
        </div>

        <div className="mt-3">
          <label className="mb-2 block text-sm text-white/75">
            Conditions to join
          </label>
          <input
            value={formData.conditions_to_join}
            onChange={(e) => handleChange("conditions_to_join", e.target.value)}
            className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-white outline-none"
            placeholder="Separate conditions with commas"
          />
        </div>

        {teamError && (
          <p className="mt-4 rounded-xl bg-red-500/20 p-3 text-sm text-red-100">
            {teamError}
          </p>
        )}

        {teamSuccess && (
          <p className="mt-4 rounded-xl bg-green-500/20 p-3 text-sm text-green-100">
            {teamSuccess}
          </p>
        )}

        <button
          type="button"
          onClick={handleSaveTeam}
          disabled={savingTeam}
          className="mt-5 rounded-xl bg-[#12c39b] px-5 py-3 font-semibold text-white hover:bg-[#16d1a7] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {savingTeam ? "Saving..." : "Save Changes"}
        </button>
      </Card>

      <Card className="mt-5">
        <h2 className="text-2xl font-bold text-white">Manage Members</h2>

        <div className="mt-5 space-y-3">
          {members.length === 0 ? (
            <p className="text-sm text-white/70">No members found.</p>
          ) : (
            members.map((member) => {
                const username =
                    member.username || member.user?.username || "Unknown user";

                const memberUserId = Number(member.user_id ?? member.user?.id);

                const isTeamOwner = memberUserId === Number(team.owner_id);

                return (
                    <div
                    key={member.id}
                    className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-white/10 p-4"
                    >
                    <div>
                        <p className="font-bold text-white">{username}</p>

                        <p className="text-sm text-white/60">
                        {isTeamOwner ? "Team owner" : `Role: ${member.role}`}
                        </p>
                    </div>

                    {isTeamOwner ? (
                        <span className="rounded-full bg-[#f1f3b0] px-3 py-1 text-xs font-bold text-[#0a6787]">
                        Owner
                        </span>
                    ) : (
                        <div className="flex flex-wrap gap-2">
                        <select
                            value={member.role || "member"}
                            disabled={memberActionId === member.id}
                            onChange={(e) => handleRoleChange(member.id, e.target.value)}
                            className="rounded-xl border border-white/20 bg-[#0b6f95] px-3 py-2 text-sm text-white outline-none"
                        >
                            <option value="member">Member</option>
                            <option value="admin">Admin</option>
                        </select>

                        <button
                            type="button"
                            disabled={memberActionId === member.id}
                            onClick={() => handleTransferOwnership(member)}
                            className="rounded-xl bg-[#f1f3b0] px-4 py-2 text-sm font-semibold text-[#0a6787] hover:bg-[#f6f8c2] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            Transfer Ownership
                        </button>

                        <button
                            type="button"
                            disabled={memberActionId === member.id}
                            onClick={() => handleRemoveMember(member.id, username)}
                            className="rounded-xl bg-red-500/20 px-4 py-2 text-sm text-red-100 hover:bg-red-500/35 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            Remove
                        </button>
                        </div>
                    )}
                    </div>
                );
                })
          )}
        </div>
      </Card>
    </>
  );
}