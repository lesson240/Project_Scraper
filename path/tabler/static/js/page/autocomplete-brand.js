// 전역 변수 선언
var brandCode = "";
var brandName = "";
var goodsCodes = [];
if (typeof window.apiVersion === 'undefined') {
    window.apiVersion = "v1"; // window.apiVersion을 사용하고, 없으면 "v1"을 기본값으로 설정
}

document.addEventListener("DOMContentLoaded", function () {
    var brandSearch = document.getElementById("brand-search");
    var dropdown = document.getElementById("brand-dropdown");
    var searchBtn = document.getElementById("search-btn");
    var collectBtn = document.getElementById("collect-btn");
    var selectedBrandCode = document.createElement("input");
    selectedBrandCode.type = "hidden";
    selectedBrandCode.id = "selected-brand-code";
    document.body.appendChild(selectedBrandCode);

    // 로딩 스피너 요소 생성 및 추가
    var loadingSpinner = document.createElement("img");
    loadingSpinner.id = "loading-spinner";
    loadingSpinner.src = "/static/images/loading.gif";
    loadingSpinner.style.display = "none";
    document.body.appendChild(loadingSpinner);

    // brandSearch 입력 시 드롭다운에 브랜드 옵션 표시
    brandSearch.addEventListener("input", async function () {
        var query = this.value;

        if (query.length === 0) {
            dropdown.style.display = "none";
            return;
        }

        try {
            const data = await fetchData(`/${window.apiVersion}/autocomplete/brands?query=${query}`);
            dropdown.innerHTML = "";
            if (data.brands.length > 0) {
                data.brands.forEach(function (brand) {
                    var option = document.createElement("option");
                    option.text = brand.brand;
                    option.value = brand.code;
                    dropdown.appendChild(option);
                });
                dropdown.style.display = "block";
            } else {
                dropdown.style.display = "none";
            }
        } catch (error) {
            console.error(error);
            dropdown.style.display = "none";
        }
    });

    // 드롭다운에서 옵션을 클릭하여 브랜드 선택
    dropdown.addEventListener("click", function (event) {
        if (event.target.tagName === "OPTION") {
            brandSearch.value = event.target.text;
            selectedBrandCode.value = event.target.value;
            dropdown.style.display = "none";
        }
    });

    // 상품 테이블에서 Enter 키로 옵션 선택
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

    // 영역 외 클릭 시 드롭다운 숨김
    document.addEventListener("click", function (event) {
        if (!brandSearch.contains(event.target) && !dropdown.contains(event.target)) {
            dropdown.style.display = "none";
        }
    });

    // 브랜드 검색 버튼 클릭 시 상품 수집
    searchBtn.addEventListener("click", function () {
        brandCode = selectedBrandCode.value;
        brandName = brandSearch.value;

        if (!brandCode || !brandName) {
            alert("브랜드를 선택해주세요.");
            return;
        }

        // 이전에 저장된 상품 리스트 초기화
        saved_goods_list = [];

        var tableBody = document.querySelector("#product-table tbody");
        if (!tableBody) {
            tableBody = document.createElement("tbody");
            document.querySelector("#product-table").appendChild(tableBody);
        }
        tableBody.innerHTML = `<tr><td colspan="7" style="text-align:center;"><img src="/static/images/loading.gif" id="loading-spinner"></td></tr>`;

        fetch(`/${window.apiVersion}/collect/brandshop?input_code=${brandCode}&input_brand=${brandName}`)
            .then(response => response.json())
            .then(response => {
                saved_goods_list = response.saved_goods_list;
                updateGoodsCodes(saved_goods_list); // 상품 코드 업데이트

                if (!saved_goods_list || saved_goods_list.length === 0) {
                    alert("수집된 상품이 없습니다.");
                    tableBody.innerHTML = "";
                    return;
                }

                tableBody.innerHTML = ""; // 테이블 내용 초기화

                saved_goods_list.forEach(function (item) {
                    var row = document.createElement("tr");
                    row.innerHTML = `
                        <td>${item.idx}</td>
                        <td>${item.origin_goods_name}</td>
                        <td>${item.origin_goods_code}</td>
                        <td>${item.total_price}</td>
                        <td>${item.sold_out}</td>
                        <td>${item.sale}</td>
                        <td>${item.coupon}</td>
                        <td>${item.collection_time}</td>
                    `;
                    tableBody.appendChild(row);
                });

                // 상품 수집 버튼 활성화
                collectBtn.disabled = false;
            })
            .catch(error => {
                console.error(error);
                alert("상품 수집 중 오류가 발생했습니다.");
                tableBody.innerHTML = "";
            });
    });

    // origin_goods_code를 업데이트하는 함수
    function updateGoodsCodes(savedGoodsList) {
        origin_goods_code = savedGoodsList.map(function (item) {
            return item.origin_goods_code;
        });
    }

    // 상품 수집 버튼 클릭 시 백그라운드 작업 시작
    collectBtn.addEventListener("click", function () {
        var brandCode = selectedBrandCode.value;
        var brandName = brandSearch.value;

        if (!brandCode || !brandName) {
            alert("브랜드를 선택해주세요.");
            return;
        }

        loadingSpinner.style.display = "block";
        startBackgroundTask(brandCode, brandName, origin_goods_code); // 백그라운드 작업 시작
    });

    // 모든 메뉴 항목에 이벤트 리스너 추가하여 페이지 전환 허용
    document.querySelectorAll(".menu a").forEach(function (menuLink) {
        menuLink.addEventListener("click", function () {
            // 백그라운드 작업 시작 후 페이지 전환 허용
            window.onbeforeunload = null;
        });
    });


    // 백그라운드 작업 시작
    function startBackgroundTask(brandCode, brandName, origin_goods_code) {
        console.log("Brand Code:", brandCode);
        console.log("Brand Name:", brandName);
        console.log("Goods Codes:", origin_goods_code);
        fetch(`/${window.apiVersion}/collect/brandgoodsdetail`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ brandCode: brandCode, brandName: brandName, goodsCodes: origin_goods_code })
        })
            .then(response => response.json())
            .then(response => {
                if (response.record_id) {
                    console.log("record_id:", response.record_id);
                    var recordId = response.record_id;
                    loadingSpinner.style.display = "none"; // 백그라운드 작업 시작 후 로딩 스피너 숨기기
                    // 페이지 전환 허용
                    window.onbeforeunload = null;
                }
            })
            .catch(error => {
                console.error("Error starting background task: ", error);
                loadingSpinner.style.display = "none";
                // 페이지 전환 허용
                window.onbeforeunload = null;
            });
    }
});
