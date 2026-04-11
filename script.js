// initialize database
const db = supabase.createClient(
  "https://picufxzhyglwmqukzyyl.supabase.co",
  "sb_publishable_51KQNADsbiEELlQxpjBBPQ_tRauQlrJ",
);

const body = document.querySelector("body");

// Display or Alter Budget Name on Display Div
const budget_name_display = document.querySelector(".budget-name");

// Category Display Tables
const table_expenses_cat = document.querySelector("#expenses-category");
const table_budgets_cat = document.querySelector("#budgets-category");
const table_savings_cat = document.querySelector("#savings-category");
const table_income_calc_ = document.querySelector("#income-calculator");

// Category Total Display Spans
const total_expenses_span = document.querySelector("#expenses-total");
const total_budgets_span = document.querySelector("#budgets-total");
const total_savings_span = document.querySelector("#savings-total");

// Input Elements
const user_name_inp = document.querySelector("#user_name");
const budget_name_inp = document.querySelector("#budget_name");
const type_inp = document.querySelector("#type");
const item_name_inp = document.querySelector("#name");
const amount_inp = document.querySelector("#amount");

// Crud Buttons [Update and Delete are made in budget-line generation]
const button_load_budget = document.querySelector(".load-budget");
const button_add_item = document.querySelector(".add-item");

// Income Calc Display Spans
const net_income_span = document.querySelector("#net-income");
const medicaid_span = document.querySelector("#medicaid");
const social_security_span = document.querySelector("#social-security");
const state_tax_span = document.querySelector("#state-tax");
const federal_tax_span = document.querySelector("#federal-tax");
const gross_income_span = document.querySelector("#gross-income");
const hourly_wage_span = document.querySelector(".hourly-wage");

// Database Table Name
let table_name = "Budget-Line-Items";

// For Net Income Calculation
let total_array_span = [
  total_expenses_span,
  total_budgets_span,
  total_savings_span,
];

// Tax Rates
const social_security_tax_rate = 0.062; // This technically stops at a little above 6 figures, but none of us are making that anyways rip.
const medicaid_tax_rate = 0.0145; // This can vary, will research more.
const state_tax_rate = 0.03; // Is this Utah's Tax Rate?
const federal_tax_bracket = [
  0, 0.1, 23850, 0.12, 96950, 0.22, 206700, 0.24, 394600, 0.32, 501050, 0.35,
  751600, 0.37, 100000000000000,
]; // THIS ASSUMES MARRIED LOL, I Could work on more robustness later. Also is for 2025. Will Adjust
const standardized_deduction = 29200; // Also assumes Married

// Read in all Data
async function get_all() {
  const { data, error } = await db.from(table_name).select("*");

  if (error) {
    console.error("Error fetching data:", error);
    return;
  }

  return data;
}

async function pull_user_budget() {
  let { get_user_name, get_budget_name } = get_user_info();

  if (!get_user_name || !get_budget_name) {
    alert("Please set a user name and budget name first!");
    return;
  }

  const { data, error } = await db
    .from(table_name)
    .select("*")
    .eq("User_Name", get_user_name)
    .eq("Budget_Name", get_budget_name);

  if (error) {
    console.error("Error fetching data:", error);
    return;
  }

  for (let line_item of data) {
    let get_type = line_item.Type;
    let get_line_name = line_item.Item_Name;
    let get_amount = line_item.Amount;

    display_row_in_table(get_type, get_line_name, get_amount);
  }

  let expenses_total = sum_category(table_expenses_cat);
  total_expenses_span.textContent = expenses_total;

  let budgets_total = sum_category(table_budgets_cat);
  total_budgets_span.textContent = budgets_total;

  let savings_total = sum_category(table_savings_cat);
  total_savings_span.textContent = savings_total;
}

function display_row_in_table(type, item_name, amount) {
  let tr = document.createElement("tr");
  let td1 = document.createElement("td");
  let td2 = document.createElement("td");

  let button_wrapper = document.createElement("div");

  let edit_button = document.createElement("button");

  let delete_button = document.createElement("button");

  delete_button.style.backgroundColor = "red";
  delete_button.addEventListener("click", delete_row);

  delete_button.dataset.item = item_name;
  delete_button.dataset.amount = amount;

  td1.textContent = item_name;
  td2.textContent = format_amount(amount);
  edit_button.textContent = "Edit";
  delete_button.textContent = "Delete";

  button_wrapper.appendChild(edit_button);
  button_wrapper.appendChild(delete_button);

  tr.appendChild(td1);
  tr.appendChild(td2);
  tr.appendChild(button_wrapper);

  if (type === "Expenses") {
    table_expenses_cat.appendChild(tr);
    let expenses_total = sum_category(table_expenses_cat);
    total_expenses_span.textContent = expenses_total;
  } else if (type === "Budgets") {
    table_budgets_cat.appendChild(tr);
    let budgets_total = sum_category(table_budgets_cat);
    total_budgets_span.textContent = budgets_total;
  } else {
    table_savings_cat.appendChild(tr);
    let savings_total = sum_category(table_savings_cat);
    total_savings_span.textContent = savings_total;
  }

  display_income_breakdown(total_array_span);
}

function sum_category(table_element) {
  let total = 0;

  let rows = table_element.querySelectorAll("tr");

  rows.forEach((row) => {
    let td_amount = row.children[1];
    if (!td_amount) return;

    let amount_value = stringMoney_to_float(td_amount.textContent);
    if (!isNaN(amount_value)) {
      total += amount_value;
    }
  });

  return format_amount(total);
}

// Insert Row(s)
async function insert_rows() {
  const { data, error } = await db
    .from(table_name)
    .insert([
      {
        User_Name: user_name_inp.value,
        Budget_Name: budget_name_inp.value,
        Type: type_inp.value,
        Item_Name: item_name_inp.value,
        Amount: amount_inp.value,
      },
    ])
    .select();

  if (error) {
    console.error("Insert failed:", error);
    return null;
  }

  display_row_in_table(type_inp.value, item_name_inp.value, amount_inp.value);

  display_income_breakdown(total_array_span);

  return data;
}

// Update Amount in Row by ID
async function update_row(row_id, updates) {
  const { data, error } = await db
    .from(table_name)
    .update(updates) // { Amount: 250.0 } is an example solid syntax here for the updates argument
    .eq("id", row_id)
    .select();

  if (error) {
    console.error("Update failed:", error);
    return null;
  }

  return data;
}

// Delete Row by user_name, budget_name, and item_name ###### SHOULD EXPAND THIS TO BE ABLE TO DELETE BUDGET_NAMES IN THEIR ENTIRETY
async function delete_row(e) {
  let { get_user_name, get_budget_name } = get_user_info();

  const button = e.target;

  const item_name = button.dataset.item;
  const amount = stringMoney_to_float(button.dataset.amount);

  const row = button.closest("tr");

  const { error } = await db
    .from(table_name)
    .delete()
    .eq("User_Name", get_user_name)
    .eq("Budget_Name", get_budget_name)
    .eq("Item_Name", item_name)
    .eq("Amount", amount);

  if (error) {
    console.error("Delete failed:", error);
  } else {
    row.remove(); // cool little function from chat
  }

  display_income_breakdown(total_array_span);
}

// FIGURE OUT HOW TO PROPERLY INCORPORATE THIS
function save_user_info() {
  localStorage.setItem("user_name", user_name_inp.value);
  localStorage.setItem("budget_name", budget_name_inp.value);
}

function get_user_info() {
  save_user_info();

  let saved_user_name = localStorage.getItem("user_name");
  let saved_budget_name = localStorage.getItem("budget_name");

  user_name_inp.value = saved_user_name || "";
  budget_name_inp.value = saved_budget_name || "";
  budget_name_display.textContent = saved_budget_name || "";

  return {
    get_user_name: saved_user_name || null,
    get_budget_name: saved_budget_name || null,
  };
}

function calculate_net_income(array_of_total_expense_spans) {
  let net_income = 0;

  for (let span of array_of_total_expense_spans) {
    let subtotal = span.textContent;
    let subtotal_value = stringMoney_to_float(subtotal);
    if (!isNaN(subtotal_value)) {
      net_income += subtotal_value;
    }
  }

  return net_income * 12;
}

function calculate_social_security_tax(gross_income) {
  return gross_income * social_security_tax_rate;
}

function calculate_medicaid_tax(gross_income) {
  return gross_income * medicaid_tax_rate;
}

function calculate_state_tax(gross_income) {
  return gross_income * state_tax_rate;
}

function calculate_federal_tax(gross_income) {
  let adjusted_gross_income = gross_income - standardized_deduction;
  let federal_payment = 0;

  for (let index = 0; index < federal_tax_bracket.length; index++) {
    let current_tax_percentage = federal_tax_bracket[index];

    if (index % 2 === 0) {
      continue;
    } else {
      let current_upper_bracket = federal_tax_bracket[index + 1];
      let current_lower_bracket = federal_tax_bracket[index - 1];

      let current_tax_owed;

      if (adjusted_gross_income >= current_upper_bracket) {
        current_tax_owed =
          (current_upper_bracket - current_lower_bracket) *
          current_tax_percentage;
      } else if (adjusted_gross_income > current_lower_bracket) {
        current_tax_owed =
          (adjusted_gross_income - current_lower_bracket) *
          current_tax_percentage;
      } else {
        current_tax_owed = 0;
        break;
      }

      federal_payment += current_tax_owed;
    }
  }
  return federal_payment;
}

function calculate_gross_income(
  net_income_needed,
  gross_income = net_income_needed,
) {
  deduction =
    calculate_social_security_tax(gross_income) +
    calculate_medicaid_tax(gross_income) +
    calculate_state_tax(gross_income) +
    calculate_federal_tax(gross_income);

  let checker = gross_income - deduction;

  let difference = checker - net_income_needed;

  if (net_income_needed === checker) {
    return gross_income;
  }

  let new_gross_income = gross_income - difference;

  return calculate_gross_income(net_income_needed, new_gross_income);
}

function deduce_hourly_wage(gross_income) {
  return gross_income / 2000;
}

function display_income_breakdown(array_of_total_expense_spans) {
  // 1. Get net income (already yearly from your function)
  let net_income = calculate_net_income(array_of_total_expense_spans);

  // 2. Calculate gross income needed
  let gross_income = calculate_gross_income(net_income);

  // 3. Calculate taxes
  let social_security = calculate_social_security_tax(gross_income);
  let medicaid = calculate_medicaid_tax(gross_income);
  let state_tax = calculate_state_tax(gross_income);
  let federal_tax = calculate_federal_tax(gross_income);
  let hourly_wage = deduce_hourly_wage(gross_income);

  // 4. Display everything
  net_income_span.textContent = format_amount(net_income);
  gross_income_span.textContent = format_amount(gross_income);
  social_security_span.textContent = format_amount(social_security);
  medicaid_span.textContent = format_amount(medicaid);
  state_tax_span.textContent = format_amount(state_tax);
  federal_tax_span.textContent = format_amount(federal_tax);
  hourly_wage_span.textContent = format_amount(hourly_wage);
}

function format_amount(value_amount) {
  return value_amount.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  }); // cool function from stack overflow
}

function stringMoney_to_float(amount) {
  return parseFloat(amount.replace(/[^0-9.-]+/g, ""));
}

get_all();

button_add_item.addEventListener("click", insert_rows);
button_load_budget.addEventListener("click", pull_user_budget);
