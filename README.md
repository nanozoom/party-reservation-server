# 파티 예약 시스템

아임웹과 연동되는 외부 파티 예약 시스템입니다. 아임웹 회원 체크 후 캘린더를 통해 날짜를 선택하고 계좌이체로 결제하는 예약 시스템을 제공합니다.

## 기능

- 아임웹 회원 전용 예약 (비회원 → 로그인 페이지 리다이렉트)
- 캘린더를 통한 날짜 선택 (매주 금, 토요일만 선택 가능)
- 성별 및 추가 요청사항 입력
- 계좌이체 정보 제공
- 예약 정보 저장 및 관리

## 시스템 구성

![시스템 구성](system-arch.png)

- **아임웹 위젯**: 회원 여부 체크 후 캘린더 표시
- **예약 서버**: Node.js Express 서버로 예약 처리 및 관리
- **데이터베이스**: 예약 정보 저장 (향후 구현 가능)

## 설치 및 실행 방법

### 1. 서버 설치

```bash
# 저장소 클론
git clone https://github.com/yourname/party-reservation-server.git

# 디렉토리 이동
cd party-reservation-server

# 패키지 설치
npm install

# 개발 서버 실행
npm run dev

# 프로덕션 서버 실행
npm start
```

### 2. 환경 설정

`.env` 파일을 수정하여 환경 변수 설정:

```
PORT=3000
NODE_ENV=production
IMWEB_API_KEY=your_api_key_here
IMWEB_API_SECRET=your_api_secret_here
```

### 3. 아임웹 위젯 설정

아임웹 HTML 위젯에서 `imweb_widget.html` 파일의 코드를 사용하되, `createExternalReservationUrl` 함수의 `baseUrl`을 실제 서버 주소로 변경하세요.

```javascript
function createExternalReservationUrl(productId, date) {
    // 실제 서버 URL로 변경 필요
    const baseUrl = 'https://your-actual-server.com/reserve';
    // ...
}
```

## 배포 방법

### 서버 배포

1. [Heroku](https://www.heroku.com/)나 [Vercel](https://vercel.com/) 등의 클라우드 서비스 사용
2. 또는 일반 VPS (AWS EC2, DigitalOcean 등)에 배포

### 아임웹 위젯 적용

1. 아임웹 관리자 페이지에서 HTML 위젯 추가
2. `imweb_widget.html` 코드 붙여넣기
3. 서버 URL 및 기타 설정 수정

## 작업 내역

- [x] 아임웹 위젯 (캘린더) 구현
- [x] Node.js Express 서버 구현
- [x] 예약 페이지 템플릿 구현
- [x] 아임웹 API 연동 (개발용 임시 구현)
- [ ] 데이터베이스 연동 (향후 구현)
- [ ] 관리자 대시보드 구현 (향후 구현)

## 문의

개발 문의: example@example.com 