from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.core.security import decode_access_token
from app.db.database import get_db
from app.db.models import User


bearer_scheme = HTTPBearer(auto_error=False)


from sqlalchemy import select


DEFAULT_GUEST_ID = "guest-user-00000000000000000000"


def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> User:
    if credentials is not None:
        subject = decode_access_token(credentials.credentials)
        if subject is not None:
            user = db.get(User, subject)
            if user is not None:
                if user.email.endswith(".local"):
                    user.email = user.email.replace(".local", ".com")
                    db.commit()
                    db.refresh(user)
                return user

    # Auto-get or create persistent guest user for direct unauthenticated access
    guest = db.get(User, DEFAULT_GUEST_ID)
    if guest is None:
        guest = db.scalar(select(User).where(User.email == "guest@lexiguide.com"))
    if guest is None:
        guest = db.scalar(select(User).where(User.email == "guest@lexiguide.local"))
    if guest is not None and guest.email.endswith(".local"):
        guest.email = "guest@lexiguide.com"
        db.commit()
        db.refresh(guest)
    if guest is None:
        from app.core.security import hash_password
        guest = User(
            id=DEFAULT_GUEST_ID,
            email="guest@lexiguide.com",
            full_name="Guest User",
            password_hash=hash_password("guest-mode-password"),
        )
        db.add(guest)
        db.commit()
        db.refresh(guest)
    return guest
