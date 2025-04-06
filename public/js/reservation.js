/**
 * 예약 처리 자바스크립트
 */
document.addEventListener('DOMContentLoaded', function() {
    // 요소 가져오기
    const reservationForm = document.getElementById('reservationForm');
    const genderSelect = document.getElementById('gender');
    const messageTextarea = document.getElementById('message');
    const agreementCheck = document.getElementById('agreementCheck');
    const confirmButton = document.getElementById('confirmButton');
    const cancelButton = document.getElementById('cancelButton');
    const successModal = document.getElementById('successModal');
    const closeModal = document.querySelector('.close');
    const goHomeButton = document.getElementById('goHomeButton');
    const totalAmountSpan = document.getElementById('totalAmount');
    const modalAmountSpan = document.getElementById('modalAmount');
    
    // 상품 ID와 선택 날짜
    const productIdElement = document.getElementById('productId');
    const selectedDateElement = document.getElementById('selectedDate');
    const productId = productIdElement.textContent;
    const selectedDate = selectedDateElement.textContent;
    
    // 금액 설정
    function setAmount() {
        // 상품 가격 설정 (상품 ID에 따라 다르게 설정 가능)
        let amount = '65,000';
        
        // 실제 환경에서는 상품 ID를 기반으로 가격 설정
        // 여기서는 간단하게 하드코딩
        
        // 가격 표시 업데이트
        totalAmountSpan.textContent = amount;
        modalAmountSpan.textContent = amount;
    }
    
    // 취소 버튼 클릭 처리
    cancelButton.addEventListener('click', function() {
        // 사용자에게 확인
        if (confirm('예약을 취소하시겠습니까?')) {
            // 홈페이지로 이동
            window.location.href = 'https://themeeterparty.com';
        }
    });
    
    // 폼 제출 처리
    reservationForm.addEventListener('submit', function(event) {
        event.preventDefault();
        
        // 폼 유효성 검사
        if (!validateForm()) {
            return;
        }
        
        // 폼 데이터 수집
        const formData = {
            productId: reservationForm.productId.value,
            selectedDate: reservationForm.selectedDate.value,
            name: reservationForm.name.value,
            phone: reservationForm.phone.value,
            email: reservationForm.email.value,
            gender: reservationForm.gender.value,
            message: reservationForm.message.value
        };
        
        // API 서버에 예약 데이터 전송
        submitReservation(formData);
    });
    
    // 폼 유효성 검사 함수
    function validateForm() {
        // 성별 확인
        if (!genderSelect.value) {
            alert('성별을 선택해주세요.');
            genderSelect.focus();
            return false;
        }
        
        // 개인정보 동의 확인
        if (!agreementCheck.checked) {
            alert('개인정보 수집 및 이용에 동의해주세요.');
            agreementCheck.focus();
            return false;
        }
        
        return true;
    }
    
    // 예약 데이터 서버 전송 함수
    function submitReservation(formData) {
        // 버튼 비활성화
        confirmButton.disabled = true;
        confirmButton.textContent = '처리 중...';
        
        // API 서버에 데이터 전송
        fetch('/api/reservations', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        })
        .then(response => response.json())
        .then(data => {
            // 성공 시 모달 표시
            if (data.success) {
                showSuccessModal();
            } else {
                // 오류 메시지 표시
                alert('예약 처리 중 오류가 발생했습니다: ' + data.message);
                confirmButton.disabled = false;
                confirmButton.textContent = '예약 확정';
            }
        })
        .catch(error => {
            console.error('예약 처리 오류:', error);
            alert('예약 처리 중 오류가 발생했습니다. 다시 시도해주세요.');
            confirmButton.disabled = false;
            confirmButton.textContent = '예약 확정';
        });
    }
    
    // 성공 모달 표시 함수
    function showSuccessModal() {
        successModal.style.display = 'block';
    }
    
    // 모달 닫기 버튼 처리
    closeModal.addEventListener('click', function() {
        successModal.style.display = 'none';
    });
    
    // 확인 버튼 클릭 처리
    goHomeButton.addEventListener('click', function() {
        window.location.href = 'https://themeeterparty.com';
    });
    
    // 모달 외부 클릭 시 닫기
    window.addEventListener('click', function(event) {
        if (event.target === successModal) {
            successModal.style.display = 'none';
        }
    });
    
    // 페이지 로드 시 금액 설정
    setAmount();
}); 