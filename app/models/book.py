from odmantic import Model


class BookModel(Model):
    keyword: str
    publisher: str
    price: int
    image: str

    model_config = {
        "collection": "test"
    }

    # TypeError: field Config is defined without type annotation