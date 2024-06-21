# 베이스 이미지 설정 (예: Python 3.12.2-slim)
FROM python:3.12.2-slim

# 시스템 종속성 설치
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libbluetooth-dev \
    libbz2-dev \
    libc6-dev \
    libdb-dev \
    libexpat1-dev \
    libffi-dev \
    libgdbm-dev \
    liblzma-dev \
    libncursesw5-dev \
    libreadline-dev \
    libsqlite3-dev \
    libssl-dev \
    make \
    tk-dev \
    uuid-dev \
    wget \
    xz-utils \
    zlib1g-dev \
    && rm -rf /var/lib/apt/lists/*

# 작업 디렉터리 설정
WORKDIR /app

# 환경 파일 복사 및 의존성 설치
COPY .env ./
COPY secrets.json ./
COPY server.py ./
COPY .gitignore ./

# 필요한 파일 복사 및 의존성 설치
COPY requirements.txt .
RUN pip install --upgrade pip && pip install -r requirements.txt

# 애플리케이션 코드 복사
COPY . .

# 작업 디렉터리 설정
WORKDIR /app

# 환경 변수 설정 (선택 사항)
ENV PYTHONUNBUFFERED=1

# 포트 노출
EXPOSE 8000

# 애플리케이션 실행 명령어
ENTRYPOINT ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--loop", "asyncio"]
