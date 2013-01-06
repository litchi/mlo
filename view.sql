CREATE VIEW task_view AS
select 
task.id as task_id, 
task.name as task_name,
task.status as task_status,
task.reminder_on as task_reminder_on,
task.next_reminder_time as task_reminder_time,
meta.id as meta_id,
meta.name as meta_name,
meta_type.id as meta_type_id,
meta_type.name as meta_type_name
from task 
join task_meta on task_meta.task_id = task.id 
join meta on task_meta.meta_id = meta.id 
join meta_type on meta_type.id = meta.meta_type_id;

CREATE VIEW meta_view AS
select 
meta.id as meta_id,
meta.name as meta_name,
meta_type.id as meta_type_id,
meta_type.name as meta_type_name,
meta_type.internal as internal
from meta
join meta_type on meta_type.id = meta.meta_type_id;
