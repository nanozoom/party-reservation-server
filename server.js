const express = require('express');
const fetch = require('node-fetch');
const app = express();

// 홈 페이지
app.get('/', (req, res) => {
  res.send('파티 예약 시스템 서버가 실행 중입니다.');
});

// 예약 페이지 - 적립금 기능 추가
app.get('/reserve', async (req, res) => {
  console.log('요청 전체:', req.url);
  console.log('쿼리 파라미터:', req.query);
  console.log('회원 코드:', req.query.member_code);
  
  const { product_id, selected_date, member_code, ticket_type, price } = req.query;
  
  // 테스트용 - 실제 상황에서는 제거
  if (req.query.member_code === 'test123') {
    const html = `<html><body>테스트 성공! 회원 코드가 올바르게 전달됨: ${req.query.member_code}</body></html>`;
    return res.send(html);
  }
  
  // 기본 예약 정보
  let reservationData = {
    productId: product_id || '1',
    selectedDate: selected_date || '날짜 정보 없음',
    price: price || '65000',
    name: '비회원',
    pointBalance: 0
  };
  
  // 회원 정보 및 적립금 조회
  if (member_code) {
    console.log('회원 정보 조회 시작: 회원코드 =', member_code);
    try {
      // 토큰 발급 시도
      const token = await getImwebAccessToken();
      console.log('토큰 발급 결과:', token ? '성공' : '실패');
      
      if (token) {
        // v1 API 엔드포인트로 시도 (URL 수정)
        const memberApiUrl = `https://openapi.imweb.me/member/${member_code}`;
        console.log('회원 정보 요청 URL:', memberApiUrl);
        
        const response = await fetch(memberApiUrl, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        console.log('API 응답 상태:', response.status);
        
        if (response.ok) {
          const memberData = await response.json();
          console.log('회원 정보 응답:', memberData);
          
          // 응답 구조 확인 후 데이터 가져오기
          if (memberData && memberData.data) {
            reservationData.name = memberData.data.name || '회원';
            
            // 적립금 조회도 같은 방식으로 시도
            const pointResponse = await fetch(`https://openapi.imweb.me/member/${member_code}/point`, {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            });
            
            if (pointResponse.ok) {
              const pointData = await pointResponse.json();
              console.log('적립금 정보 응답:', pointData);
              
              // 응답 구조에 따라 적립금 정보 가져오기
              if (pointData && pointData.data) {
                reservationData.pointBalance = pointData.data.point_balance || 0;
              }
            } else {
              console.log('적립금 조회 실패:', pointResponse.status);
            }
          }
        } else {
          console.log('회원 정보 조회 실패:', await response.text());
        }
      }
    } catch (error) {
      console.error('회원 정보 조회 중 오류 발생:', error);
    }
  }
  
  // 이 부분은 테스트용으로 추가 (실제 API 작동 여부 확인용)
  if (member_code === 'test') {
    reservationData.name = '테스트 회원';
    reservationData.pointBalance = 5000;
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
  // 아임웹에서 발급받은 키 정보
  const clientId = '16d22cb158a5fd814f19f157db7c28e3d6152e9ae8';
  const clientSecret = 'fbfe2b04b3dc5ab4e91493';
  
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

// 회원 정보 가져오기
async function getImwebMemberInfo(memberCode) {
  try {
    const token = await getImwebAccessToken();
    if (!token) return null;
    
    const response = await fetch(`https://openapi.imweb.me/v2/member/${memberCode}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`회원 정보 조회 오류: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('회원 정보 조회 실패:', error);
    return null;
  }
}

// 적립금 정보 가져오기
async function getImwebMemberPoints(memberCode) {
  try {
    const token = await getImwebAccessToken();
    if (!token) return 0;
    
    const response = await fetch(`https://openapi.imweb.me/v2/member/${memberCode}/point`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`적립금 조회 오류: ${response.status}`);
    }
    
    const data = await response.json();
    return data.point_balance || 0;
  } catch (error) {
    console.error('적립금 조회 실패:', error);
    return 0;
  }
}
