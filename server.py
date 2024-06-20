import uvicorn

if __name__ == "__main__":
    # FastAPI 서버 실행
    uvicorn.run("app.main:app", host="localhost", port=8000)
