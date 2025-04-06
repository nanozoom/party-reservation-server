require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;

// 미들웨어 설정
app.use(cors()); // CORS 활성화
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// 뷰 엔진 설정
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// 아임웹 API 컨트롤러 연결
const imwebController = require('./controllers/imweb');

// 메인 페이지
app.get('/', (req, res) => {
    res.send('파티 예약 시스템 서버가 실행 중입니다.');
});

// 예약 페이지 라우트
app.get('/reserve', async (req, res) => {
    const { product_id, selected_date, member_code } = req.query;
    
    // 회원 정보 확인 (임시 구현)
    let memberInfo = null;
    try {
        memberInfo = await imwebController.getMemberInfo(member_code);
    } catch (error) {
        console.error('회원 정보 조회 실패:', error);
    }
    
    if (!memberInfo) {
        // 개발 단계에서는 임시 회원 정보 사용
        memberInfo = {
            name: '홍길동',
            phone: '010-1234-5678',
            email: 'test@example.com'
        };
        
        // 실제 환경에서는 로그인 페이지로 리다이렉트
        if (process.env.NODE_ENV === 'production') {
            return res.redirect('https://themeeterparty.com/member/login');
        }
    }
    
    // 예약 페이지 렌더링
    res.render('reservation', {
        productId: product_id || '1',
        selectedDate: selected_date || '2023-05-01',
        memberInfo: memberInfo
    });
});

// 예약 데이터 처리 API
app.post('/api/reservations', async (req, res) => {
    const { productId, selectedDate, name, phone, email, gender, message } = req.body;
    
    try {
        // 예약 데이터 저장 (실제 구현 필요)
        const reservationId = Date.now().toString();
        
        // 예약 성공 응답
        res.json({
            success: true,
            reservationId: reservationId,
            message: '예약이 성공적으로 완료되었습니다.'
        });
    } catch (error) {
        console.error('예약 처리 오류:', error);
        res.status(500).json({
            success: false,
            message: '예약 처리 중 오류가 발생했습니다.'
        });
    }
});

// 404 에러 처리
app.use((req, res) => {
    res.status(404).render('error', {
        message: '요청하신 페이지를 찾을 수 없습니다.'
    });
});

// 서버 시작
app.listen(port, () => {
    console.log(`예약 서버가 포트 ${port}에서 실행 중입니다.`);
}); 