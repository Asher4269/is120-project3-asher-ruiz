# IS 120 - Project 3: Supabase

Asher Ruiz

## Supabase

Name: Budget-Pilot
My 5 columns are: id, User_Name(this would usually be a foreign key), Budget_Name (Also would be better to be a foreign key, but names the group of expenditures in a given budget), Type (Expense, Budget Allotment, or Savings Goal), Amount (The $ Amount of the line item)

## Brief Description of Budget Project:

My goal for this project was to fulfill my goal of creating an interactive budget website utilizing supabase. Even though I am not utilizing foreign keys to simplify tables, I will implement the idea of using user_names and budget_names as keys to access a group of data. The idea is that the user can create budgets in memory based on their name and the name of their budget. They will be able to add line items with individual names and expenditure amounts, which will be displayed in a separate box that lists out all of their expenses in an easy-to-read, beneficial table. It will also use regression to calculate gross income needed based on the listed expenses.

## What I learned while Building:

I have learned that constantly referencing a database is inefficient, so I tried to make the most out of each query that I made (I don't imagine its completely optimized). When I could, I would reference my variables to the DOM rather than making another query to the database. It seemed like a good strategy was query -> DOM -> User. And then the user can make several requests to the DOM, and the DOM goes to the database by querying as needed. It was pretty fun to visualize that whole process and give my little attempt at optimizing it.

## What was difficult:

Getting Local Storage to access column data to display user-specific budget lines was insanely difficult. Chat GPT taught me how to pull data relationally based on where they are .closest to the button. This is how I eventually got my delete button to pull from the row and then make the query to the database instead of putting that burden onto the user.

## Specifically, what did I learn about Supabase and CRUD:

I learned that designing a table base might be the most important part. It needs to be practical so that using crud to the database is as simple as it can be. I also learned how many amazing things we can do when we store things in a database.

## Anything I would like to add or change for Project 3 in future:

I might want to add little graphs to my budget program to show like interactive pie charts or something along those lines.
