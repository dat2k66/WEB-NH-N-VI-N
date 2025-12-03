from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

# Tạo engine MySQL kết nối với database 'employee_management'
engine = create_engine(settings.DATABASE_URL, pool_pre_ping=True)

# Cấu hình session
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
