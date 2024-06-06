document.addEventListener("DOMContentLoaded", function () {
    var brandSearch = document.getElementById("brand-search");
    var dropdown = document.getElementById("brand-dropdown");
    var searchBtn = document.getElementById("search-btn");
    var collectBtn = document.getElementById("collect-btn");
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
            url: "/autocomplete/brands",
            method: "GET",
            data: { query: query },
            success: function (response) {
                dropdown.innerHTML = "";
                if (response.brands.length > 0) {
                    response.brands.forEach(function (brand) {
                        var option = document.createElement("option");
                        option.text = brand.brand;
                        option.value = brand.code;
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

    searchBtn.addEventListener("click", function () {
        var brandCode = selectedBrandCode.value;
        var brandName = brandSearch.value;
        if (!brandCode || !brandName) {
            alert("브랜드를 선택해주세요.");
            return;
        }

        var tableBody = document.querySelector("#product-table tbody");
        if (!tableBody) {
            tableBody = document.createElement("tbody");
            document.querySelector("#product-table").appendChild(tableBody);
        }
        tableBody.innerHTML = `<tr><td colspan="7" style="text-align:center;"><img src="/static/images/loading.gif" id="loading-spinner"></td></tr>`;

        $.ajax({
            url: "/collect/brandshop",
            method: "GET",
            data: { input_code: brandCode, input_brand: brandName },
            success: function (response) {
                var saved_goods_list = response.saved_goods_list;
                savedGoodsList = saved_goods_list; // 전역 변수에 저장


                if (!saved_goods_list || saved_goods_list.length === 0) {
                    alert("수집된 상품이 없습니다.");
                    tableBody.innerHTML = "";
                    return;
                }

                tableBody.innerHTML = ""; // 기존 테이블 내용 초기화

                saved_goods_list.forEach(function (item) {
                    var row = document.createElement("tr");
                    row.innerHTML = `
                        <td>${item.idx}</td>
                        <td>${item.name}</td>
                        <td>${item.code}</td>
                        <td>${item.price}</td>
                        <td>${item.sold_out}</td>
                        <td>${item.sale}</td>
                        <td>${item.coupon}</td>
                        <td>${item.collection_time}</td>
                    `;
                    tableBody.appendChild(row);
                });

            },
            error: function (err) {
                console.error(err);
                alert("상품 수집 중 오류가 발생했습니다.");
                tableBody.innerHTML = "";
            }
        });
    });

    collectBtn.addEventListener("click", function () {
        var brandCode = selectedBrandCode.value;
        var brandName = brandSearch.value;
        if (!brandCode || !brandName) {
            alert("브랜드를 선택해주세요.");
            return;
        }

        var loadingSpinner = document.getElementById("loading-spinner");
        if (loadingSpinner) {
            loadingSpinner.style.display = "block";
        }

        var goodsCodes = savedGoodsList.map(item => item.code);

        $.ajax({
            url: "/collect/brandgoodsdetail",
            method: "POST",
            contentType: "application/json",
            data: JSON.stringify({ goodsCodes: goodsCodes, brandCode: brandCode, brandName: brandName }), // 변경된 부분
            success: function (response) {
                console.log("상품 수집이 완료되었습니다.");
                if (loadingSpinner) {
                    loadingSpinner.style.display = "none";
                }
            },
            error: function (err) {
                console.error("상품 수집 중 오류가 발생했습니다.");
                if (loadingSpinner) {
                    loadingSpinner.style.display = "none";
                }
            }
        });
    });
});
