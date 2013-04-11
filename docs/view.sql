CREATE TABLE _migrator_schema(version integer);

CREATE TABLE meta (id integer primary key autoincrement, meta_type_id integer, name text, description text, ui_rank integer default 0, unique(meta_type_id, name));

CREATE TABLE meta_type (id integer primary key autoincrement, name text, description text, internal integer default 0);

CREATE TABLE task (id integer primary key autoincrement, name text, status text default 'New', reminder_on integer, due_date integer, reminder_date integer);

CREATE TABLE task_meta (id INTEGER PRIMARY KEY AUTOINCREMENT, task_id int, meta_id int);

CREATE TABLE task_note (id integer primary key autoincrement, task_id int, content text, create_date integer);

create TABLE setting(id integer primary key autoincrement, key text not null, value text not null, unique(key))

CREATE VIEW meta_view AS select meta.id as meta_id, meta.name as meta_name, meta.description as meta_description, meta.ui_rank as meta_ui_rank, meta_type.id as meta_type_id, meta_type.name as meta_type_name, meta_type.description as meta_type_description, meta_type.internal as meta_type_internal from meta join meta_type on meta_type.id = meta.meta_type_id;

CREATE VIEW task_view AS select task.id as task_id, task.name as task_name, task.status as task_status, task.reminder_date as task_reminder_date, task.due_date as task_due_date, meta.id as meta_id, meta.name as meta_name, meta_type.id as meta_type_id, meta_type.name as meta_type_name from task join task_meta on task_meta.task_id = task.id join meta on task_meta.meta_id = meta.id join meta_type on meta_type.id = meta.meta_type_id;
