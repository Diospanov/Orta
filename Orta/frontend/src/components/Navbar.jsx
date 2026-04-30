import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();

  const linkClass = (path) =>
    `text-[15px] font-normal tracking-[0.22em] uppercase transition ${
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
    <header className="flex flex-wrap items-center justify-between gap-x-4 gap-y-4 px-4 py-5 sm:px-6 lg:px-8">
      <Link to="/" className="shrink-0">
        <img src="/ORTA.svg" alt="logo" className="h-10 sm:h-12" />
      </Link>

      <nav className="order-3 flex w-full items-center justify-center gap-4 overflow-x-auto whitespace-nowrap pb-1 sm:order-none sm:w-auto sm:gap-6 sm:pb-0 lg:gap-10">
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

      <div className="flex items-center gap-2 sm:gap-4">
        {isAuthenticated && user ? (
          <>
            <Link
              to="/profile"
              className="flex min-w-0 items-center gap-2 text-sm font-medium text-white sm:gap-3 sm:text-base"
            >
              <span className="hidden max-w-36 truncate sm:inline lg:max-w-56">
                {user.full_name || user.username}
              </span>

              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#1e4fff] text-sm font-semibold transition hover:scale-110 sm:h-12 sm:w-12 sm:text-base">
                {getInitials()}
              </div>
            </Link>

            <button
              onClick={handleLogout}
              className="rounded-xl bg-[#10c7b0] px-3 py-2.5 text-sm font-medium text-white transition hover:bg-[#0eb39e] sm:px-4 sm:text-base"
            >
              Logout
            </button>
          </>
        ) : (
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="rounded-xl bg-[#10c7b0] px-3 py-2 text-sm font-medium text-white transition hover:bg-[#0eb39e] sm:px-4"
            >
              Login
            </Link>

            <Link
              to="/register"
              className="rounded-xl border border-white px-3 py-2 text-sm font-medium text-white transition hover:bg-white/10 sm:px-4"
            >
              Register
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
