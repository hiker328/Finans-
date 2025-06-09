| table_name    | column_name        | data_type                |
| ------------- | ------------------ | ------------------------ |
| categories    | id                 | uuid                     |
| categories    | name               | text                     |
| categories    | monthly_limit      | numeric                  |
| categories    | color              | text                     |
| categories    | created_at         | timestamp with time zone |
| expenses      | id                 | uuid                     |
| expenses      | name               | text                     |
| expenses      | amount             | numeric                  |
| expenses      | due_date           | date                     |
| expenses      | is_recurring       | boolean                  |
| expenses      | recurrence_count   | integer                  |
| expenses      | current_recurrence | integer                  |
| expenses      | was_paid           | boolean                  |
| expenses      | paid_at            | date                     |
| expenses      | created_at         | timestamp with time zone |
| income        | id                 | uuid                     |
| income        | description        | text                     |
| income        | amount             | numeric                  |
| income        | date               | date                     |
| income        | is_recurring       | boolean                  |
| income        | recurring_day      | integer                  |
| income        | active             | boolean                  |
| income        | created_at         | timestamp with time zone |
| months        | id                 | uuid                     |
| months        | year               | integer                  |
| months        | month              | integer                  |
| months        | label              | text                     |
| months        | created_at         | timestamp with time zone |
| savings_goals | id                 | uuid                     |
| savings_goals | name               | text                     |
| savings_goals | goal_amount        | numeric                  |
| savings_goals | current_amount     | numeric                  |
| savings_goals | deadline           | date                     |
| savings_goals | created_at         | timestamp with time zone |
| transactions  | id                 | uuid                     |
| transactions  | category_id        | uuid                     |
| transactions  | amount             | numeric                  |
| transactions  | description        | text                     |
| transactions  | date               | date                     |
| transactions  | created_at         | timestamp with time zone |