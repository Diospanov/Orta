import { BrowserRouter, Routes, Route } from "react-router-dom";
import Main from "./pages/Main";
import Login from "./pages/Login";
import Register from "./pages/Register";
import BrowseTeams from "./pages/BrowseTeams";
import MyTeams from "./pages/MyTeams";
import CreateTeam from "./pages/CreateTeam";
import Profile from "./pages/Profile";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Main />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/browse-teams" element={<BrowseTeams />} />
        <Route path="/my-teams" element={<MyTeams />} />
        <Route path="/create-team" element={<CreateTeam />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </BrowserRouter>
  );
}