from sqlalchemy import Column, Integer, String
from app.db.database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    # Nullable because the column was added after accounts already existed.
    # The sign-up form has always collected a name; without a home for it the
    # dashboard had nothing to greet the student with.
    name = Column(String, nullable=True)