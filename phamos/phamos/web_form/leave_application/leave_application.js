frappe.ready(function() {
	frappe.call({
		method: "phamos.phamos.page.self_service_employee.self_service_employee.fetch_employee_info",
		args: {
			user_id: frappe.session.user
		},
		callback: function (r) {
			if (r.message) {
				data = r.message;
				frappe.web_form.set_value("employee", data.name);
                frappe.web_form.set_value("employee_name", data.employee_name);
                frappe.web_form.set_value("company", data.company);
				frappe.web_form.set_value("department", data.department);
				frappe.web_form.set_value("leave_approver", data.leave_approver);
			}
		},
	});


	frappe.web_form.on('leave_type', (field, value) => {
		fetch_leave_balance(data.name, value);
	});

	function fetch_form_values() {
		return {
			from_date: frappe.web_form.get_value("from_date"),
			to_date: frappe.web_form.get_value("to_date"),
			employee: frappe.web_form.get_value("employee"),
			leave_type: frappe.web_form.get_value("leave_type"),
			half_day: frappe.web_form.get_value("half_day"),
			half_day_date: frappe.web_form.get_value("half_day_date")
		};
	}

	frappe.web_form.on('from_date', (field, value) => {
		const { from_date, to_date, employee, leave_type, half_day, half_day_date } = fetch_form_values();
		calculate_total_days(from_date, to_date, employee, leave_type, half_day, half_day_date);
	});

	frappe.web_form.on('to_date', (field, value) => {
		const { from_date, to_date, employee, leave_type, half_day, half_day_date } = fetch_form_values();
		calculate_total_days(from_date, to_date, employee, leave_type, half_day, half_day_date);
	});

	frappe.web_form.on('half_day', (field, value) => {
		const { from_date, to_date, employee, leave_type, half_day, half_day_date } = fetch_form_values();
		
		if (half_day) {
			if (from_date == to_date) {
				frappe.web_form.set_value("half_day_date", from_date);
			} else {
				half_day_datepicker(half_day, from_date, to_date);
			}
		} else {
			frappe.web_form.set_value("half_day_date", "");
		}
		calculate_total_days(from_date, to_date, employee, leave_type, half_day, half_day_date);
	});

	frappe.web_form.on('half_day_date', (field, value) => {
		const { from_date, to_date, employee, leave_type, half_day, half_day_date } = fetch_form_values();
		calculate_total_days(from_date, to_date, employee, leave_type, half_day, half_day_date);
	});
});

function fetch_leave_balance(userId, leaveType){

	frappe.call({
		method: "hrms.hr.doctype.leave_application.leave_application.get_leave_details",
		args: {
			employee: userId,
			date: frappe.datetime.get_today(),
		},
		callback: function (r) {
			if (!r.exc && r.message["leave_allocation"]) {
				const leaveDetails = r.message["leave_allocation"];
				const remaining_leave = leaveDetails[leaveType]?.remaining_leaves;
				frappe.web_form.set_value("leave_balance", remaining_leave || 0);
			}
		},
	});

}

function calculate_total_days(from_date, to_date, employee, leave_type, half_day, half_day_date) {
	if (from_date && to_date && employee && leave_type) {
		return frappe.call({
			method: "hrms.hr.doctype.leave_application.leave_application.get_number_of_leave_days",
			args: {
				employee: employee,
				leave_type: leave_type,
				from_date: from_date,
				to_date: to_date,
				half_day: half_day,
				half_day_date: half_day_date,
			},
			callback: function (r) {
				if (r && r.message) {
					frappe.web_form.set_value("total_leave_days", r.message || 0);
				}
			},
		});
	}
}

function half_day_datepicker (half_day, from_date, to_date) {
	frappe.web_form.set_value("half_day_date", "");
	if (!(half_day && from_date && to_date)) return;

	const half_day_datepicker = frappe.web_form.fields_dict.half_day_date.datepicker;
	half_day_datepicker.update({
		minDate: frappe.datetime.str_to_obj(from_date),
		maxDate: frappe.datetime.str_to_obj(to_date),
	});
}