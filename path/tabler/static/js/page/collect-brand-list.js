
document.addEventListener("DOMContentLoaded", function () {
    console.log("Custom scripts loaded!");

    const collectBtn = document.getElementById('collect-btn');
    collectBtn.addEventListener('click', async function () {
        try {
            const data = await fetchData("/endpoint/brandlist");
            const tableBody = document.querySelector('table tbody');
            if (!tableBody) {
                console.error('Table body not found');
                return;
            }
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
