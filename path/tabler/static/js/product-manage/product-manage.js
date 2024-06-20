document.addEventListener("DOMContentLoaded", function () {
    console.log("Document loaded"); // 로그 추가
    var brandSearch = document.getElementById("brand-search");
    var dropdown = document.getElementById("brand-dropdown");
    var searchBtn = document.getElementById("search-btn"); // id로 선택자 변경
    var selectedBrandCode = document.createElement("input");
    selectedBrandCode.type = "hidden";
    selectedBrandCode.id = "selected-brand-code";
    document.body.appendChild(selectedBrandCode);

    brandSearch.addEventListener("input", function () {
        var query = this.value;

        if (query.length === 0) {
            dropdown.style.display = "none";
            return;
        }

        $.ajax({
            url: "/autocomplete/collectedbrands",
            method: "GET",
            data: { query: query },
            success: function (response) {
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
            },
            error: function (err) {
                console.error(err);
                dropdown.style.display = "none";
            }
        });
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

    searchBtn.addEventListener("click", function () { // searchBtn 변수 사용
        var brandCode = selectedBrandCode.value;
        var brandName = brandSearch.value;
        console.log(brandCode); // 로그 추가
        if (!brandCode || !brandName) {
            alert("브랜드를 선택해주세요.");
            return;
        }

        $.ajax({
            url: "/product-data",
            method: "POST",
            contentType: "application/json", // JSON 형식으로 보냄
            data: JSON.stringify({ brandCode: brandCode }), // brandCode를 데이터로 추가
            success: function (saved_goods_list) {
                console.log("Received data:", saved_goods_list); // 로그 추가
                if (!saved_goods_list || saved_goods_list.length === 0) {
                    alert("조회할 상품이 없습니다.");
                    return;
                }

                var tableBody = document.querySelector("#product-tbody");
                tableBody.innerHTML = ""; // 기존 테이블 내용 초기화

                saved_goods_list.forEach(function (item, index) {
                    var row = document.createElement("tr");
                    row.classList.add("expandable");
                    row.innerHTML = `
                        <td><button class="expand-btn" data-index="${index}">&#9660;</button></td>    
                        <td><input type="checkbox" class="parent-checkbox"></td>
                        <td><input type="text" class="input-cell" value="${item.market}"></td>
                        <td><input type="text" class="input-cell" value="${item.origin_goods_code}"></td>
                        <td><input type="text" class="input-cell" value="${item.origin_goods_name}"></td>
                        <td><input type="text" class="input-cell" value="stock_option"> </td>
                        <td><input type="text" class="input-cell" value="${item.total_price}"></td>
                        <td><input type="text" class="input-cell" value="selling_price"></td>
                        <td><input type="text" class="input-cell" value="winner_price"></td>
                        <td><input type="text" class="input-cell" value="lowest_price"></td>
                        <td><input type="text" class="input-cell" value="maximum_price"></td>
                        <td><input type="text" class="input-cell" value="stock_status"></td>
                        <td><input type="text" class="input-cell" value="promotion_period"></td>
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
                                        <th>옵션명</th>
                                        <th>재고옵션</th>
                                        <th>옵션가</th>
                                        <th>할인가</th>
                                        <th>위너가</th>
                                        <th>최저가</th>
                                        <th>최고가</th>
                                        <th>재고</th>
                                        <th>상품정보</th>
                                        <th>비고</th>
                                    </tr>
                                </thead>
                                <tbody id="expanded-tbody">
                                    <tr>
                                        <td><input type="checkbox" class="child-checkbox"></td>
                                        <td><input type="text" value="origrin_option_name" class="input-cell"></td>
                                        <td><input type="text" value="stock_option" class="input-cell"></td>
                                        <td><input type="text" class="input-cell" value="${item.market}"></td>
                                        <td><input type="text" value="selling_price" class="input-cell"></td>
                                        <td><input type="text" value="winner_price" class="input-cell"></td>
                                        <td><input type="text" value="maximum_price" class="input-cell"></td>
                                        <td><input type="text" values="stock_status" class="input-cell"></td>
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
            },
            error: function (err) {
                console.error(err);
                alert("상품 조회 중 오류가 발생했습니다.");
            }
        });
    });
});
