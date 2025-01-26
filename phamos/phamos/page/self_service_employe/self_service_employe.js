frappe.pages['self-service-employe'].on_page_load = function(wrapper) {
    var page = frappe.ui.make_app_page({
        parent: wrapper,
        title: 'Self Service Employee',
        single_column: true
    });
    
    $(page.body).append(`
        <div class="form-tabs-list">
            <ul class="nav form-tabs" id="form-tabs" role="tablist">
                <li class="nav-item">
                    <a class="nav-link active" id="dashboard-tab" role="tab" aria-controls="dashboard" aria-selected="true">
                        Dashboard
                    </a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" id="leave-applications-tab" role="tab" aria-controls="leave-applications" aria-selected="false">
                        Leave Applications
                    </a>
                </li>
            </ul>
        </div>
        <div id="content-wrapper" style="margin-top: 20px;">
            <div id="tab-content"></div>
        </div>
    `);

    const dashboardTab = document.getElementById("dashboard-tab");
    const leaveApplicationsTab = document.getElementById("leave-applications-tab");
    const tabContent = document.getElementById("tab-content");

    dashboardTab.addEventListener("click", () => {
        setActiveTab(dashboardTab);
        showTabContent("dashboard");
    });

    leaveApplicationsTab.addEventListener("click", () => {
        setActiveTab(leaveApplicationsTab);
        showTabContent("leave-applications");
    });

    function setActiveTab(tab) {
        document.querySelectorAll(".form-tabs .nav-link").forEach((link) => {
            link.classList.remove("active");
            link.setAttribute("aria-selected", "false");
        });
        tab.classList.add("active");
        tab.setAttribute("aria-selected", "true");
    }

    function showTabContent(tab) {
        tabContent.innerHTML = "";
        if (tab === "dashboard") {
            tabContent.innerHTML = `
                <h3>Dashboard</h3>
                <p>Welcome, [Employee Name]!</p>
                <p>Remaining Leave: 5 days</p>
                <p>Next Absence Date: 2025-02-10</p>
            `;
        } else if (tab === "leave-applications") {
            tabContent.innerHTML = `
                <h3>Leave Applications</h3>
                <table class="table table-bordered">
                    <thead>
                        <tr>
                            <th>Leave Type</th>
                            <th>Total Allocated Leaves</th>
                            <th>Expired Leaves</th>
                            <th>Used Leaves</th>
                            <th>Leaves Pending Approval</th>
                            <th>Available Leaves</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Erholungsurlaub</td>
                            <td>30</td>
                            <td>0</td>
                            <td>0</td>
                            <td>0</td>
                            <td>30</td>
                        </tr>
                        <tr>
                            <td>Previous year</td>
                            <td>17</td>
                            <td>0</td>
                            <td>0</td>
                            <td>0</td>
                            <td>17</td>
                        </tr>
                    </tbody>
                </table>
            `;
        }
    }
    showTabContent("dashboard");
}