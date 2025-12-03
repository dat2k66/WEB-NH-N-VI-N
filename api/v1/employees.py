from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.employee import Employee
from app.schemas.employee import EmployeeCreate, EmployeeOut
from app.services.employee_code import generate_employee_code

router = APIRouter()

@router.post("/", response_model=EmployeeOut)
def create_employee(employee: EmployeeCreate, db: Session = Depends(get_db)):
    # Sinh mã nhân viên
    employee_code, join_order = generate_employee_code(
        db, employee.department_id, employee.position_id
    )

    # Tạo nhân viên mới với mã nhân viên đã sinh
    db_employee = Employee(
        code=employee_code,
        name=employee.name,
        department_id=employee.department_id,
        position_id=employee.position_id,
        base_salary=employee.base_salary,
        status=employee.status,
        join_order=join_order,
        account=employee.account,
        password_hash=employee.password,  # Lưu hash mật khẩu
    )

    db.add(db_employee)
    db.commit()
    db.refresh(db_employee)
    return db_employee
