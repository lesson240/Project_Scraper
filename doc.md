# DB 연결

1. Development of coupang goods detail module using bs4, selenium library
1) 다른 판매자 보기가 없다면 bs4처리, 있다면 selenium 함수 필요
2) required value: 쿠팡상품번호, 위너가(할인가), 배송정보(무료배송/배송소요일_함수계산)
3) coupang model development_collection name is "CoupangOriginGoodsDetail"
4) Save to mongoDB scrapmarket
