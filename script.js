// initialize database
// const db = supabase.createClient(
//   "https://picufxzhyglwmqukzyyl.supabase.co",
//   "sb_publishable_51KQNADsbiEELlQxpjBBPQ_tRauQlrJ",
// );

const body = document.querySelector("body");

// Display or Alter Budget Name on Display Div
const budget_name_display = document.querySelector(".budget-name");

// Category Display Divs
const div_expenses_cat = document.querySelector(".expenses-category");
const div_budgets_cat = document.querySelector(".budgets-category");
const div_savings_cat = document.querySelector(".savings-category");
const div_income_calc_ = document.querySelector(".income-calculator");

// Input Elements
const user_name_inp = document.querySelector("#user_name");
const budget_name_inp = document.querySelector("#budget_name");
const type_inp = document.querySelector("#type");
const item_name_inp = document.querySelector("#name");
const amount_inp = document.querySelector("#amount");

// Crud Buttons
const button_alter_item = document.querySelector(".alter-item");
const button_delete_item = document.querySelector(".delete-item");
const button_add_item = document.querySelector(".add-item");

// Database Table Name
let table_name = "Budget-Line-Items";

// Read in all Data
async function get_all() {
  const { data, error } = await db.from(table_name).select("*");
  console.log(data);

  if (error) {
    console.error("Error fetching data:", error);
    return;
  }

  return data;
}

// Insert Row(s)
async function insert_rows(user_name, budget_name, type, item_name, amount) {
  const { data, error } = await db
    .from(table_name)
    .insert([
      {
        User_Name: user_name,
        Budget_Name: budget_name,
        Type: type,
        Item_Name: item_name,
        Amount: amount,
      },
    ])
    .select();

  if (error) {
    console.error("Insert failed:", error);
    return null;
  }

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
  } else {
    user_name_inp.value = saved_user_name;
    budget_name_inp.value = saved_budget_name;
    budget_name_display.textContent = saved_budget_name;
  }
}

get_user_info();

button_add_item.addEventListener("click", save_user_info);
//get_all();
