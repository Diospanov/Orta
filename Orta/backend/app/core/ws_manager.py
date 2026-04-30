from collections import defaultdict
from fastapi import WebSocket


class TeamChatManager:
    def __init__(self):
        # team_id -> user_id -> list[WebSocket]
        self.active_connections: dict[int, dict[int, list[WebSocket]]] = defaultdict(
            lambda: defaultdict(list)
        )

    async def connect(self, team_id: int, user_id: int, websocket: WebSocket):
        await websocket.accept()
        self.active_connections[team_id][user_id].append(websocket)

    def disconnect(self, team_id: int, user_id: int, websocket: WebSocket):
        team_connections = self.active_connections.get(team_id)
        if not team_connections:
            return

        user_connections = team_connections.get(user_id)
        if not user_connections:
            return

        if websocket in user_connections:
            user_connections.remove(websocket)

        if not user_connections:
            del team_connections[user_id]

        if not team_connections:
            del self.active_connections[team_id]

    async def broadcast(self, team_id: int, payload: dict):
        broken_connections: list[tuple[int, WebSocket]] = []

        for user_id, connections in list(self.active_connections.get(team_id, {}).items()):
            for connection in list(connections):
                try:
                    await connection.send_json(payload)
                except Exception:
                    broken_connections.append((user_id, connection))

        for user_id, connection in broken_connections:
            self.disconnect(team_id, user_id, connection)

    async def send_to_user(self, team_id: int, user_id: int, payload: dict) -> bool:
        connections = list(self.active_connections.get(team_id, {}).get(user_id, []))

        if not connections:
            return False

        broken_connections = []

        for connection in connections:
            try:
                await connection.send_json(payload)
            except Exception:
                broken_connections.append(connection)

        for connection in broken_connections:
            self.disconnect(team_id, user_id, connection)

        return True


team_chat_manager = TeamChatManager()