// 전역 변수 선언
var brandCode = "";
var brandName = "";
var goodsCodes = [];
let saved_goods_list = [];

if (typeof window.apiVersion === 'undefined') {
    window.apiVersion = "v1"; // window.apiVersion을 사용하고, 없으면 "v1"을 기본값으로 설정
}

document.addEventListener("DOMContentLoaded", function () {
    console.log("Document loaded"); // 로그 추가
    var brandSearch = document.getElementById("brand-search");
    var dropdown = document.getElementById("brand-dropdown");
    var searchBtn = document.getElementById("search-btn"); //  조회 버튼 선택자
    var saveBtn = document.getElementById("save-btn");  // Save 버튼 선택자
    var syncCollectBtn = document.getElementById("sync-collect-btn"); // 수집동기화 버튼 선택자 추가
    var syncSalesBtn = document.getElementById("sync-sales-btn"); // 판매동기화 버튼 선택자 추가
    var syncMarketBtn = document.getElementById("sync-market-btn"); // 마켓동기화 버튼 선택자 추가 
    var selectedBrandCode = document.createElement("input");
    selectedBrandCode.type = "hidden";
    selectedBrandCode.id = "selected-brand-code";
    document.body.appendChild(selectedBrandCode);

    // openNav 함수 추가
    window.openNav = function (event, button) {
        event.stopPropagation();
        const sidebar = document.getElementById("mySidebar");
        const mainContent = document.getElementById("main-content");

        if (button.classList.contains("active")) {
            sidebar.style.right = "-250px";
            mainContent.style.marginRight = "0";
            mainContent.style.marginLeft = "0";
            button.classList.remove("active");
        } else {
            document.querySelectorAll('.detail-btn').forEach(btn => btn.classList.remove("active"));
            button.classList.add("active");
            sidebar.style.right = "0";
            mainContent.style.marginRight = "250px";
            mainContent.style.marginLeft = "-250px";
        }
    };

    // closeNav 함수 추가
    window.closeNav = function () {
        const sidebar = document.getElementById("mySidebar");
        const mainContent = document.getElementById("main-content");
        sidebar.style.right = "-250px";
        mainContent.style.marginRight = "0";
        mainContent.style.marginLeft = "0";
        document.querySelectorAll('.detail-btn').forEach(btn => btn.classList.remove("active"));
    };

    // brandSearch 입력 시 드롭다운에 브랜드 옵션 표시
    brandSearch.addEventListener("input", async function () {
        var query = this.value;

        if (query.length === 0) {
            dropdown.style.display = "none";
            return;
        }

        try {
            const response = await fetchData(`/${window.apiVersion}/autocomplete/collectedbrands?query=${query}`);
            dropdown.innerHTML = "";
            if (response.brands.length > 0) {
                response.brands.forEach(function (brand) {
                    var option = document.createElement("option");
                    option.text = brand.brand;
                    option.value = brand.brand_code;
                    dropdown.appendChild(option);
                });
                dropdown.style.display = "block";
            } else {
                dropdown.style.display = "none";
            }
        } catch (err) {
            console.error("Error fetching brand data:", err); // 에러 로그 추가
            dropdown.style.display = "none";
        }
    });

    dropdown.addEventListener("click", function (event) {
        if (event.target.tagName === "OPTION") {
            brandSearch.value = event.target.text;
            selectedBrandCode.value = event.target.value;
            dropdown.style.display = "none";
        }
    });

    brandSearch.addEventListener("keydown", function (event) {
        var items = dropdown.getElementsByTagName("option");
        if (items.length === 0) {
            return;
        }

        var currentIndex = -1;
        for (var i = 0; i < items.length; i++) {
            if (items[i].classList.contains("highlight")) {
                currentIndex = i;
                items[i].classList.remove("highlight");
                break;
            }
        }

        if (event.key === "ArrowDown") {
            currentIndex = (currentIndex + 1) % items.length;
        } else if (event.key === "ArrowUp") {
            currentIndex = (currentIndex - 1 + items.length) % items.length;
        } else if (event.key === "Enter") {
            event.preventDefault();
            if (currentIndex > -1) {
                brandSearch.value = items[currentIndex].text;
                selectedBrandCode.value = items[currentIndex].value;
                dropdown.style.display = "none";
            }
        }

        if (currentIndex > -1) {
            items[currentIndex].classList.add("highlight");
        }
    });

    document.addEventListener("click", function (event) {
        if (!brandSearch.contains(event.target) && !dropdown.contains(event.target)) {
            dropdown.style.display = "none";
        }
    });

    // searchBtn 조회 버튼 클릭 이벤트 리스너
    searchBtn.addEventListener("click", async function () {
        var brandCode = selectedBrandCode.value;
        var brandName = brandSearch.value;
        console.log(brandCode); // 로그 추가
        if (!brandCode || !brandName) {
            alert("브랜드를 선택해주세요.");
            return;
        }

        try {
            const saved_goods_list = await postData(`/${window.apiVersion}/product-data`, { brandCode: brandCode });
            console.log("Received data:", saved_goods_list); // 로그 추가
            if (!saved_goods_list || saved_goods_list.length === 0) {
                alert("조회할 상품이 없습니다.");
                return;
            }

            var tableBody = document.querySelector("#product-tbody");
            tableBody.innerHTML = ""; // 기존 테이블 내용 초기화

            function getPromotionPeriod(item) {
                if (item.coupon_end && item.coupon_end !== 'null') {
                    return item.coupon_end;
                }
                if (item.sale_end && item.sale_end !== 'null') {
                    return item.sale_end;
                }
                if (item.sale && item.sale !== 'null') {
                    return item.sale;
                }
                return '';
            }


            saved_goods_list.forEach(function (item, index) {
                var promotionPeriod = getPromotionPeriod(item);
                var row = document.createElement("tr");
                row.classList.add("expandable");
                row.setAttribute("data-origin-goods-code", item.origin_goods_code); // 속성 추가
                row.innerHTML = `
                    <td><button class="expand-btn" data-index="${index}">&#9660;</button></td>    
                    <td><input type="checkbox" class="parent-checkbox"></td>
                    <td class="table-cell">${item.market}</td>
                    <td class="table-cell">${item.brand}</td>
                    <td class="table-cell">${item.brand_code}</td>
                    <td class="table-cell">${item.origin_goods_code}</td>
                    <td><input type="text" class="input-cell" value="${item.origin_goods_name}"></td>
                    <td><input type="text" class="input-cell" value="${item.exposure_product_id || ''}"></td>
                    <td><input type="text" class="input-cell" value="${item.option_id || ''}"></td>
                    <td><input type="text" class="input-cell" value="${item.matching_option_id || ''}"></td>
                    <td class="table-cell">${item.sold_out}</td>
                    <td><input type="text" class="input-cell" value="${item.stock_option || ''}"></td>
                    <td class="table-cell">${item.total_price}</td>
                    <td><input type="text" class="input-cell" value="${item.origin_selling_price || 0}"></td>
                    <td><input type="text" class="input-cell" value="${item.selling_price || 0}"></td>
                    <td><input type="text" class="input-cell" value="${item.winner_price || 0}"></td>
                    <td><input type="text" class="input-cell" value="${item.lowest_price || 0}"></td>
                    <td><input type="text" class="input-cell" value="${item.maximum_price || 0}"></td>
                    <td class="table-cell">${promotionPeriod}</td>
                    <td><button class="btn btn-warning btn-table detail-btn">Details</button></td>
                    <td><button class="btn btn-info btn-table">Action</button></td>
                `;
                tableBody.appendChild(row);

                // 확장된 행 추가
                var expandedRow = document.createElement("tr");
                expandedRow.className = "expanded-row";
                expandedRow.style.display = "none";
                expandedRow.innerHTML = `
                    <td colspan="14">
                        <table class="table">
                            <thead>
                                <tr>
                                    <td></td>
                                    <td></td>
                                    <td></td>
                                    <td></td>
                                    <th>옵션명</th>
                                    <th>재고옵션</th>
                                    <th>옵션가</th>
                                    <th>할인가</th>
                                    <th>위너가</th>
                                    <th>최저가</th>
                                    <th>최고가</th>
                                    <th>재고</th>
                                    <td></td>
                                    <th>상품정보</th>
                                    <th>비고</th>
                                </tr>
                            </thead>
                            <tbody id="expanded-tbody">
                                <tr>
                                    <td><input type="checkbox" class="child-checkbox"></td>
                                    <td></td>
                                    <td></td>
                                    <td></td>
                                    <td><input type="text" class="input-cell" value="${item.origin_goods_name}"></td>
                                    <td><input type="text" value="" class="input-cell"></td>
                                    <td><input type="text" value="" class="input-cell"></td>
                                    <td><input type="text" class="input-cell" value="${item.market}"></td>
                                    <td><input type="text" value="" class="input-cell"></td>
                                    <td><input type="text" value="" class="input-cell"></td>
                                    <td><input type="text" value="" class="input-cell"></td>
                                    <td><input type="text" value="" class="input-cell"></td>
                                    <td></td>
                                    <td><button class="btn btn-warning btn-table detail-btn">Details</button></td>
                                    <td><button class="btn btn-info btn-table">Action</button></td>
                                </tr>
                            </tbody>
                        </table>
                    </td>
                `;
                tableBody.appendChild(expandedRow);
            });

            // 확장 버튼에 이벤트 리스너 추가
            var expandButtons = document.querySelectorAll(".expand-btn");
            expandButtons.forEach(function (button) {
                button.addEventListener("click", function () {
                    var index = this.getAttribute("data-index");
                    var expandedRow = document.querySelectorAll(".expanded-row")[index];
                    if (expandedRow.style.display === "none") {
                        expandedRow.style.display = "table-row";
                        this.innerHTML = "&#9650;"; // 변경된 아이콘
                    } else {
                        expandedRow.style.display = "none";
                        this.innerHTML = "&#9660;"; // 원래 아이콘
                    }
                });
            });

            // Details 버튼 클릭 시 사이드바 열고 닫기
            document.querySelectorAll(".detail-btn").forEach(button => {
                button.addEventListener("click", function (event) {
                    openNav(event, this);
                });
            });

        } catch (err) {
            console.error("Error fetching product data:", err);
            alert("상품 조회 중 오류가 발생했습니다.");
        }
    });

    // 수집동기화 버튼 클릭 이벤트 리스너
    syncCollectBtn.addEventListener("click", async function () {
        const checkedRows = document.querySelectorAll("#product-tbody tr.expandable .parent-checkbox:checked");
        const requestData = Array.from(checkedRows).map(row => {
            const tr = row.closest("tr");
            return {
                origin_goods_code: tr.querySelector("td:nth-child(6)").textContent.trim()
            };
        });

        if (requestData.length === 0) {
            alert("상품을 선택해주세요.");
            return;
        }

        // 콘솔에 인자 로깅
        console.log("Request Data:", requestData);

        try {
            const response = await postData(`/${window.apiVersion}/sync-collect-market`, requestData);
            const syncCollect = response.data;

            // 콘솔에 인자 로깅
            console.log("SyncReceived Data:", syncCollect);

            function getPromotionPeriod(item) {
                if (item.coupon_end && item.coupon_end !== 'null') {
                    return item.coupon_end;
                }
                if (item.sale_end && item.sale_end !== 'null') {
                    return item.sale_end;
                }
                if (item.sale && item.sale !== 'null') {
                    return item.sale;
                }
                return '';
            }

            // 수집 동기화된 데이터를 테이블에 반영
            for (const origin_goods_code in syncCollect) {
                if (syncCollect.hasOwnProperty(origin_goods_code)) {
                    const item = syncCollect[origin_goods_code];
                    console.log("Item Data:", item);
                    var promotionPeriod = getPromotionPeriod(item);  // item을 전달하여 promotionPeriod 계산
                    const row = document.querySelector(`#product-tbody tr[data-origin-goods-code="${origin_goods_code}"]`);
                    if (row) {
                        row.querySelector("td:nth-child(11)").textContent = item.sold_out || '';
                        row.querySelector("td:nth-child(13)").textContent = item.total_price || '';
                        row.querySelector("td:nth-child(19)").textContent = promotionPeriod || '';
                    }
                }
            }

            alert("수집 동기화 완료!");
        } catch (error) {
            console.error("Error syncing collec data:", error);
            alert("수집 동기화 중 오류가 발생했습니다.");
        }
    });

    // 판매동기화 버튼 클릭 이벤트 리스너
    syncSalesBtn.addEventListener("click", async function () {
        const checkedRows = document.querySelectorAll("#product-tbody tr.expandable .parent-checkbox:checked");
        const requestData = Array.from(checkedRows).map(row => {
            const tr = row.closest("tr");
            return {
                brand_code: tr.querySelector("td:nth-child(5)").textContent.trim(),
                origin_goods_code: tr.querySelector("td:nth-child(6)").textContent.trim(),
                matching_option_id: tr.querySelector("td:nth-child(10) input")?.value || ""
            };
        });

        if (requestData.length === 0) {
            alert("상품을 선택해주세요.");
            return;
        }

        // 빈값 또는 숫자가 아닌 경우 확인
        const invalidItems = requestData.filter(item => !item.matching_option_id || isNaN(parseInt(item.matching_option_id)));
        if (invalidItems.length > 0) {
            alert("일부 상품의 매칭 옵션 ID가 잘못되었습니다. 모든 매칭 옵션 ID를 올바르게 입력해주세요.");
            return;
        }

        // 콘솔에 인자 로깅
        console.log("Request Data:", requestData);

        try {
            const response = await postData(`/${window.apiVersion}/sync-winner-price`, requestData);
            const winnerPrices = response.data;

            // 위너가 데이터를 테이블에 반영
            for (const origin_goods_code in winnerPrices) {
                if (winnerPrices.hasOwnProperty(origin_goods_code)) {
                    const row = document.querySelector(`#product-tbody tr[data-origin-goods-code="${origin_goods_code}"]`);
                    if (row) {
                        row.querySelector("td:nth-child(16) input").value = winnerPrices[origin_goods_code].total_price || '';
                    }
                }
            }

            alert("판매 동기화 완료!");
        } catch (error) {
            console.error("Error syncing winner prices:", error);
            alert("판매 동기화 중 오류가 발생했습니다.");
        }
    });

    // Save 버튼 클릭 이벤트 리스너
    saveBtn.addEventListener("click", async function () {
        const tableRows = document.querySelectorAll("#product-tbody tr.expandable");
        const requestData = [];

        tableRows.forEach(row => {
            const parentCheckbox = row.querySelector(".parent-checkbox");
            if (parentCheckbox && parentCheckbox.checked) {  // 체크된 줄만 추가
                const data = {
                    market: row.querySelector("td:nth-child(3)").textContent.trim(),
                    brand: row.querySelector("td:nth-child(4)").textContent.trim(),
                    brand_code: row.querySelector("td:nth-child(5)").textContent.trim(),
                    origin_goods_code: row.querySelector("td:nth-child(6)").textContent.trim(),
                    origin_goods_name: row.querySelector("td:nth-child(7) input")?.value || "",
                    exposure_product_id: row.querySelector("td:nth-child(8) input")?.value || "",
                    option_id: row.querySelector("td:nth-child(9) input")?.value || "",
                    matching_option_id: row.querySelector("td:nth-child(10) input")?.value || "",
                    stock_status: row.querySelector("td:nth-child(11)").textContent.trim(),
                    stock_option: row.querySelector("td:nth-child(12) input")?.value || "",
                    total_price: row.querySelector("td:nth-child(13)").textContent.trim(),
                    origin_selling_price: parseInt(row.querySelector("td:nth-child(14) input")?.value) || 0,
                    selling_price: parseInt(row.querySelector("td:nth-child(15) input")?.value) || 0,
                    winner_price: parseInt(row.querySelector("td:nth-child(16) input")?.value) || 0,
                    lowest_price: parseInt(row.querySelector("td:nth-child(17) input")?.value) || 0,
                    maximum_price: parseInt(row.querySelector("td:nth-child(18) input")?.value) || 0,
                    promotion_period: row.querySelector("td:nth-child(19)").textContent.trim(),
                };
                requestData.push(data);
            }
        });

        console.log("Request Data:", requestData);

        try {
            const response = await postData(`/${window.apiVersion}/save-goods-table`, requestData);
            console.log("request data:", response.data);
            alert("Data successfully saved!");
        } catch (error) {
            console.error("Error saving data:", error);
            alert("Error saving data.");
        }
    });
});
