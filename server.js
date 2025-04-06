const express = require('express');
const app = express();

// 홈 페이지
app.get('/', (req, res) => {
  res.send('파티 예약 시스템 서버가 실행 중입니다.');
});

// 예약 페이지 - 간단 버전
app.get('/reserve', (req, res) => {
  const { product_id, selected_date } = req.query;
  res.send(`
    <html>
      <head>
        <title>예약 확인</title>
        <style>
          body { font-family: Arial; max-width: 800px; margin: 0 auto; padding: 20px; }
          h1 { color: #FF5757; }
          .info { background: #f5f5f5; padding: 15px; border-radius: 5px; }
          button { background: #FF5757; color: white; border: none; padding: 10px 20px; cursor: pointer; }
        </style>
      </head>
      <body>
        <h1>파티 예약 확인</h1>
        <div class="info">
          <p><strong>선택하신 날짜:</strong> ${selected_date || '날짜 정보 없음'}</p>
          <p><strong>상품 ID:</strong> ${product_id || '상품 정보 없음'}</p>
          <p><strong>예약자:</strong> 홍길동</p>
        </div>
        <h2>결제 정보</h2>
        <div class="info">
          <p><strong>입금 계좌:</strong> 국민은행 123-456-78910 (주)미터파티</p>
          <p><strong>금액:</strong> 65,000원</p>
        </div>
        <p>24시간 이내에 입금해주세요.</p>
        <button onclick="window.location.href='https://themeeterparty.com'">홈으로 돌아가기</button>
      </body>
    </html>
  `);
});

// 404 처리
app.use((req, res) => {
  res.status(404).send('페이지를 찾을 수 없습니다');
});

// 서버 시작
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`서버가 포트 ${port}에서 실행 중입니다`);
});
