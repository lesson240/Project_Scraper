from fastapi import APIRouter

router = APIRouter()


@router.get("/users/")
async def get_users():
    return {"message": "Get all users"}


@router.get("/users/{user_id}")
async def get_user(user_id: int):
    return {"message": f"Get user with ID {user_id}"}


@router.post("/users/")
async def create_user():
    return {"message": "Create a new user"}


@router.put("/users/{user_id}")
async def update_user(user_id: int):
    return {"message": f"Update user with ID {user_id}"}


@router.delete("/users/{user_id}")
async def delete_user(user_id: int):
    return {"message": f"Delete user with ID {user_id}"}
