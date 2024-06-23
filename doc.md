# DB 연결

1. Development of coupang goods detail module using bs4, selenium library
1) 해결: 다른 판매자 보기가 없다면 bs4처리, 있다면 selenium 함수 필요
2) 완료: scraper_coupang 모듈, required value: 쿠팡상품번호, 위너가(할인가), 배송정보(무료배송/배송소요일_함수계산)
3) 완료: router.post "/save-goods-table" 생성 table에서 mongodb로의 저장까지
4) coupang model development_collection name is "CoupangOriginGoodsDetail"
5) Save to mongoDB scrapmarket
