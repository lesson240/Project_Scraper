function openNav(event, button) {
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
}

function closeNav() {
    const sidebar = document.getElementById("mySidebar");
    const mainContent = document.getElementById("main-content");
    sidebar.style.right = "-250px";
    mainContent.style.marginRight = "0";
    mainContent.style.marginLeft = "0";
    document.querySelectorAll('.detail-btn').forEach(btn => btn.classList.remove("active"));
}

document.querySelectorAll('.expand-btn').forEach(button => {
    button.addEventListener('click', event => {
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
    });
});

document.querySelectorAll('.parent-checkbox').forEach(checkbox => {
    checkbox.addEventListener('change', function () {
        const isChecked = this.checked;
        const row = this.closest('tr');
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
    });
});

document.querySelectorAll('.child-checkbox').forEach(checkbox => {
    checkbox.addEventListener('change', function () {
        const expandedRow = this.closest('.expanded-row');
        const parentCheckbox = expandedRow.previousElementSibling.querySelector('.parent-checkbox');
        const allChecked = Array.from(expandedRow.querySelectorAll('.child-checkbox')).every(checkbox => checkbox.checked);
        parentCheckbox.checked = allChecked;
        if (this.checked) {
            this.closest('tr').classList.add('selected-row');
        } else {
            this.closest('tr').classList.remove('selected-row');
        }
    });
});

document.querySelectorAll('.detail-btn').forEach(button => {
    button.addEventListener('click', function (event) {
        openNav(event, button);
    });
});
