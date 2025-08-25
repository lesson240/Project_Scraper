# path: run_tests.py
"""
테스트 실행 스크립트
"""
import subprocess
import sys
import os
import platform

def get_python_command():
    """가상환경 또는 시스템 Python 명령어 반환"""
    # 가상환경 확인
    if os.path.exists(".venv"):
        if platform.system() == "Windows":
            return ".venv\\Scripts\\python.exe"
        else:
            return ".venv/bin/python"
    elif os.path.exists("venv"):
        if platform.system() == "Windows":
            return "venv\\Scripts\\python.exe"
        else:
            return "venv/bin/python"
    else:
        return "python"

def run_tests(test_type="all", coverage=False, verbose=False):
    """테스트 실행"""
    
    python_cmd = get_python_command()
    print(f"🐍 Python 실행 경로: {python_cmd}")
    
    # 기본 pytest 명령어
    cmd = [python_cmd, "-m", "pytest"]
    
    if test_type == "unit":
        # 단위 테스트만 실행
        cmd.extend(["-m", "unit"])
        print("🚀 단위 테스트 실행 중...")
    elif test_type == "integration":
        # 통합 테스트만 실행
        cmd.extend(["-m", "integration"])
        print("🚀 통합 테스트 실행 중...")
    elif test_type == "fast":
        # 빠른 테스트만 실행
        cmd.extend(["-m", "fast"])
        print("🚀 빠른 테스트 실행 중...")
    else:
        # 모든 테스트 실행
        print("🚀 모든 테스트 실행 중...")
    
    # 커버리지 옵션
    if coverage:
        cmd.extend(["--cov=app", "--cov-report=html", "--cov-report=term"])
        print("📊 커버리지 리포트 생성 중...")
    
    # 상세 출력 옵션
    if verbose:
        cmd.extend(["-v", "-s"])
    
    print(f"🔧 실행 명령어: {' '.join(cmd)}")
    
    # 테스트 실행
    try:
        result = subprocess.run(cmd, check=True, capture_output=False)
        print("✅ 모든 테스트 통과!")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ 테스트 실패: {e}")
        return False
    except FileNotFoundError:
        print(f"❌ Python 실행 파일을 찾을 수 없습니다: {python_cmd}")
        print("💡 가상환경을 활성화하거나 Python이 설치되어 있는지 확인하세요.")
        return False

def install_test_dependencies():
    """테스트 의존성 설치"""
    python_cmd = get_python_command()
    
    print("📦 테스트 의존성 설치 중...")
    
    try:
        # pytest 및 관련 패키지 설치
        subprocess.run([
            python_cmd, "-m", "pip", "install", 
            "pytest", "pytest-asyncio", "pytest-cov", "pytest-mock"
        ], check=True)
        print("✅ 테스트 의존성 설치 완료!")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ 의존성 설치 실패: {e}")
        return False

def show_test_info():
    """테스트 정보 표시"""
    print("=" * 60)
    print("🧪 Project Scraper 테스트 실행기")
    print("=" * 60)
    print("📁 테스트 폴더: app/tests/")
    print("🔧 테스트 프레임워크: pytest")
    print("📊 커버리지 도구: pytest-cov")
    print("=" * 60)

def main():
    """메인 함수"""
    import argparse
    
    parser = argparse.ArgumentParser(description="Project Scraper 테스트 실행기")
    parser.add_argument(
        "--type", 
        choices=["all", "unit", "integration", "fast"],
        default="all",
        help="테스트 타입 선택"
    )
    parser.add_argument(
        "--coverage", 
        action="store_true",
        help="커버리지 리포트 생성"
    )
    parser.add_argument(
        "--verbose", "-v",
        action="store_true",
        help="상세 출력"
    )
    parser.add_argument(
        "--install-deps",
        action="store_true",
        help="테스트 의존성 설치"
    )
    
    args = parser.parse_args()
    
    show_test_info()
    
    # 의존성 설치 옵션
    if args.install_deps:
        if not install_test_dependencies():
            sys.exit(1)
        print()
    
    # 테스트 실행
    success = run_tests(args.type, args.coverage, args.verbose)
    
    if success:
        print("\n🎉 테스트 완료!")
        sys.exit(0)
    else:
        print("\n💥 테스트 실패!")
        sys.exit(1)

if __name__ == "__main__":
    main()
