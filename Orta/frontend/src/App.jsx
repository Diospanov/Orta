import { BrowserRouter, Routes, Route } from "react-router-dom";
import Main from "./pages/Main";
import Login from "./pages/Login";
import Register from "./pages/Register";
import BrowseTeams from "./pages/BrowseTeams";
import MyTeams from "./pages/MyTeams";
import CreateTeam from "./pages/CreateTeam";
import Profile from "./pages/Profile";
import TeamWorkspace from "./pages/TeamWorkspace";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Main />} />
        <Route path="/browse-teams" element={<BrowseTeams />} />

        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />

        <Route
          path="/register"
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          }
        />

        <Route
          path="/my-teams"
          element={
            <ProtectedRoute>
              <MyTeams />
            </ProtectedRoute>
          }
        />

        <Route
          path="/create-team"
          element={
            <ProtectedRoute>
              <CreateTeam />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        <Route path="/teams/:teamId" element={<ProtectedRoute><TeamWorkspace /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  );
}