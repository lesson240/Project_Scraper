function toggleSidebar() {
    var sidebar = document.getElementById("sidebar");
    var main = document.getElementById("main");
    sidebar.classList.toggle("close");
    main.classList.toggle("close");
}

// Custom scripts for the project
document.addEventListener("DOMContentLoaded", function () {
    console.log("Custom scripts loaded!");
});
