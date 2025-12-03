from pydantic import BaseModel

class DepartmentBase(BaseModel):
    code: str
    name: str
    founded_year: int | None
    status: str = 'active'

class DepartmentCreate(DepartmentBase):
    pass

class DepartmentUpdate(DepartmentBase):
    pass

class DepartmentOut(DepartmentBase):
    id: int

    class Config:
        orm_mode = True
