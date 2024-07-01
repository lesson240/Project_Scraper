window.onload = function () {
    // WebSocket 연결 설정
    const wsUrl = `ws://${window.location.host}/v1/websocket-coupang`;
    const socket = new WebSocket(wsUrl);

    socket.onopen = function (event) {
        console.log('WebSocket is open now.');
    };

    socket.onmessage = function (event) {
        console.log('WebSocket message received:', event.data);
    };

    socket.onclose = function (event) {
        console.log('WebSocket is closed now.');
    };

    socket.onerror = function (error) {
        console.log('WebSocket error:', error);
    };

    // 필요한 경우 버튼 클릭 등 추가 기능 구현
    document.getElementById("send-message-btn").addEventListener("click", function () {
        const message = {
            action: "load",
            user_id: "test_user",
            site_name: "coupang",
            url: "https://wing.coupang.com/"
        };
        socket.send(JSON.stringify(message));
    });
};
