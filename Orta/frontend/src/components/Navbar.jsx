import { Link, useLocation } from "react-router-dom";

export default function Navbar() {
  const location = useLocation();

  const linkClass = (path) =>
    `transition ${
      location.pathname === path
        ? "text-[#10c7b0]"
        : "text-white hover:text-[#10c7b0]"
    }`;

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

        <Link to="/my-teams" className={linkClass("/my-teams")}>
          MY TEAMS
        </Link>

        <Link to="/create-team" className={linkClass("/create-team")}>
          CREATE TEAM
        </Link>

      </nav>

      {/* PROFILE */}
      <Link
        to="/profile"
        className="flex items-center gap-3 text-sm font-medium text-white"
      >
        RAKHAT

        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1e4fff] font-semibold transition hover:scale-110">
          RB
        </div>
      </Link>

    </header>
  );
}