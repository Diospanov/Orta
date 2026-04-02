import enum

class UserRole(str, enum.Enum):
    USER = "user"
    ADMIN = "admin"
    
class TeamRole(str, enum.Enum):
    OWNER = "owner"
    ADMIN = "admin"
    MEMBER = "member"

class TeamStatus(str, enum.Enum):
    ACTIVE = "active"
    CLOSED = "closed"

class JoinRequestStatus(str, enum.Enum):
    PENDING = "pending"
    ACCEPTED = "accepted"
    REJECTED = "rejected"