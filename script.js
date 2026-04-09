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

// Crud Buttons
const button_alter_item = document.querySelector(".alter-item");
const button_load_budget = document.querySelector(".load-budget");
const button_add_item = document.querySelector(".add-item");

// Income Calc Display Spans
const net_income_span = document.querySelector("#net-income");
const medicaid_span = document.querySelector("#medicaid");
const social_security_span = document.querySelector("#social-security");
const state_tax_span = document.querySelector("#state-tax");
const federal_tax_span = document.querySelector("#federal-tax");
const gross_income_span = document.querySelector("#gross-income");

// Database Table Name
let table_name = "Budget-Line-Items";

// For Net Income Calculation
let total_array_span = [
  total_expenses_span,
  total_budgets_span,
  total_savings_span,
];

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

  td1.textContent = item_name;
  td2.textContent = amount;

  tr.appendChild(td1);
  tr.appendChild(td2);

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

  display_net_income(total_array_span);
}

function sum_category(table_element) {
  let total = 0;

  let rows = table_element.querySelectorAll("tr");

  rows.forEach((row) => {
    let td_amount = row.children[1];
    if (!td_amount) return;

    let amount_value = parseFloat(td_amount.textContent);
    if (!isNaN(amount_value)) {
      total += amount_value;
    }
  });

  return total;
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

  display_net_income(total_array_span);

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
async function delete_row(user_name, budget_name, item_name) {
  const { error } = await db
    .from(table_name)
    .delete()
    .eq("User_Name", user_name)
    .eq("Budget_Name", budget_name)
    .eq("Item_Name", item_name);

  if (error) {
    console.error("Delete failed:", error);
  }
}

// FIGURE OUT HOW TO PROPERLY INCORPORATE THIS
function save_user_info() {
  localStorage.setItem("user_name", user_name_inp.value);
  localStorage.setItem("budget_name", budget_name_inp.value);

  get_user_info();
}

function get_user_info() {
  let saved_user_name = localStorage.getItem("user_name");
  let saved_budget_name = localStorage.getItem("budget_name");

  if (saved_user_name === null) {
    return null;
  } else if (saved_budget_name === null) {
    user_name_inp.value = saved_user_name;
    return saved_user_name;
  } else {
    user_name_inp.value = saved_user_name;
    budget_name_inp.value = saved_budget_name;
    budget_name_display.textContent = saved_budget_name;
    return {
      get_user_name: saved_user_name,
      get_budget_name: saved_budget_name,
    };
  }
}

function calculate_net_income(array_of_total_expense_spans) {
  let net_income = 0;

  for (let span of array_of_total_expense_spans) {
    let subtotal = span.textContent;
    let subtotal_value = parseFloat(subtotal);
    if (!isNaN(subtotal_value)) {
      net_income += subtotal_value;
    }
  }

  return net_income * 12;
}

function display_net_income(array_of_total_expense_spans) {
  let get_net_income = calculate_net_income(array_of_total_expense_spans);

  net_income_span.textContent = "$" + get_net_income;
}

get_user_info();

button_add_item.addEventListener("click", insert_rows);
button_load_budget.addEventListener("click", pull_user_budget);
