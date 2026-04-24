from collections import defaultdict
from fastapi import WebSocket


class TeamChatManager:
    def __init__(self):
        self.active_connections: dict[int, list[WebSocket]] = defaultdict(list)

    async def connect(self, team_id: int, websocket: WebSocket):
        await websocket.accept()
        self.active_connections[team_id].append(websocket)

    def disconnect(self, team_id: int, websocket: WebSocket):
        if team_id in self.active_connections and websocket in self.active_connections[team_id]:
            self.active_connections[team_id].remove(websocket)

        if team_id in self.active_connections and not self.active_connections[team_id]:
            del self.active_connections[team_id]

    async def broadcast(self, team_id: int, payload: dict):
        broken_connections = []

        for connection in list(self.active_connections.get(team_id, [])):
            try:
                await connection.send_json(payload)
            except Exception:
                broken_connections.append(connection)

        for connection in broken_connections:
            self.disconnect(team_id, connection)


team_chat_manager = TeamChatManager()