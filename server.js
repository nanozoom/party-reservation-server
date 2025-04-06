const express = require('express');
const app = express();

// 홈 페이지
app.get('/', (req, res) => {
  res.send('파티 예약 시스템 서버가 실행 중입니다.');
});

// 예약 페이지 - 적립금 기능 추가
app.get('/reserve', async (req, res) => {
  const { product_id, selected_date, member_code, ticket_type, price } = req.query;
  
  // 기본 예약 정보
  let reservationData = {
    productId: product_id || '1',
    selectedDate: selected_date || '날짜 정보 없음',
    price: price || '65000',
    name: '예약자',
    pointBalance: 0
  };
  
  // 회원 정보 및 적립금 조회 (실제 API 연동 시 구현)
  if (member_code) {
    try {
      // 실제 환경에서는 아임웹 API 호출
      const memberInfo = await getImwebMemberInfo(member_code);
      const pointBalance = await getImwebMemberPoints(member_code);
      
      if (memberInfo && memberInfo.success) {
        reservationData.name = memberInfo.data.name || '예약자';
        reservationData.pointBalance = pointBalance || 0;
      } else {
        // 테스트용 임시 데이터
        reservationData.name = '홍길동';
        reservationData.pointBalance = 3000; // 임시 적립금 3,000원
      }
    } catch (error) {
      console.error('회원 정보 조회 오류:', error);
    }
  }
  
  // HTML 응답
  res.send(`
    <html>
      <head>
        <title>파티 예약 확인</title>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: 'Noto Sans KR', sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; line-height: 1.6; }
          h1 { color: #FF5757; }
          .info { background: #f7f7f7; padding: 20px; border-radius: 5px; margin-bottom: 20px; }
          .point-section { background: #f0f9ff; padding: 20px; border-radius: 5px; margin-bottom: 20px; }
          button { background: #FF5757; color: white; border: none; padding: 12px 20px; border-radius: 5px; cursor: pointer; font-size: 16px; }
          button:hover { background: #FF3131; }
          input[type="number"] { padding: 8px; width: 100px; border: 1px solid #ddd; border-radius: 4px; }
          .total-price { font-size: 18px; font-weight: bold; color: #FF5757; }
        </style>
      </head>
      <body>
        <h1>파티 예약 확인</h1>
        
        <div class="info">
          <p><strong>선택하신 날짜:</strong> ${reservationData.selectedDate}</p>
          <p><strong>상품 ID:</strong> ${reservationData.productId}</p>
          <p><strong>예약자:</strong> ${reservationData.name}</p>
        </div>
        
        <div class="point-section">
          <h2>적립금 사용</h2>
          <p>사용 가능한 적립금: <strong>${reservationData.pointBalance.toLocaleString()}</strong>원</p>
          
          <div id="pointUseForm">
            <label for="usePoint">사용할 적립금:</label>
            <input type="number" id="usePoint" min="0" max="${reservationData.pointBalance}" value="0" step="100">
            <button type="button" onclick="applyPoint()">적용</button>
          </div>
        </div>
        
        <div class="info">
          <h2>결제 정보</h2>
          <p><strong>입금 계좌:</strong> 국민은행 123-456-78910 (주)미터파티</p>
          <p><strong>상품 금액:</strong> ${parseInt(reservationData.price).toLocaleString()}원</p>
          <p><strong>적립금 사용:</strong> <span id="usedPoint">0</span>원</p>
          <p class="total-price"><strong>최종 결제 금액:</strong> <span id="finalPrice">${parseInt(reservationData.price).toLocaleString()}</span>원</p>
        </div>
        
        <p>24시간 이내에 입금해주세요.</p>
        <button onclick="completeReservation()">예약 완료</button>
        
        <script>
          // 적립금 사용 함수
          function applyPoint() {
            const usePointInput = document.getElementById('usePoint');
            const usedPointSpan = document.getElementById('usedPoint');
            const finalPriceSpan = document.getElementById('finalPrice');
            
            // 입력값 확인 및 조정
            let pointToUse = parseInt(usePointInput.value) || 0;
            const maxPoint = ${reservationData.pointBalance};
            const originalPrice = ${reservationData.price};
            
            // 최대 사용 가능 적립금 (금액의 50%까지만 사용 가능)
            const maxAllowed = Math.min(maxPoint, Math.floor(originalPrice * 0.5));
            
            if (pointToUse > maxAllowed) {
              alert('적립금은 상품 금액의 50%까지만 사용 가능합니다.');
              pointToUse = maxAllowed;
              usePointInput.value = pointToUse;
            }
            
            // 화면 업데이트
            usedPointSpan.textContent = pointToUse.toLocaleString();
            const finalPrice = originalPrice - pointToUse;
            finalPriceSpan.textContent = finalPrice.toLocaleString();
          }
          
          // 예약 완료 함수
          function completeReservation() {
            const usedPoint = parseInt(document.getElementById('usePoint').value) || 0;
            const finalPrice = ${parseInt(reservationData.price)} - usedPoint;
            
            alert('예약이 완료되었습니다. ' + finalPrice.toLocaleString() + '원을 24시간 이내에 입금해주세요.');
            window.location.href = 'https://themeeterparty.com';
          }
        </script>
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

// 아임웹 API 인증 토큰 발급 함수
async function getImwebAccessToken() {
  // 아임웹 개발자 센터에서 발급받은 키 정보
  const clientId = '발급받은_클라이언트_ID';
  const clientSecret = '발급받은_시크릿_키';
  
  try {
    const response = await fetch('https://openapi.imweb.me/v2/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        grant_type: 'client_credentials',
        client_id: clientId,
        client_secret: clientSecret
      })
    });
    
    if (!response.ok) {
      throw new Error(`토큰 발급 오류: ${response.status}`);
    }
    
    const data = await response.json();
    return data.access_token;
  } catch (error) {
    console.error('아임웹 API 토큰 발급 실패:', error);
    return null;
  }
}

// 아임웹 회원 정보 조회 함수
async function getImwebMemberInfo(memberCode) {
  try {
    const token = await getImwebAccessToken();
    const response = await fetch(`https://openapi.imweb.me/member/${memberCode}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`API 응답 오류: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('회원 정보 조회 실패:', error);
    return null;
  }
}

// 아임웹 회원 적립금 조회 함수
async function getImwebMemberPoints(memberCode) {
  try {
    const token = await getImwebAccessToken();
    const response = await fetch(`https://openapi.imweb.me/member/${memberCode}/point`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`API 응답 오류: ${response.status}`);
    }
    
    const data = await response.json();
    return data.point_balance || 0;
  } catch (error) {
    console.error('적립금 조회 실패:', error);
    return 0;
  }
}
