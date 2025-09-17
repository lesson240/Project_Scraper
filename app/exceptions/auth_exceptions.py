# path: app/exceptions/auth_exceptions.py

"""
인증 관련 예외 클래스들
"""

class AuthException(Exception):
    """인증 관련 기본 예외 클래스"""
    def __init__(self, message: str, status_code: int = 400):
        self.message = message
        self.status_code = status_code
        super().__init__(self.message)

class AuthenticationError(AuthException):
    """인증 실패 예외"""
    def __init__(self, message: str = "Authentication failed"):
        super().__init__(message, 401)

class AuthorizationError(AuthException):
    """인가 실패 예외"""
    def __init__(self, message: str = "Authorization failed"):
        super().__init__(message, 403)

class ValidationError(AuthException):
    """데이터 검증 실패 예외"""
    def __init__(self, message: str = "Validation failed"):
        super().__init__(message, 400)

class UserNotFoundError(AuthException):
    """사용자 없음 예외"""
    def __init__(self, message: str = "User not found"):
        super().__init__(message, 404)

class InvalidCredentialsError(AuthException):
    """잘못된 인증 정보 예외"""
    def __init__(self, message: str = "Invalid credentials"):
        super().__init__(message, 401)

class UserAlreadyExistsError(AuthException):
    """사용자 이미 존재 예외"""
    def __init__(self, message: str = "User already exists"):
        super().__init__(message, 409)

class TokenExpiredError(AuthException):
    """토큰 만료 예외"""
    def __init__(self, message: str = "Token expired"):
        super().__init__(message, 401)

class InvalidTokenError(AuthException):
    """잘못된 토큰 예외"""
    def __init__(self, message: str = "Invalid token"):
        super().__init__(message, 401)

class SocialLoginError(AuthException):
    """소셜 로그인 실패 예외"""
    def __init__(self, message: str = "Social login failed"):
        super().__init__(message, 400)

class EmailNotVerifiedError(AuthException):
    """이메일 미인증 예외"""
    def __init__(self, message: str = "Email not verified"):
        super().__init__(message, 403)

class AccountSuspendedError(AuthException):
    """계정 정지 예외"""
    def __init__(self, message: str = "Account suspended"):
        super().__init__(message, 403)

class PasswordTooWeakError(ValidationError):
    """비밀번호 약함 예외"""
    def __init__(self, message: str = "Password is too weak"):
        super().__init__(message)

class EmailAlreadyExistsError(UserAlreadyExistsError):
    """이메일 이미 존재 예외"""
    def __init__(self, message: str = "Email already exists"):
        super().__init__(message)

class PhoneAlreadyExistsError(UserAlreadyExistsError):
    """전화번호 이미 존재 예외"""
    def __init__(self, message: str = "Phone number already exists"):
        super().__init__(message)
