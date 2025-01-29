import frappe
from frappe.utils import nowdate, getdate, today
from datetime import datetime


@frappe.whitelist()
def fetch_employee_info(user_id):
    employee = frappe.get_doc('Employee', {'user_id': user_id})
    return employee


@frappe.whitelist()
def get_next_absence_date():
    user = frappe.session.user
    employee = frappe.get_value("Employee", {"user_id": user}, "name")

    if not employee:
        frappe.throw("No employee record found for the logged-in user.")

    next_leave = frappe.get_all(
        "Leave Application",
        filters={
            "employee": employee,
            "status": "Approved",
            "from_date": (">=", nowdate())
        },
        fields=["from_date"],
        order_by="from_date asc",
        limit=1
    )
    
    if next_leave:
        formatted_date = next_leave[0].from_date.strftime("%b %d, %Y")
        return formatted_date
    else:
        return "None"
    

@frappe.whitelist()
def get_next_holiday():
    user = frappe.session.user
    employee = frappe.get_value("Employee", {"user_id": user}, "name")
    if not employee:
        frappe.throw("No employee record found for the current user.")

    holiday_list = frappe.get_value("Employee", employee, "holiday_list")
    if not holiday_list:
        frappe.throw("No holiday list assigned to the employee.")

    holidays = frappe.get_all(
        "Holiday",
        filters={"parent": holiday_list, "holiday_date": (">=", today())},
        fields=["holiday_date", "description"],
        order_by="holiday_date",
        limit=1
    )

    if holidays:
        formatted_date = holidays[0].holiday_date.strftime("%b %d, %Y")
        return formatted_date
    else:
        return "None"



@frappe.whitelist()
def get_permitted_cards(dashboard_name):
	permitted_cards = []
	dashboard = frappe.get_doc("Dashboard", dashboard_name)
	for card in dashboard.cards:
		if frappe.has_permission("Number Card", doc=card.card):
			permitted_cards.append(card)
	return permitted_cards