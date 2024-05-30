// collect-brand-list.js

document.addEventListener("DOMContentLoaded", function () {
    console.log("Custom scripts loaded!");

    // "수집" 버튼 클릭 이벤트 핸들러
    const collectBtn = document.getElementById('collect-btn');
    collectBtn.addEventListener('click', async function () {
        console.log('수집 버튼이 클릭되었습니다.');

        try {
            // 서버로부터 데이터 가져오기
            const response = await fetch("/endpoint/brandlist");
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();

            // 테이블에 데이터 추가하기
            const tableBody = document.querySelector('table tbody');
            tableBody.innerHTML = ''; // 기존 테이블 내용 초기화
            data.forEach(item => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${item.idx}</td>
                    <td>${item.code}</td>
                    <td>${item.brand}</td>
                    <td>${item.collection_time}</td>
                    <td>${item.status}</td>
                `;
                tableBody.appendChild(row);
            });
        } catch (error) {
            console.error('There was a problem with the fetch operation:', error);
        }
    });
});
