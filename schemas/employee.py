from pydantic import BaseModel
from typing import Optional

class EmployeeBase(BaseModel):
    name: str
    department_id: int
    position_id: int
    base_salary: float
    account: str
    photo_url: Optional[str] = None

class EmployeeCreate(EmployeeBase):
    password: str  # Thêm trường password khi tạo nhân viên

class EmployeeUpdate(EmployeeBase):
    status: Optional[str] = None
    photo_url: Optional[str] = None

class EmployeeOut(EmployeeBase):
    id: int
    code: str
    status: str
    joined_at: str

    class Config:
        orm_mode = True
