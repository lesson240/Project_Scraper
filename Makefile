# .env 파일 로드
include .env
export $(shell sed 's/=.*//' .env)

# Docker 이미지 이름
APP_IMAGE := project_scraper-app
WORKER_IMAGE := project_scraper-worker
LAMBDA_IMAGE := project_scraper-lambda

# 태그 및 레포지토리 이름
LAMDA_REPO := $(AWS_ACCOUNT_ID).dkr.ecr.$(AWS_REGION).amazonaws.com/$(LAMBDA_REPO_NAME)
# WORKER_REPO := $(AWS_ACCOUNT_ID).dkr.ecr.$(AWS_REGION).amazonaws.com/$(WORKER_REPO_NAME)

.PHONY: build_app tag_app push_app build_worker tag_worker push_worker clean

# 불필요한 Docker 이미지 삭제
clean_images:
	docker image prune -f

# 애플리케이션 컨테이너 빌드
build_app: clean_images
	docker build -t $(APP_IMAGE) --cache-from $(LAMDA_REPO):latest -f Dockerfile.app .

# 애플리케이션 이미지 태그
tag_app:
	docker tag $(APP_IMAGE):latest $(LAMDA_REPO):latest

# 애플리케이션 이미지 푸시
push_app:
	docker push $(LAMDA_REPO):latest

# 워커(로컬) 컨테이너 빌드
build_worker: clean_images
	docker build -t $(WORKER_IMAGE) --cache-from $(WORKER_REPO):latest -f Dockerfile .

# 워커(로컬) 이미지 태그
# tag_worker:
# 	docker tag $(WORKER_IMAGE):latest $(WORKER_REPO):latest

# 워커(로컬) 이미지 푸시
# push_worker:
# 	docker push $(WORKER_REPO):latest

# AWS ECR 로그인
login:
	aws ecr get-login-password --region $(AWS_REGION) | docker login --username AWS --password-stdin $(ECR_URL)

# Lambda 컨테이너 빌드
build_lambda: clean_images
	docker build -t $(LAMBDA_IMAGE) --cache-from $(LAMDA_REPO):latest -f Dockerfile.lambda .

# Lambda 이미지 태그
tag_lambda:
	docker tag $(LAMBDA_IMAGE):latest $(LAMDA_REPO):latest

# Lambda 이미지 푸시
push_lambda:
	docker push $(LAMDA_REPO):latest

# 모든 애플리케이션 작업 수행
all_app: build_app tag_app push_app

# 모든 워커 작업 수행 (이미지 태그 및 푸시 제외)
all_worker: build_worker

# 모든 Lambda 작업 수행
all_lambda: login build_lambda tag_lambda push_lambda

# 전체 빌드 및 푸시
all: login all_app all_worker all_lambda

# 불필요한 Docker 이미지 삭제
clean:
	docker image prune -f

# 모든 Docker 이미지 삭제
all_clean:
	docker system prune -a
