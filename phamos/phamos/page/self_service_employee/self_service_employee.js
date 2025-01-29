frappe.pages['self-service-employee'].on_page_load = function (wrapper) {
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
                <h4>Welcome, <span id="employee-name">[Employee Name]</span>!</h4>
                <div id="dashboard-cards" style="margin-top: 10px;"></div>
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
                    <tbody id="leave-balance-body"></tbody>
                </table>
            `;
            render_cards(document.getElementById("dashboard-cards"), [
                "Next Absence Date",
                "Next Holiday Date"
            ]);
            fetchLoggedUserInfo();
        } else if (tab === "leave-applications") {
            tabContent.innerHTML = `
                <div id="web-form-container"></div>
            `;
            appendWebform();
        }
    }

    function appendWebform() {
        const web_form_route = 'leave-application';
        const web_form_url = `/${web_form_route}?format=embedded`;

        const iframe_html = `
            <iframe src="${web_form_url}" width="100%" height="600" frameborder="0"></iframe>
            <style>
                /* Hide the header and footer of the web form */
                .web-header, footer.web-footer {
                    display: none !important;
                }
            </style>
        `;
        $('#web-form-container').html(iframe_html);
    }

    function fetchLoggedUserInfo() {
        frappe.call({
            method: "phamos.phamos.page.self_service_employee.self_service_employee.fetch_employee_info",
            args: {
                user_id: frappe.session.user
            },
            callback: function (r) {
                if (r.message) {
                    document.getElementById("employee-name").textContent = r.message.employee_name;
                    fetchLeaveBalance(r.message.name);
                } else {
                    frappe.msgprint("Error fetching employee id.");
                }
            },
        });
    }

    function fetchLeaveBalance(userId) {
        frappe.call({
            method: "hrms.hr.doctype.leave_application.leave_application.get_leave_details",
            args: {
                employee: userId,
                date: frappe.datetime.get_today(),
            },
            callback: function (r) {
                if (!r.exc && r.message["leave_allocation"]) {
                    const leaveDetails = r.message["leave_allocation"];
                    renderLeaveBalanceTable(leaveDetails);
                } else {
                    frappe.msgprint("Error fetching leave balance details.");
                }
            },
        });
    }

    function renderLeaveBalanceTable(leaveDetails) {
        const tableBody = document.getElementById("leave-balance-body");
        tableBody.innerHTML = "";

        for (const [leaveType, details] of Object.entries(leaveDetails)) {
            const row = document.createElement("tr");

            row.innerHTML = `
                <td>${leaveType}</td>
                <td>${details.total_leaves || 0}</td>
                <td>${details.expired_leaves || 0}</td>
                <td>${details.leaves_taken || 0}</td>
                <td>${details.leaves_pending_approval || 0}</td>
                <td>${details.remaining_leaves || 0}</td>
            `;

            tableBody.appendChild(row);
        }
    }

    function render_cards(wrapper, card_names) {
        return frappe.call({
            method: "phamos.phamos.page.self_service_employee.self_service_employee.get_permitted_cards",
            args: {
                dashboard_name: "Leave Management",
            },
            callback: function (response) {
                var cards = response.message;
                if (!cards || !cards.length) {
                    return;
                }

                var filtered_cards = cards.filter(function (card) {
                    return card_names.includes(card.card);
                });

                var number_cards = filtered_cards.map(function (card) {
                    return {
                        name: card.card,
                    };
                });

                var number_card_group = new frappe.widget.WidgetGroup({
                    container: wrapper,
                    type: "number_card",
                    columns: 3,
                    options: {
                        allow_sorting: false,
                        allow_create: false,
                        allow_delete: false,
                        allow_hiding: false,
                        allow_edit: false,
                    },
                    widgets: number_cards,
                });

                $(wrapper).find(".widget.number-widget-box").css({
                    width: "200px",
                });

                $(wrapper).find(".widget-group-body.grid-col-3").css({
                    display: "flex",
                    "flex-wrap": "nowrap",
                });
            },
        });
    }

    showTabContent("dashboard");
};