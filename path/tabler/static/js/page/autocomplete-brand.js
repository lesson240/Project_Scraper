// 전역 변수 선언
var brandCode = "";
var brandName = "";
var goodsCodes = [];
if (typeof window.apiVersion === 'undefined') {
    window.apiVersion = "v1"; // window.apiVersion을 사용하고, 없으면 "v1"을 기본값으로 설정
}

// 사이트 탭 열기
function openSiteTab(evt, siteName) {
    var i, sitecontent, tablinks;
    sitecontent = document.getElementsByClassName("sitecontent");
    for (i = 0; i < sitecontent.length; i++) {
        sitecontent[i].style.display = "none";
    }
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
    document.getElementById(siteName).style.display = "block";
    evt.currentTarget.className += " active";
}

// 탭 열기
function openTab(evt, tabName) {
    var i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
    document.getElementById(tabName).style.display = "block";
    evt.currentTarget.className += " active";
}

// 페이지 로드 시 초기 탭 설정
document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("site-oliveyoung").click();
});

document.addEventListener("DOMContentLoaded", function () {
    var specialTodayBtnOliveyoung = document.getElementById("special-today-btn-oliveyoung");
    var collectBtnOliveyoung = document.getElementById("collect-btn-oliveyoung");

    var brandSearchOliveyoung = document.getElementById("brand-search-oliveyoung");
    var dropdownOliveyoung = document.getElementById("brand-dropdown-oliveyoung");

    var brandSearchMusinsa = document.getElementById("brand-search-musinsa");
    var dropdownMusinsa = document.getElementById("brand-dropdown-musinsa");
    var specialTodayBtnMusinsa = document.getElementById("special-today-btn-musinsa");
    var searchBtnMusinsa = document.getElementById("search-btn-musinsa");
    var collectBtnMusinsa = document.getElementById("collect-btn-musinsa");

    var selectedBrandCodeOliveyoung = document.createElement("input");
    selectedBrandCodeOliveyoung.type = "hidden";
    selectedBrandCodeOliveyoung.id = "selected-brand-code-oliveyoung";
    document.body.appendChild(selectedBrandCodeOliveyoung);

    var selectedBrandCodeMusinsa = document.createElement("input");
    selectedBrandCodeMusinsa.type = "hidden";
    selectedBrandCodeMusinsa.id = "selected-brand-code-musinsa";
    document.body.appendChild(selectedBrandCodeMusinsa);

    // 로딩 스피너 요소 생성 및 추가
    var loadingSpinner = document.createElement("img");
    loadingSpinner.id = "loading-spinner";
    loadingSpinner.src = "/static/images/loading.gif";
    loadingSpinner.style.display = "none";
    document.body.appendChild(loadingSpinner);

    // Oliveyoung brandSearch 입력 시 드롭다운에 브랜드 옵션 표시
    brandSearchOliveyoung.addEventListener("input", async function () {
        var query = this.value;

        if (query.length === 0) {
            dropdownOliveyoung.style.display = "none";
            return;
        }

        try {
            const data = await fetchData(`/${window.apiVersion}/autocomplete/brands?query=${query}`);
            dropdownOliveyoung.innerHTML = "";
            if (data.brands.length > 0) {
                data.brands.forEach(function (brand) {
                    var option = document.createElement("option");
                    option.text = brand.brand;
                    option.value = brand.code;
                    dropdownOliveyoung.appendChild(option);
                });
                dropdownOliveyoung.style.display = "block";
            } else {
                dropdownOliveyoung.style.display = "none";
            }
        } catch (error) {
            console.error(error);
            dropdownOliveyoung.style.display = "none";
        }
    });

    // Oliveyoung 드롭다운에서 옵션을 클릭하여 브랜드 선택
    dropdownOliveyoung.addEventListener("click", function (event) {
        if (event.target.tagName === "OPTION") {
            brandSearchOliveyoung.value = event.target.text;
            selectedBrandCodeOliveyoung.value = event.target.value;
            dropdownOliveyoung.style.display = "none";
        }
    });

    // Oliveyoung 상품 테이블에서 Enter 키로 옵션 선택
    brandSearchOliveyoung.addEventListener("keydown", function (event) {
        var items = dropdownOliveyoung.getElementsByTagName("option");
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
                brandSearchOliveyoung.value = items[currentIndex].text;
                selectedBrandCodeOliveyoung.value = items[currentIndex].value;
                dropdownOliveyoung.style.display = "none";
            }
        }

        if (currentIndex > -1) {
            items[currentIndex].classList.add("highlight");
        }
    });

    // Oliveyoung 영역 외 클릭 시 드롭다운 숨김
    document.addEventListener("click", function (event) {
        if (!brandSearchOliveyoung.contains(event.target) && !dropdownOliveyoung.contains(event.target)) {
            dropdownOliveyoung.style.display = "none";
        }
    });

    // Oliveyoung 브랜드 검색 버튼 클릭 시 상품 수집
    // searchBtnOliveyoung.addEventListener("click", function () {
    //     brandCode = selectedBrandCodeOliveyoung.value;
    //     brandName = brandSearchOliveyoung.value;

    //     if (!brandCode || !brandName) {
    //         alert("브랜드를 선택해주세요.");
    //         return;
    //     }

    //     // 이전에 저장된 상품 리스트 초기화
    //     saved_goods_list = [];

    //     var tableBody = document.querySelector("#product-table tbody");
    //     if (!tableBody) {
    //         tableBody = document.createElement("tbody");
    //         document.querySelector("#product-table").appendChild(tableBody);
    //     }
    //     tableBody.innerHTML = `<tr><td colspan="7" style="text-align:center;"><img src="/static/images/loading.gif" id="loading-spinner"></td></tr>`;

    //     fetch(`/${window.apiVersion}/collect/brandshop?input_code=${brandCode}&input_brand=${brandName}`)
    //         .then(response => response.json())
    //         .then(response => {
    //             saved_goods_list = response.saved_goods_list;
    //             updateGoodsCodes(saved_goods_list); // 상품 코드 업데이트

    //             if (!saved_goods_list || saved_goods_list.length === 0) {
    //                 alert("수집된 상품이 없습니다.");
    //                 tableBody.innerHTML = "";
    //                 return;
    //             }

    //             tableBody.innerHTML = ""; // 테이블 내용 초기화

    //             saved_goods_list.forEach(function (item) {
    //                 var row = document.createElement("tr");
    //                 row.innerHTML = `
    //                     <td>${item.idx}</td>
    //                     <td>${item.origin_goods_name}</td>
    //                     <td>${item.origin_goods_code}</td>
    //                     <td>${item.total_price}</td>
    //                     <td>${item.sold_out}</td>
    //                     <td>${item.sale}</td>
    //                     <td>${item.coupon}</td>
    //                     <td>${item.collection_time}</td>
    //                 `;
    //                 tableBody.appendChild(row);
    //             });

    //             // 상품 수집 버튼 활성화
    //             collectBtnOliveyoung.disabled = false;
    //         })
    //         .catch(error => {
    //             console.error(error);
    //             alert("상품 수집 중 오류가 발생했습니다.");
    //             tableBody.innerHTML = "";
    //         });
    // });


    // Oliveyoung 오늘의 특가 검색 버튼 클릭 시 상품 수집
    specialTodayBtnOliveyoung.addEventListener("click", function () {
        console.log("Special Today button clicked");
        var productGroupOliveyoung = document.getElementById("product-group-oliveyoung").value;
        var memoOliveyoung = document.getElementById("memo-oliveyoung").value;
        var duplicateHandlingOliveyoung = document.getElementById("duplicate-handling-oliveyoung").value;

        var requestBody = {
            group_name: productGroupOliveyoung,
            memo: memoOliveyoung,
            redundant: duplicateHandlingOliveyoung
        };

        console.log("Request Body:", JSON.stringify(requestBody));

        fetch(`/${window.apiVersion}/collect/specialtoday`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(requestBody)
        })
            .then(response => {
                if (response.status === 202) {
                    alert("수집 작업이 시작되었습니다.");
                } else {
                    return response.json().then(data => {
                        alert("수집 작업을 시작하는데 실패했습니다: " + data.message);
                    });
                }
            })
            .catch(error => {
                console.error("Error starting special today collection: ", error);
                alert("오류가 발생했습니다.");
            });
    });

    // Oliveyoung 상품 수집 버튼 클릭 시 백그라운드 작업 시작
    collectBtnOliveyoung.addEventListener("click", function () {
        var brandCode = selectedBrandCodeOliveyoung.value;
        var brandName = brandSearchOliveyoung.value;

        if (!brandCode || !brandName) {
            alert("브랜드를 선택해주세요.");
            return;
        }

        loadingSpinner.style.display = "block";
        startBackgroundTask(brandCode, brandName, origin_goods_code); // 백그라운드 작업 시작
    });

    // Musinsa brandSearch 입력 시 드롭다운에 브랜드 옵션 표시
    brandSearchMusinsa.addEventListener("input", async function () {
        var query = this.value;

        if (query.length === 0) {
            dropdownMusinsa.style.display = "none";
            return;
        }

        try {
            const data = await fetchData(`/${window.apiVersion}/autocomplete/brands?query=${query}`);
            dropdownMusinsa.innerHTML = "";
            if (data.brands.length > 0) {
                data.brands.forEach(function (brand) {
                    var option = document.createElement("option");
                    option.text = brand.brand;
                    option.value = brand.code;
                    dropdownMusinsa.appendChild(option);
                });
                dropdownMusinsa.style.display = "block";
            } else {
                dropdownMusinsa.style.display = "none";
            }
        } catch (error) {
            console.error(error);
            dropdownMusinsa.style.display = "none";
        }
    });

    // Musinsa 드롭다운에서 옵션을 클릭하여 브랜드 선택
    dropdownMusinsa.addEventListener("click", function (event) {
        if (event.target.tagName === "OPTION") {
            brandSearchMusinsa.value = event.target.text;
            selectedBrandCodeMusinsa.value = event.target.value;
            dropdownMusinsa.style.display = "none";
        }
    });

    // Musinsa 상품 테이블에서 Enter 키로 옵션 선택
    brandSearchMusinsa.addEventListener("keydown", function (event) {
        var items = dropdownMusinsa.getElementsByTagName("option");
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
                brandSearchMusinsa.value = items[currentIndex].text;
                selectedBrandCodeMusinsa.value = items[currentIndex].value;
                dropdownMusinsa.style.display = "none";
            }
        }

        if (currentIndex > -1) {
            items[currentIndex].classList.add("highlight");
        }
    });

    // Musinsa 영역 외 클릭 시 드롭다운 숨김
    document.addEventListener("click", function (event) {
        if (!brandSearchMusinsa.contains(event.target) && !dropdownMusinsa.contains(event.target)) {
            dropdownMusinsa.style.display = "none";
        }
    });

    // // Musinsa 브랜드 검색 버튼 클릭 시 상품 수집
    // searchBtnMusinsa.addEventListener("click", function () {
    //     brandCode = selectedBrandCodeMusinsa.value;
    //     brandName = brandSearchMusinsa.value;

    //     if (!brandCode || !brandName) {
    //         alert("브랜드를 선택해주세요.");
    //         return;
    //     }

    //     // 이전에 저장된 상품 리스트 초기화
    //     saved_goods_list = [];

    //     var tableBody = document.querySelector("#product-table tbody");
    //     if (!tableBody) {
    //         tableBody = document.createElement("tbody");
    //         document.querySelector("#product-table").appendChild(tableBody);
    //     }
    //     tableBody.innerHTML = `<tr><td colspan="7" style="text-align:center;"><img src="/static/images/loading.gif" id="loading-spinner"></td></tr>`;

    //     fetch(`/${window.apiVersion}/collect/brandshop?input_code=${brandCode}&input_brand=${brandName}`)
    //         .then(response => response.json())
    //         .then(response => {
    //             saved_goods_list = response.saved_goods_list;
    //             updateGoodsCodes(saved_goods_list); // 상품 코드 업데이트

    //             if (!saved_goods_list || saved_goods_list.length === 0) {
    //                 alert("수집된 상품이 없습니다.");
    //                 tableBody.innerHTML = "";
    //                 return;
    //             }

    //             tableBody.innerHTML = ""; // 테이블 내용 초기화

    //             saved_goods_list.forEach(function (item) {
    //                 var row = document.createElement("tr");
    //                 row.innerHTML = `
    //                     <td>${item.idx}</td>
    //                     <td>${item.origin_goods_name}</td>
    //                     <td>${item.origin_goods_code}</td>
    //                     <td>${item.total_price}</td>
    //                     <td>${item.sold_out}</td>
    //                     <td>${item.sale}</td>
    //                     <td>${item.coupon}</td>
    //                     <td>${item.collection_time}</td>
    //                 `;
    //                 tableBody.appendChild(row);
    //             });

    //             // 상품 수집 버튼 활성화
    //             collectBtnMusinsa.disabled = false;
    //         })
    //         .catch(error => {
    //             console.error(error);
    //             alert("상품 수집 중 오류가 발생했습니다.");
    //             tableBody.innerHTML = "";
    //         });
    // });

    // Musinsa 오늘의 특가 검색 버튼 클릭 시 상품 수집
    specialTodayBtnMusinsa.addEventListener("click", function () {
        var duplicateHandling = document.getElementById("duplicate-handling-musinsa").value;
        var memo = document.getElementById("memo-musinsa").value;
        var productGroup = document.getElementById("product-group-musinsa").value;
        var siteKey = document.querySelector('a.active[data-site]').getAttribute('value');

        fetch(`/${window.apiVersion}/collect/specialtoday`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                duplicate_handling: duplicateHandling,
                memo: memo,
                product_group: productGroup,
                site_key: siteKey
            })
        })
            .then(response => {
                if (response.status === 202) {
                    alert("수집 작업이 시작되었습니다.");
                } else {
                    alert("수집 작업을 시작하는데 실패했습니다.");
                }
            })
            .catch(error => {
                console.error("Error starting special today collection: ", error);
                alert("오류가 발생했습니다.");
            });
    });

    // Musinsa 상품 수집 버튼 클릭 시 백그라운드 작업 시작
    collectBtnMusinsa.addEventListener("click", function () {
        var brandCode = selectedBrandCodeMusinsa.value;
        var brandName = brandSearchMusinsa.value;

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
