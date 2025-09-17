# path: app/services/email_service.py

import smtplib
import ssl
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional
import jwt
import secrets
from datetime import datetime, timedelta
import logging
import os

from app.config.database import get_database
from pymongo import MongoClient
from app.exceptions.auth_exceptions import EmailNotVerifiedError, ValidationError

logger = logging.getLogger(__name__)

class EmailService:
    """이메일 관련 서비스"""
    
    def __init__(self):
        # 디버그 로그 출력 제어 플래그 (운영 기본값: False)
        self.debug = False

        # 동기 MongoDB 클라이언트 사용
        mongodb_url = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
        database_name = os.getenv("DATABASE_NAME", "allttam")
        
        try:
            self.client = MongoClient(mongodb_url)
            self.db = self.client[database_name]
            self.email_verifications_collection = self.db.email_verifications
            self._debug(f"✅ MongoDB 연결 성공: {database_name}")
        except Exception as e:
            logger.error(f"Failed to connect to MongoDB: {e}")
            self._debug(f"❌ MongoDB 연결 실패: {e}")
            raise Exception(f"Database connection failed: {e}")
        
        # 이메일 설정: 환경변수에서 읽기 (하드코딩 제거)
        self.smtp_server = os.getenv("SMTP_SERVER", "smtp.gmail.com")
        self.smtp_port = int(os.getenv("SMTP_PORT", "587"))
        self.smtp_username = os.getenv("SMTP_USERNAME")
        self.smtp_password = os.getenv("SMTP_PASSWORD")
        self.from_email = os.getenv("FROM_EMAIL", self.smtp_username or "")
        self.app_name = os.getenv("APP_NAME", "Allttam")
        # 연결 모드
        self.use_ssl = os.getenv("USE_SSL", "false").lower() == "true"
        self.use_tls = os.getenv("USE_TLS", "true").lower() == "true"
        
        # JWT 설정
        self.jwt_secret = os.getenv("JWT_SECRET", "your-secret-key")
        self.jwt_algorithm = "HS256"
        self.verification_token_expiry = timedelta(hours=24)

    def _debug(self, message: str) -> None:
        """내부 디버그 로그 출력 도우미"""
        if self.debug:
            print(message)
    
    async def send_verification_email(self, email: str, user_name: str) -> bool:
        """이메일 인증 메일 발송"""
        try:
            # 인증 토큰 생성
            verification_token = self._generate_verification_token(email)
            
            # 이메일 템플릿 생성
            subject = f"[{self.app_name}] 이메일 인증을 완료해주세요"
            html_content = self._create_verification_email_template(
                user_name, verification_token
            )
            text_content = self._create_verification_email_text_template(
                user_name, verification_token
            )
            
            # 이메일 발송
            success = self._send_email(
                to_email=email,
                subject=subject,
                html_content=html_content,
                text_content=text_content
            )
            
            if success:
                # 인증 토큰 저장
                await self._save_verification_token(email, verification_token)
                logger.info(f"Verification email sent to: {email}")
            
            return success
            
        except Exception as e:
            logger.error(f"Failed to send verification email: {e}")
            return False
    
    async def verify_email_token(self, token: str) -> bool:
        """이메일 인증 토큰 검증"""
        try:
            # 토큰 디코딩
            payload = jwt.decode(
                token, 
                self.jwt_secret, 
                algorithms=[self.jwt_algorithm]
            )
            
            email = payload.get("email")
            if not email:
                return False
            
            # 토큰이 데이터베이스에 존재하는지 확인
            verification_doc = await self.email_verifications_collection.find_one({
                "email": email,
                "token": token,
                "used": False
            })
            
            if not verification_doc:
                return False
            
            # 토큰 사용 처리
            await self.email_verifications_collection.update_one(
                {"_id": verification_doc["_id"]},
                {"$set": {"used": True, "verified_at": datetime.utcnow()}}
            )
            
            # 사용자 이메일 인증 상태 업데이트
            users_collection = self.db.users
            await users_collection.update_one(
                {"email": email},
                {"$set": {"email_verified": True, "updated_at": datetime.utcnow()}}
            )
            
            logger.info(f"Email verified successfully: {email}")
            return True
            
        except jwt.ExpiredSignatureError:
            logger.warning(f"Verification token expired: {token}")
            return False
        except jwt.InvalidTokenError:
            logger.warning(f"Invalid verification token: {token}")
            return False
        except Exception as e:
            logger.error(f"Failed to verify email token: {e}")
            return False
    
    def send_verification_code(self, email: str) -> bool:
        """이메일 인증번호 발송 (6자리 숫자)"""
        try:
            self._debug(f"\n🔐 인증번호 발송 시작: {email}")
            
            # 6자리 인증번호 생성
            verification_code = self._generate_verification_code()
            self._debug(f"  📝 생성된 인증번호: {verification_code}")
            
            # 이메일 템플릿 생성
            subject = f"[{self.app_name}] 이메일 인증번호"
            html_content = self._create_verification_code_email_template(verification_code)
            text_content = self._create_verification_code_text_template(verification_code)
            
            # 이메일 발송
            success = self._send_email(
                to_email=email,
                subject=subject,
                html_content=html_content,
                text_content=text_content
            )
            
            if success:
                # 인증번호 저장 (5분 유효)
                self._debug(f"  💾 인증번호 저장 중...")
                self._save_verification_code(email, verification_code)
                self._debug(f"  ✅ 인증번호 저장 완료")
                logger.info(f"Verification code sent to: {email}")
            else:
                self._debug(f"  ❌ 이메일 발송 실패")
            
            return success
            
        except Exception as e:
            logger.error(f"Failed to send verification code: {e}")
            return False

    def verify_code(self, email: str, code: str) -> bool:
        """인증번호 검증"""
        try:
            # 인증번호 확인
            verification_doc = self.email_verifications_collection.find_one({
                "email": email,
                "code": code,
                "type": "verification_code",
                "used": False,
                "expires_at": {"$gt": datetime.utcnow()}
            })
            
            if not verification_doc:
                return False
            
            # 인증번호 사용 처리
            self.email_verifications_collection.update_one(
                {"_id": verification_doc["_id"]},
                {"$set": {"used": True, "verified_at": datetime.utcnow()}}
            )
            
            # 사용자 이메일 인증 상태 업데이트
            users_collection = self.db.users
            users_collection.update_one(
                {"email": email},
                {"$set": {"email_verified": True, "updated_at": datetime.utcnow()}}
            )
            
            logger.info(f"Email verification code verified successfully: {email}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to verify code: {e}")
            return False

    async def send_password_reset_email(self, email: str, user_name: str) -> bool:
        """비밀번호 재설정 이메일 발송"""
        try:
            # 재설정 토큰 생성
            reset_token = self._generate_password_reset_token(email)
            
            # 이메일 템플릿 생성
            subject = f"[{self.app_name}] 비밀번호 재설정"
            html_content = self._create_password_reset_email_template(
                user_name, reset_token
            )
            text_content = self._create_password_reset_email_text_template(
                user_name, reset_token
            )
            
            # 이메일 발송
            success = self._send_email(
                to_email=email,
                subject=subject,
                html_content=html_content,
                text_content=text_content
            )
            
            if success:
                # 재설정 토큰 저장
                await self._save_password_reset_token(email, reset_token)
                logger.info(f"Password reset email sent to: {email}")
            
            return success
            
        except Exception as e:
            logger.error(f"Failed to send password reset email: {e}")
            return False
    
    def _generate_verification_token(self, email: str) -> str:
        """이메일 인증 토큰 생성"""
        payload = {
            "email": email,
            "type": "email_verification",
            "exp": datetime.utcnow() + self.verification_token_expiry
        }
        return jwt.encode(payload, self.jwt_secret, algorithm=self.jwt_algorithm)
    
    def _generate_verification_code(self) -> str:
        """6자리 인증번호 생성"""
        import random
        return str(random.randint(100000, 999999))
    
    def _generate_password_reset_token(self, email: str) -> str:
        """비밀번호 재설정 토큰 생성"""
        payload = {
            "email": email,
            "type": "password_reset",
            "exp": datetime.utcnow() + timedelta(hours=1)  # 1시간 유효
        }
        return jwt.encode(payload, self.jwt_secret, algorithm=self.jwt_algorithm)
    
    async def _save_verification_token(self, email: str, token: str):
        """인증 토큰 저장"""
        await self.email_verifications_collection.insert_one({
            "email": email,
            "token": token,
            "type": "email_verification",
            "used": False,
            "created_at": datetime.utcnow(),
            "verified_at": None
        })
    
    def _save_verification_code(self, email: str, code: str):
        """인증번호 저장 (5분 유효)"""
        self.email_verifications_collection.insert_one({
            "email": email,
            "code": code,
            "type": "verification_code",
            "used": False,
            "created_at": datetime.utcnow(),
            "expires_at": datetime.utcnow() + timedelta(minutes=5),
            "verified_at": None
        })
    
    async def _save_password_reset_token(self, email: str, token: str):
        """비밀번호 재설정 토큰 저장"""
        await self.email_verifications_collection.insert_one({
            "email": email,
            "token": token,
            "type": "password_reset",
            "used": False,
            "created_at": datetime.utcnow(),
            "verified_at": None
        })
    
    def _send_email(self, to_email: str, subject: str, html_content: str, text_content: str) -> bool:
        """이메일 발송"""
        try:
            # 환경변수 확인
            if not self.smtp_username or not self.smtp_password:
                logger.error("SMTP credentials not configured")
                self._debug(f"❌ SMTP 설정 확인 필요: USERNAME={self.smtp_username}, PASSWORD={'*' * len(self.smtp_password) if self.smtp_password else 'None'}")
                return False
            
            # 이메일 메시지 생성
            message = MIMEMultipart("alternative")
            message["Subject"] = subject
            message["From"] = self.from_email
            message["To"] = to_email
            
            # 텍스트 및 HTML 파트 추가
            text_part = MIMEText(text_content, "plain", "utf-8")
            html_part = MIMEText(html_content, "html", "utf-8")
            
            message.attach(text_part)
            message.attach(html_part)
            
            self._debug(f"\n📧 이메일 발송 시도:")
            self._debug(f"  수신자: {to_email}")
            self._debug(f"  제목: {subject}")
            self._debug(f"  발신자: {self.from_email}")
            self._debug(f"  SMTP 서버: {self.smtp_server}:{self.smtp_port}")
            
            # SMTP 서버 연결 및 이메일 발송
            context = ssl.create_default_context()
            if self.use_ssl or self.smtp_port == 465:
                with smtplib.SMTP_SSL(self.smtp_server, self.smtp_port, context=context) as server:
                    self._debug("  🔗 SMTP SSL 서버 연결 중...")
                    self._debug(f"  🔑 로그인 시도: {self.smtp_username}")
                    try:
                        server.login(self.smtp_username, self.smtp_password)
                        self._debug("  ✅ 로그인 성공")
                    except Exception as login_error:
                        self._debug(f"  ❌ 로그인 실패: {login_error}")
                        raise login_error
                    
                    self._debug("  📤 이메일 발송 중...")
                    server.sendmail(self.from_email, to_email, message.as_string())
                    self._debug("  📤 이메일 발송 완료!")
            else:
                with smtplib.SMTP(self.smtp_server, self.smtp_port) as server:
                    self._debug("  🔗 SMTP 서버 연결 중...")
                    if self.use_tls:
                        server.starttls(context=context)
                        self._debug("  🔐 TLS 연결 완료")
                    
                    self._debug(f"  🔑 로그인 시도: {self.smtp_username}")
                    try:
                        server.login(self.smtp_username, self.smtp_password)
                        self._debug("  ✅ 로그인 성공")
                    except Exception as login_error:
                        self._debug(f"  ❌ 로그인 실패: {login_error}")
                        raise login_error
                    
                    self._debug("  📤 이메일 발송 중...")
                    server.sendmail(self.from_email, to_email, message.as_string())
                    self._debug("  📤 이메일 발송 완료!")
            
            logger.info(f"Email sent successfully to: {to_email}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to send email to {to_email}: {e}")
            self._debug(f"❌ 이메일 발송 실패: {e}")
            return False
    
    def _create_verification_email_template(self, user_name: str, token: str) -> str:
        """이메일 인증 HTML 템플릿"""
        verification_url = f"https://allttam.com/verify-email?token={token}"
        
        return f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>이메일 인증</title>
        </head>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background-color: #f8f9fa; padding: 30px; border-radius: 10px;">
                <h2 style="color: #333; text-align: center;">이메일 인증을 완료해주세요</h2>
                <p style="color: #666; font-size: 16px;">안녕하세요, {user_name}님!</p>
                <p style="color: #666; font-size: 16px;">{self.app_name}에 가입해주셔서 감사합니다.</p>
                <p style="color: #666; font-size: 16px;">아래 버튼을 클릭하여 이메일 인증을 완료해주세요.</p>
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="{verification_url}" 
                       style="background-color: #007bff; color: white; padding: 12px 30px; 
                              text-decoration: none; border-radius: 5px; font-size: 16px;">
                        이메일 인증하기
                    </a>
                </div>
                
                <p style="color: #999; font-size: 14px;">
                    만약 버튼이 작동하지 않는다면, 아래 링크를 복사하여 브라우저에 붙여넣으세요:<br>
                    <a href="{verification_url}" style="color: #007bff;">{verification_url}</a>
                </p>
                
                <p style="color: #999; font-size: 12px; margin-top: 30px;">
                    이 이메일은 24시간 후에 만료됩니다.
                </p>
            </div>
        </body>
        </html>
        """
    
    def _create_verification_email_text_template(self, user_name: str, token: str) -> str:
        """이메일 인증 텍스트 템플릿"""
        verification_url = f"https://allttam.com/verify-email?token={token}"
        
        return f"""
        안녕하세요, {user_name}님!
        
        {self.app_name}에 가입해주셔서 감사합니다.
        
        이메일 인증을 완료하려면 아래 링크를 클릭해주세요:
        {verification_url}
        
        이 링크는 24시간 후에 만료됩니다.
        
        감사합니다.
        {self.app_name} 팀
        """
    
    def _create_password_reset_email_template(self, user_name: str, token: str) -> str:
        """비밀번호 재설정 HTML 템플릿"""
        reset_url = f"https://allttam.com/reset-password?token={token}"
        
        return f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>비밀번호 재설정</title>
        </head>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background-color: #f8f9fa; padding: 30px; border-radius: 10px;">
                <h2 style="color: #333; text-align: center;">비밀번호 재설정</h2>
                <p style="color: #666; font-size: 16px;">안녕하세요, {user_name}님!</p>
                <p style="color: #666; font-size: 16px;">비밀번호 재설정 요청을 받았습니다.</p>
                <p style="color: #666; font-size: 16px;">아래 버튼을 클릭하여 새로운 비밀번호를 설정해주세요.</p>
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="{reset_url}" 
                       style="background-color: #dc3545; color: white; padding: 12px 30px; 
                              text-decoration: none; border-radius: 5px; font-size: 16px;">
                        비밀번호 재설정하기
                    </a>
                </div>
                
                <p style="color: #999; font-size: 14px;">
                    만약 버튼이 작동하지 않는다면, 아래 링크를 복사하여 브라우저에 붙여넣으세요:<br>
                    <a href="{reset_url}" style="color: #dc3545;">{reset_url}</a>
                </p>
                
                <p style="color: #999; font-size: 12px; margin-top: 30px;">
                    이 이메일은 1시간 후에 만료됩니다.<br>
                    만약 비밀번호 재설정을 요청하지 않으셨다면, 이 이메일을 무시해주세요.
                </p>
            </div>
        </body>
        </html>
        """
    
    def _create_password_reset_email_text_template(self, user_name: str, token: str) -> str:
        """비밀번호 재설정 텍스트 템플릿"""
        reset_url = f"https://allttam.com/reset-password?token={token}"
        
        return f"""
        안녕하세요, {user_name}님!
        
        비밀번호 재설정 요청을 받았습니다.
        
        새로운 비밀번호를 설정하려면 아래 링크를 클릭해주세요:
        {reset_url}
        
        이 링크는 1시간 후에 만료됩니다.
        
        만약 비밀번호 재설정을 요청하지 않으셨다면, 이 이메일을 무시해주세요.
        
        감사합니다.
        {self.app_name} 팀
        """
    
    def _create_verification_code_email_template(self, code: str) -> str:
        """인증번호 이메일 HTML 템플릿"""
        return f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>이메일 인증번호</title>
        </head>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background-color: #f8f9fa; padding: 30px; border-radius: 10px;">
                <h2 style="color: #333; text-align: center;">이메일 인증번호</h2>
                <p style="color: #666; font-size: 16px;">안녕하세요!</p>
                <p style="color: #666; font-size: 16px;">{self.app_name} 이메일 인증을 위한 인증번호입니다.</p>
                
                <div style="text-align: center; margin: 30px 0;">
                    <div style="background-color: #007bff; color: white; padding: 20px; 
                                border-radius: 10px; font-size: 32px; font-weight: bold; 
                                letter-spacing: 5px; display: inline-block;">
                        {code}
                    </div>
                </div>
                
                <p style="color: #666; font-size: 16px; text-align: center;">
                    위 인증번호를 입력하여 이메일 인증을 완료해주세요.
                </p>
                
                <p style="color: #999; font-size: 12px; margin-top: 30px; text-align: center;">
                    이 인증번호는 5분 후에 만료됩니다.
                </p>
            </div>
        </body>
        </html>
        """
    
    def _create_verification_code_text_template(self, code: str) -> str:
        """인증번호 이메일 텍스트 템플릿"""
        return f"""
        안녕하세요!
        
        {self.app_name} 이메일 인증을 위한 인증번호입니다.
        
        인증번호: {code}
        
        위 인증번호를 입력하여 이메일 인증을 완료해주세요.
        
        이 인증번호는 5분 후에 만료됩니다.
        
        감사합니다.
        {self.app_name} 팀
        """
