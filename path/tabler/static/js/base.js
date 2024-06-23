window.apiVersion = window.apiVersion || "v1";

window.fetchData = async function (url) {
    const response = await axios.get(url);
    return response.data;
};

window.postData = async function (url, data) {
    try {
        const response = await axios.post(url, data);
        return response.data;
    } catch (error) {
        console.error('Error posting data:', error);
        throw error;
    }
};

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

window.closeNav = function () {
    const sidebar = document.getElementById("mySidebar");
    const mainContent = document.getElementById("main-content");
    sidebar.style.right = "-250px";
    mainContent.style.marginRight = "0";
    mainContent.style.marginLeft = "0";
    document.querySelectorAll('.detail-btn').forEach(btn => btn.classList.remove("active"));
};

window.handleExpandButtons = function (event, button) {
    event.stopPropagation();
    const row = button.closest('tr');
    const expandedRow = row.nextElementSibling;

    if (expandedRow.classList.contains('show')) {
        expandedRow.classList.remove('show');
        button.innerHTML = '&#9660;';
    } else {
        expandedRow.classList.add('show');
        button.innerHTML = '&#9650;';
    }
};

window.handleCheckboxes = function (checkbox) {
    const isChecked = checkbox.checked;
    const row = checkbox.closest('tr');
    const expandedRow = row.nextElementSibling;
    const childCheckboxes = expandedRow.querySelectorAll('.child-checkbox');
    childCheckboxes.forEach(childCheckbox => {
        childCheckbox.checked = isChecked;
    });
    if (isChecked) {
        row.classList.add('selected-row');
        expandedRow.classList.add('selected-row');
    } else {
        row.classList.remove('selected-row');
        expandedRow.classList.remove('selected-row');
    }
};

document.querySelectorAll('.expand-btn').forEach(button => {
    button.addEventListener('click', event => {
        handleExpandButtons(event, button);
    });
});

document.querySelectorAll('.parent-checkbox').forEach(checkbox => {
    checkbox.addEventListener('change', function () {
        handleCheckboxes(this);
    });
});

document.querySelectorAll('.child-checkbox').forEach(checkbox => {
    checkbox.addEventListener('change', function () {
        handleCheckboxes(this);
    });
});

document.querySelectorAll('.detail-btn').forEach(button => {
    button.addEventListener('click', function (event) {
        openNav(event, button);
    });
});
