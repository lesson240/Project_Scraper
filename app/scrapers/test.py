# 프로젝트의 루트 디렉토리를 구하기
import sys
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent.parent
sys.path.append(str(BASE_DIR))


# 프로젝트 Module 불러오기
from app.services.mongodb import mongodb_service
from app.models.table_model import InputGoodsManagementTableModel


winner_prices = {
    "winner_price": "12990",
    "winner_delivery": "무료배송",
    "winner_deliveryday": 2,
}


# MongoDB 업데이트
async def aa():
    for code, price_info in winner_prices.items():
        price_info.pop("id", None)
        price_info.pop("_id", None)

        update_data = {
            "winner_price": price_info.get("total_price"),
            "winner_delivery": price_info.get("delivery"),
            "winner_deliveryday": price_info.get("deliveryday"),
        }
        print(update_data)
        await mongodb_service.engine.update_one(
            InputGoodsManagementTableModel,
            {"origin_goods_code": code},
            {"$set": update_data},
            upsert=True,
        )

    return {"message": "Winner price synchronized", "data": winner_prices}


if __name__ == "__main__":
    bb = aa()
    print(bb)
