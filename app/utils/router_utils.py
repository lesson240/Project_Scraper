from fastapi import FastAPI


def get_versioned_prefix(version: str) -> str:
    """API 버전 prefix 생성 함수"""
    return f"/{version}"


def include_routers(app: FastAPI, routers: list, prefix: str):
    """라우터를 FastAPI 앱에 포함시키는 함수"""
    for router, router_tags in routers:
        app.include_router(router, prefix=prefix, tags=router_tags)
