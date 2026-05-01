import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/useAuth";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { updateProfile } from "../api";

const achievements = [
  "🏅 Team Leader",
  "⭐ 100 Tasks",
  "🗣️ Active Communicator",
  "⏰ Early Bird",
];

const upcomingSessions = [
  {
    time: "Today, 18:00 - 19:30",
    title: "Calculus Problem",
    subtitle: "Advanced Calculus Study",
  },
  {
    time: "Tomorrow, 16:00 - 17:00",
    title: "React Code Review",
    subtitle: "React Project Team",
  },
  {
    time: "Friday, 19:00 - 20:00",
    title: "Spanish Conversation",
    subtitle: "Spanish Practice Group",
  },
];

const quickActions = [
  "💬 Start New Chat",
  "📅 Schedule Meeting",
  "📄 Upload File",
  "🔍 Find Team",
];

const recommended = [
  {
    title: "Machine Learning Study",
    subtitle: "AI & Data Science",
  },
  {
    title: "Japanese Beginners",
    subtitle: "Language Learning",
  },
  {
    title: "Data Analysis Project",
    subtitle: "Statistics",
  },
];

const technicalSkills = [
  "Python",
  "JavaScript",
  "React",
  "Machine Learning",
  "Data Analysis",
  "SQL",
  "Git",
  "Docker",
];

const interests = [
  "Calculus",
  "Language Learning",
  "Open Source",
  "Startups",
  "AI Research",
  "Hiking",
  "Photography",
];

const teams = [
  {
    category: "Calculus",
    status: "Active",
    title: "Advanced Calculus Study",
    description:
      "Weekly study sessions for multivariable calculus. Focusing on problem-solving and exam preparation.",
    members: "5 members",
  },
  {
    category: "Programming",
    status: "Active",
    title: "React Project Team",
    description:
      "Building a full-stack application with React and Node.js. Looking for frontend developers.",
    members: "5 members",
  },
  {
    category: "Language",
    status: "Looking",
    title: "Spanish Practice Group",
    description:
      "Intermediate Spanish speakers practicing conversation skills twice a week via video calls.",
    members: "3/6 members",
  },
];

const activities = [
  {
    title: 'Joined "Calculus Study Group"',
    desc: "You became a member of the Advanced Calculus study team",
    time: "2 hours ago",
  },
  {
    title: "New message in React Project",
    desc: "Sarah sent a message about the upcoming deadline",
    time: "5 hours ago",
  },
  {
    title: "Completed task in ML Research",
    desc: "Finished data preprocessing for the neural network model",
    time: "Yesterday",
  },
  {
    title: "New team member joined",
    desc: "Michael joined your Spanish Practice Group team",
    time: "2 days ago",
  },
];

function Panel({ title, rightText, onRightClick, rightDisabled = false, children }) {
  return (
    <div className="rounded-[26px] border border-[#d8d2a0] bg-[#0f6f95]/95 p-4 shadow-[0_8px_30px_rgba(0,0,0,0.18)] backdrop-blur-sm sm:p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-[#d8d2a0] pb-3">
        <h2 className="text-[20px] font-semibold text-white md:text-[22px]">
          {title}
        </h2>
        {rightText && (
          <button
            type="button"
            onClick={onRightClick}
            disabled={rightDisabled}
            className="rounded-xl border border-[#d8d2a0] px-4 py-2 text-sm font-medium text-[#d8d2a0] transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {rightText}
          </button>
        )}
      </div>
      {children}
    </div>
  );
}

function Tag({ children, filled = true }) {
  return (
    <span
      className={`inline-flex rounded-full px-4 py-2 text-sm ${
        filled
          ? "bg-[#0fb9a8] text-white"
          : "border border-[#d8d2a0] text-white"
      }`}
    >
      {children}
    </span>
  );
}

function SmallCard({ children }) {
  return (
    <div className="rounded-2xl bg-[#0aa6a0]/60 p-4 text-white">{children}</div>
  );
}

function TeamMiniCard({ team }) {
  return (
    <div className="rounded-[22px] border border-[#d8d2a0] bg-[#0f6f95] p-4 text-white">
      <div className="mb-4 flex items-center justify-between gap-2">
        <span className="rounded-full bg-[#0aa6a0]/60 px-3 py-1 text-xs">
          {team.category}
        </span>
        <span className="rounded-full bg-[#d8d2a0]/20 px-3 py-1 text-xs text-[#d8d2a0]">
          {team.status}
        </span>
      </div>

      <h3 className="text-[16px] font-semibold leading-snug md:text-[18px]">
        {team.title}
      </h3>

      <p className="mt-3 text-sm leading-6 text-white/75">{team.description}</p>

      <div className="mt-5 border-t border-white/20 pt-3 text-sm text-white/70">
        👥 {team.members}
      </div>
    </div>
  );
}

function InfoItem({ label, children }) {
  return (
    <div>
      <div className="text-sm text-white/60">{label}</div>
      <div className="mt-2 break-words text-lg font-medium sm:text-[24px]">
        {children}
      </div>
    </div>
  );
}

function ProfileInput({ label, ...props }) {
  return (
    <label className="block">
      <span className="text-sm text-white/70">{label}</span>
      <input
        {...props}
        className="mt-2 h-[54px] w-full rounded-[14px] border-2 border-[#d8d2a0] bg-white/10 px-4 text-lg font-medium text-white outline-none transition placeholder:text-white/40 focus:border-[#12cdb4] sm:text-[20px]"
      />
    </label>
  );
}

export default function Profile() {
  const { user: profile, setUser, isChecking, logout } = useAuth();
  const navigate = useNavigate();
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    full_name: "",
    username: "",
  });
  const [profileError, setProfileError] = useState("");
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const openProfileEditor = () => {
    setProfileForm({
      full_name: profile?.full_name || "",
      username: profile?.username || "",
    });
    setProfileError("");
    setIsEditingProfile(true);
  };

  const closeProfileEditor = () => {
    setProfileError("");
    setIsEditingProfile(false);
  };

  const handleProfileFormChange = (event) => {
    const { name, value } = event.target;
    setProfileForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleProfileSave = async (event) => {
    event.preventDefault();

    const username = profileForm.username.trim();
    const fullName = profileForm.full_name.trim();

    if (!username) {
      setProfileError("Username is required.");
      return;
    }

    setIsSavingProfile(true);
    setProfileError("");

    try {
      const updatedProfile = await updateProfile({
        username,
        full_name: fullName || null,
      });
      setUser(updatedProfile);
      setIsEditingProfile(false);
    } catch (error) {
      setProfileError(error.message);
    } finally {
      setIsSavingProfile(false);
    }
  };

  const getInitials = () => {
    if (!profile?.full_name) {
      return profile?.username?.slice(0, 2).toUpperCase() || "U";
    }

    const parts = profile.full_name.split(" ").filter(Boolean);
    return parts.slice(0, 2).map((p) => p[0].toUpperCase()).join("");
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString();
  };

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#18a999] text-white text-2xl">
        Loading profile...
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#18a999] text-white text-2xl">
        Failed to load profile
      </div>
    );
  }

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

        <main className="mx-auto max-w-[1450px] px-4 pb-10 pt-4 sm:px-6 md:px-8 xl:px-10">
          <div className="grid gap-6 xl:grid-cols-4">
            <aside className="space-y-6 xl:col-span-1">
              <div className="rounded-[28px] border border-[#d8d2a0] bg-[#0f6f95]/95 p-4 text-white shadow-[0_8px_30px_rgba(0,0,0,0.18)] sm:p-6">
                <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-full border-4 border-[#f5efbf] bg-[#1752d2] text-5xl font-bold">
                  {getInitials()}
                </div>

                <h2 className="mt-4 text-center text-[22px] font-semibold">
                  {profile.full_name || profile.username}
                </h2>
                <p className="mt-1 text-center text-sm text-white/70">
                  {profile.role}
                </p>

                <div className="my-5 border-t border-[#d8d2a0]/70" />

                <div className="grid grid-cols-3 gap-2 text-center sm:gap-3">
                  <div>
                    <div className="text-2xl font-bold text-[#f5efbf] sm:text-4xl">12</div>
                    <div className="mt-1 text-xs text-white/70">Teams</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-[#f5efbf] sm:text-4xl">47</div>
                    <div className="mt-1 text-xs text-white/70">Tasks</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-[#f5efbf] sm:text-4xl">
                      {profile.is_active ? "Yes" : "No"}
                    </div>
                    <div className="mt-1 text-xs text-white/70">Active</div>
                  </div>
                </div>

                <div className="my-5 border-t border-[#d8d2a0]/70" />

                <button className="w-full rounded-xl bg-[#10c7b0] px-4 py-3 font-semibold text-white transition hover:bg-[#0eb39e]">
                  + Create New Team
                </button>

                <button
                  onClick={handleLogout}
                  className="mt-3 w-full rounded-xl bg-[#0d6789] px-4 py-3 font-semibold text-white transition hover:bg-[#0b5c7a]"
                >
                  Log out
                </button>

                <div className="mt-8">
                  <h3 className="mb-4 text-[22px] font-semibold">Achievements</h3>
                  <div className="space-y-3">
                    {achievements.map((item) => (
                      <div
                        key={item}
                        className="inline-flex rounded-full bg-[#0aa6a0]/60 px-4 py-2 text-sm"
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-8">
                  <h3 className="mb-4 text-[22px] font-semibold">
                    📅 Upcoming Sessions
                  </h3>
                  <div className="space-y-4">
                    {upcomingSessions.map((session) => (
                      <SmallCard key={session.title + session.time}>
                        <div className="text-sm text-[#f5efbf]">{session.time}</div>
                        <div className="mt-1 font-medium">{session.title}</div>
                        <div className="text-sm text-white/70">
                          {session.subtitle}
                        </div>
                      </SmallCard>
                    ))}
                  </div>
                </div>

                <div className="mt-8">
                  <h3 className="mb-4 text-[22px] font-semibold">⚡ Quick Actions</h3>
                  <div className="space-y-3">
                    {quickActions.map((action) => (
                      <button
                        key={action}
                        className="w-full rounded-xl bg-[#12cdb4] px-4 py-3 text-left font-medium transition hover:bg-[#10b8a2]"
                      >
                        {action}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-8">
                  <h3 className="mb-4 text-[22px] font-semibold">
                    👥 Recommended For You
                  </h3>
                  <div className="space-y-4">
                    {recommended.map((item) => (
                      <SmallCard key={item.title}>
                        <div className="font-medium">{item.title}</div>
                        <div className="text-sm text-white/70">{item.subtitle}</div>
                      </SmallCard>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-center">
                <img
                  src="/leaf-character.svg"
                  alt="leaf character"
                  className="w-[220px] md:w-[260px]"
                />
              </div>
            </aside>

            <section className="space-y-6 xl:col-span-3">
              <Panel
                title="Personal Information"
                rightText={isEditingProfile ? "Cancel" : "Edit"}
                onRightClick={
                  isEditingProfile ? closeProfileEditor : openProfileEditor
                }
                rightDisabled={isSavingProfile}
              >
                {isEditingProfile ? (
                  <form onSubmit={handleProfileSave}>
                    <div className="grid gap-6 md:grid-cols-2">
                      <ProfileInput
                        label="Full Name"
                        name="full_name"
                        value={profileForm.full_name}
                        onChange={handleProfileFormChange}
                        placeholder="Your full name"
                        maxLength={100}
                      />

                      <ProfileInput
                        label="Username"
                        name="username"
                        value={profileForm.username}
                        onChange={handleProfileFormChange}
                        placeholder="Username"
                        minLength={3}
                        maxLength={50}
                        required
                      />
                    </div>

                    <div className="mt-8 grid gap-8 md:grid-cols-2">
                      <div className="space-y-8">
                        <InfoItem label="Role">{profile.role}</InfoItem>
                        <InfoItem label="Email">{profile.email}</InfoItem>
                      </div>

                      <div className="space-y-8">
                        <InfoItem label="Joined Orta">
                          {formatDate(profile.created_at)}
                        </InfoItem>
                        <InfoItem label="Account Status">
                          {profile.is_active ? "Active" : "Inactive"}
                        </InfoItem>
                      </div>
                    </div>

                    {profileError && (
                      <p className="mt-5 rounded-xl border border-red-200/50 bg-red-500/20 px-4 py-3 text-sm text-red-100">
                        {profileError}
                      </p>
                    )}

                    <div className="mt-6 flex flex-wrap gap-3">
                      <button
                        type="submit"
                        disabled={isSavingProfile}
                        className="rounded-xl bg-[#12cdb4] px-6 py-3 font-semibold text-white transition hover:bg-[#10b8a2] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {isSavingProfile ? "Saving..." : "Save Changes"}
                      </button>

                      <button
                        type="button"
                        onClick={closeProfileEditor}
                        disabled={isSavingProfile}
                        className="rounded-xl border border-[#d8d2a0] px-6 py-3 font-semibold text-[#d8d2a0] transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <>
                    <div className="grid gap-8 md:grid-cols-2">
                      <div className="space-y-8">
                        <InfoItem label="Full Name">
                          {profile.full_name || "-"}
                        </InfoItem>

                        <InfoItem label="Username">{profile.username}</InfoItem>

                        <InfoItem label="Role">{profile.role}</InfoItem>
                      </div>

                      <div className="space-y-8">
                        <InfoItem label="Email">{profile.email}</InfoItem>

                        <InfoItem label="Joined Orta">
                          {formatDate(profile.created_at)}
                        </InfoItem>

                        <InfoItem label="Account Status">
                          {profile.is_active ? "Active" : "Inactive"}
                        </InfoItem>
                      </div>
                    </div>

                    <div className="mt-10">
                      <div className="text-sm text-white/60">Bio</div>
                      <p className="mt-3 max-w-5xl text-lg leading-8 text-white/90">
                        Welcome to your Orta profile page.
                      </p>
                    </div>
                  </>
                )}
              </Panel>

              <Panel title="Skills & Interests">
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    Technical Skills
                  </h3>
                  <div className="mt-4 flex flex-wrap gap-3">
                    {technicalSkills.map((skill) => (
                      <Tag key={skill}>{skill}</Tag>
                    ))}
                  </div>
                </div>

                <div className="mt-8">
                  <h3 className="text-lg font-semibold text-white">Interests</h3>
                  <div className="mt-4 flex flex-wrap gap-3">
                    {interests.map((interest) => (
                      <Tag key={interest} filled={false}>
                        {interest}
                      </Tag>
                    ))}
                  </div>
                </div>
              </Panel>

              <Panel title="My Teams" rightText="View All">
                <div className="grid gap-5 lg:grid-cols-2">
                  <TeamMiniCard team={teams[0]} />
                  <TeamMiniCard team={teams[1]} />
                  <TeamMiniCard team={teams[2]} />

                  <div className="flex items-end justify-center rounded-[22px] border border-transparent p-4">
                    <img
                      src="/bottom-character.png"
                      alt="character"
                      className="w-[220px]"
                    />
                  </div>
                </div>
              </Panel>

              <Panel title="Recent Activity" rightText="See All">
                <div className="space-y-6">
                  {activities.map((activity) => (
                    <div
                      key={activity.title}
                      className="border-b border-white/15 pb-5 last:border-b-0"
                    >
                      <div className="flex gap-3 sm:gap-4">
                        <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#11c9b1] text-lg">
                          ✨
                        </div>
                        <div className="min-w-0">
                          <h3 className="break-words text-lg font-semibold sm:text-[20px]">
                            {activity.title}
                          </h3>
                          <p className="mt-1 text-white/70">{activity.desc}</p>
                          <p className="mt-2 text-sm text-[#6ce9d7]">
                            {activity.time}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Panel>
            </section>
          </div>
        </main>
      </div>

      <Footer />
    </>
  );
}
