from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.models.user import User
from app.schemas.user import UserCreateRequest, Token
from app.core.auth import verify_password, get_password_hash, create_access_token

router = APIRouter(prefix="/auth", tags=["Authentication"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/register", status_code=status.HTTP_201_CREATED)
def register(user: UserCreateRequest, db: Session = Depends(get_db)):
    # Check if user exists
    db_user = db.query(User).filter(User.email == user.username).first() # Using username as email/unique id
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    
    hashed_pw = get_password_hash(user.password)
    new_user = User(
        name=user.name,
        email=user.username, # Mapping username to email field for simplicity as per current DB model
        password_hash=hashed_pw,
        role=user.role
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return {"message": "User created successfully"}

@router.post("/login", response_model=Token)
def login(user: UserCreateRequest, db: Session = Depends(get_db)):
    # Reusing UserCreateRequest just to get username/password. Ideally use a separate schema.
    db_user = db.query(User).filter(User.email == user.username).first()
    if not db_user or not verify_password(user.password, db_user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = create_access_token(data={"sub": db_user.email, "role": db_user.role})
    return {
        "access_token": access_token, 
        "token_type": "bearer",
        "username": db_user.email,
        "role": db_user.role,
        "name": db_user.name
    }
