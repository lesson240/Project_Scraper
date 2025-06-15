# DB 연결

1. 올리브영 수집동기화
1) InputGoodsManagementTableModel에서 promotion_period를 datetime 형식으로 변경하니, 여러 파일에서 매칭 실패함
MongoDB compass에서 직접 datetime 형식으로 수작업을 하고, 
조회 > 저장 > 수집동기화 를 하도록 작업이 필요함. 

2) router.post 스크립트 작성, return 올리브영 관여 db 객체 생성
3) 클라이언트 js 작성_서버로 호출하여 테이블에 input 처리

2. 쿠팡 wing, 소켓통신 개발

3. 쿠팡-올리브영 프로그램 프로토타입 1달간 운영

4. 행사기간을 테이블에 표기하기 

# 기타

1. 업데이트, 건너뛰기 기능

2. 상품수집페이지에서 오특 추가

3. 동적 scraper 병렬 처리. 