const API_URL = import.meta.env.VITE_API_URL;
console.log("VITE_API_URL =", import.meta.env.VITE_API_URL);


function getFastAPIErrorMessage(errorData) {
  if (!errorData) return "Something went wrong";

  if (typeof errorData === "string") {
    return errorData;
  }

  const formatError = (err) => {
    if (typeof err === "string") return err;

    const field = Array.isArray(err.loc)
      ? err.loc[err.loc.length - 1]
      : null;

    const message = err.msg || err.message || "Invalid value";

    return field ? `${field}: ${message}` : message;
  };

  // FastAPI validation error
  if (Array.isArray(errorData.detail)) {
    return errorData.detail.map(formatError).join("\n");
  }

  // Normal FastAPI HTTPException
  if (typeof errorData.detail === "string") {
    return errorData.detail;
  }

  // Sometimes detail is one object
  if (typeof errorData.detail === "object") {
    return formatError(errorData.detail);
  }

  if (typeof errorData.message === "string") {
    return errorData.message;
  }

  return "Something went wrong";
}

export async function loginUser(email, password) {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: email.trim(),
      password,
    }),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(getFastAPIErrorMessage(data) || "Login failed");
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

export async function updateProfile(profileData) {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_URL}/users/me`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(profileData),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(getFastAPIErrorMessage(data) || "Failed to update profile");
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

  let data = null;

  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    throw new Error(getFastAPIErrorMessage(data));
  }

  return data;
}


export async function getAllTeams(search = "", page = 1, size = 9) {
  const token = localStorage.getItem("token");

  const params = new URLSearchParams();

  if (search.trim()) {
    params.append("search", search.trim());
  }

  params.append("page", page);
  params.append("size", size);

  const response = await fetch(`${API_URL}/teams?${params.toString()}`, {
    headers: token
      ? {
          Authorization: `Bearer ${token}`,
        }
      : {},
  });

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


export async function deleteTeam(teamId) {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_BASE_URL}/teams/${teamId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.detail || "Failed to delete team");
  }

  return true;
}


export async function getTeamById(teamId) {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_URL}/teams/${teamId}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || "Failed to fetch team");
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


export async function getTeamWorkspace(teamId) {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_URL}/teams/${teamId}/workspace`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || "Failed to load team workspace");
  }

  return data;
}

export async function getTeamMembers(teamId) {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_URL}/teams/${teamId}/members`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || "Failed to load team members");
  }

  return data;
}

export async function getTeamMessages(teamId) {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_URL}/teams/${teamId}/messages`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || "Failed to fetch team messages");
  }

  return data;
}



function getToken() {
  return localStorage.getItem("token");
}

export async function requestToJoinTeam(teamId) {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_URL}/teams/${teamId}/join`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || "Failed to send join request");
  }

  return data;
}

export async function getTeamJoinRequests(teamId) {
  const response = await fetch(`${API_URL}/join-requests/team/${teamId}`, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || "Failed to load join requests");
  }

  return data;
}

export async function acceptJoinRequest(requestId) {
  const response = await fetch(`${API_URL}/join-requests/${requestId}/accept`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || "Failed to accept request");
  }

  return data;
}

export async function rejectJoinRequest(requestId) {
  const response = await fetch(`${API_URL}/join-requests/${requestId}/reject`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || "Failed to reject request");
  }

  return data;
}

export async function getTeamFiles(teamId) {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_URL}/teams/${teamId}/files`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || "Failed to load files");
  }

  return data;
}

export async function uploadTeamFile(teamId, file) {
  const token = localStorage.getItem("token");

  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_URL}/teams/${teamId}/files`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || "Failed to upload file");
  }

  return data;
}

export async function deleteTeamFile(teamId, fileId) {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_URL}/teams/${teamId}/files/${fileId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.detail || "Failed to delete file");
  }

  return true;
}


export async function getTeamGoals(teamId) {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_URL}/teams/${teamId}/goals`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || "Failed to load goals");
  }

  return data;
}

export async function createTeamGoal(teamId, goalData) {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_URL}/teams/${teamId}/goals`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(goalData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || "Failed to create goal");
  }

  return data;
}

export async function updateTeamGoal(teamId, goalId, updateData) {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_URL}/teams/${teamId}/goals/${goalId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(updateData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || "Failed to update goal");
  }

  return data;
}

export async function deleteTeamGoal(teamId, goalId) {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_URL}/teams/${teamId}/goals/${goalId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.detail || "Failed to delete goal");
  }

  return true;
}

export async function getTeamSchedule(teamId) {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_URL}/teams/${teamId}/schedule`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || "Failed to load schedule");
  }

  return data;
}

export async function createTeamScheduleEvent(teamId, eventData) {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_URL}/teams/${teamId}/schedule`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(eventData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || "Failed to create schedule event");
  }

  return data;
}

export async function updateTeamScheduleEvent(teamId, eventId, updateData) {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_URL}/teams/${teamId}/schedule/${eventId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(updateData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || "Failed to update schedule event");
  }

  return data;
}

export async function deleteTeamScheduleEvent(teamId, eventId) {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_URL}/teams/${teamId}/schedule/${eventId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.detail || "Failed to delete schedule event");
  }

  return true;
}

export async function updateTeam(teamId, teamData) {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_URL}/teams/${teamId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(teamData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || "Failed to update team");
  }

  return data;
}

export async function updateTeamMemberRole(teamId, memberId, role) {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_URL}/teams/${teamId}/members/${memberId}/role`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ role }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || "Failed to update member role");
  }

  return data;
}

export async function removeTeamMember(teamId, memberId) {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_URL}/teams/${teamId}/members/${memberId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.detail || "Failed to remove member");
  }

  return true;
}

export async function transferTeamOwnership(teamId, newOwnerMemberId) {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_URL}/teams/${teamId}/transfer-ownership`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      new_owner_member_id: newOwnerMemberId,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || "Failed to transfer ownership");
  }

  return data;
}
