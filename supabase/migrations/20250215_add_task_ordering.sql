-- Add ordering columns to tasks table
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS order_index INTEGER DEFAULT 0;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS scheduled_time TIME;

-- Backfill existing routine tasks with order_index and scheduled_time from their templates
UPDATE tasks t
SET
  order_index = rt.order_index,
  scheduled_time = rt.start_time
FROM routine_templates rt
WHERE t.template_id = rt.id
  AND t.is_routine = true;
