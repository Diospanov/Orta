const API_URL = import.meta.env.VITE_API_URL;

export async function loginUser(email, password) {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || "Login failed");
  }

  return data;
}

export async function getProfile() {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_URL}/users/me`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || "Failed to load profile");
  }

  return data;
}

export async function registerUser(userData) {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || "Registration failed");
  }

  return data;
}


export async function getAllTeams(search = "") {
  const url = search
    ? `${API_URL}/teams?search=${encodeURIComponent(search)}`
    : `${API_URL}/teams`;

  const response = await fetch(url);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || "Failed to load teams");
  }

  return data;
}

export async function createTeam(teamData) {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_URL}/teams/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(teamData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || "Failed to create team");
  }

  return data;
}

export async function getTeamById(teamId) {
  const response = await fetch(`${API_URL}/teams/${teamId}`);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || "Failed to load team");
  }

  return data;
}

export async function joinTeam(teamId) {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_URL}/teams/${teamId}/join`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || "Failed to join team");
  }

  return data;
}

export async function leaveTeam(teamId) {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_URL}/teams/${teamId}/leave`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || "Failed to leave team");
  }

  return data;
}

export async function getTeamMembers(teamId) {
  const response = await fetch(`${API_URL}/teams/${teamId}/members`);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || "Failed to load team members");
  }

  return data;
}

export async function getMyTeams() {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_URL}/teams/me`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || "Failed to load my teams");
  }

  return data;
}