/**
 * 아임웹 API 컨트롤러
 * 아임웹 API를 사용하여 회원 정보를 조회하는 등의 기능을 제공합니다.
 */

// API 키 설정 (실제 구현 시 .env 파일에 저장)
const API_KEY = process.env.IMWEB_API_KEY || 'your_api_key_here';
const API_SECRET = process.env.IMWEB_API_SECRET || 'your_api_secret_here';
const BASE_URL = 'https://openapi.imweb.me';

// 모듈 가져오기
const fetch = require('node-fetch');

// 액세스 토큰 저장 변수
let accessToken = null;
let tokenExpires = 0;

/**
 * 아임웹 API 액세스 토큰 획득
 * @returns {Promise<string>} 액세스 토큰
 */
async function getAccessToken() {
    // 토큰이 유효한 경우 캐시된 토큰 반환
    const now = Date.now();
    if (accessToken && tokenExpires > now) {
        return accessToken;
    }
    
    try {
        // 개발 단계에서는 실제 API 호출 없이 임시 토큰 반환
        if (process.env.NODE_ENV !== 'production') {
            console.log('개발 모드: 임시 액세스 토큰 사용');
            accessToken = 'dev_temp_token';
            tokenExpires = now + 3600 * 1000; // 1시간 유효
            return accessToken;
        }
        
        // 액세스 토큰 요청
        const response = await fetch(`${BASE_URL}/oauth2/token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                client_id: API_KEY,
                client_secret: API_SECRET,
                grant_type: 'client_credentials'
            })
        });
        
        if (!response.ok) {
            throw new Error(`API 응답 오류: ${response.status}`);
        }
        
        const data = await response.json();
        
        // 토큰 저장
        accessToken = data.access_token;
        tokenExpires = now + data.expires_in * 1000;
        
        return accessToken;
    } catch (error) {
        console.error('액세스 토큰 획득 실패:', error);
        throw new Error('아임웹 인증 실패');
    }
}

/**
 * 회원 정보 조회
 * @param {string} memberCode 회원 코드
 * @returns {Promise<object>} 회원 정보 객체
 */
async function getMemberInfo(memberCode) {
    if (!memberCode) {
        return null;
    }
    
    try {
        // 개발 단계에서는 실제 API 호출 없이 임시 데이터 반환
        if (process.env.NODE_ENV !== 'production') {
            console.log('개발 모드: 임시 회원 정보 사용');
            return {
                name: '홍길동',
                phone: '010-1234-5678',
                email: `${memberCode}@example.com`
            };
        }
        
        // 액세스 토큰 획득
        const token = await getAccessToken();
        
        // 회원 정보 요청
        const response = await fetch(`${BASE_URL}/member/${memberCode}`, {
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
        
        // 회원 정보 반환
        return {
            name: data.name,
            phone: data.phone,
            email: data.email
        };
    } catch (error) {
        console.error('회원 정보 조회 실패:', error);
        return null;
    }
}

module.exports = {
    getAccessToken,
    getMemberInfo
}; 