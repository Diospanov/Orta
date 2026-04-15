import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();

  const linkClass = (path) =>
    `transition ${
      location.pathname === path
        ? "text-[#10c7b0]"
        : "text-white hover:text-[#10c7b0]"
    }`;

  const getInitials = () => {
    if (!user) return "U";

    if (user.full_name) {
      const parts = user.full_name.split(" ").filter(Boolean);
      return parts
        .slice(0, 2)
        .map((part) => part[0].toUpperCase())
        .join("");
    }

    return user.username?.slice(0, 2).toUpperCase() || "U";
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="flex items-center justify-between px-8 py-6">
      <Link
        to="/"
        className="text-4xl font-extrabold tracking-wider text-white"
      >
        ORTA
      </Link>

      <nav className="flex items-center gap-10 text-sm font-medium tracking-wide">
        <Link to="/browse-teams" className={linkClass("/browse-teams")}>
          BROWSE TEAMS
        </Link>

        {isAuthenticated && (
          <>
            <Link to="/my-teams" className={linkClass("/my-teams")}>
              MY TEAMS
            </Link>

            <Link to="/create-team" className={linkClass("/create-team")}>
              CREATE TEAM
            </Link>
          </>
        )}
      </nav>

      <div className="flex items-center gap-4">
        {isAuthenticated && user ? (
          <>
            <Link
              to="/profile"
              className="flex items-center gap-3 text-sm font-medium text-white"
            >
              {user.full_name || user.username}

              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1e4fff] font-semibold transition hover:scale-110">
                {getInitials()}
              </div>
            </Link>

            <button
              onClick={handleLogout}
              className="rounded-xl bg-[#10c7b0] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#0eb39e]"
            >
              Logout
            </button>
          </>
        ) : (
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="rounded-xl bg-[#10c7b0] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#0eb39e]"
            >
              Login
            </Link>

            <Link
              to="/register"
              className="rounded-xl border border-white px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10"
            >
              Register
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}