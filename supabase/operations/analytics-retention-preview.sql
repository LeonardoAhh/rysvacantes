-- RETENTION IS DISABLED. This preview contains no DELETE, UPDATE, DDL or scheduler.
-- Historical statistics stay indefinitely until an explicit retention policy is approved.
begin read only;
with candidate_periods(days) as (values(30),(90),(180),(365))
select days as candidate_days,
  (select count(*) from public.site_visit_daily
    where visit_day < (now() at time zone 'America/Mexico_City')::date-days) as older_view_rows,
  (select count(*) from public.site_event_daily
    where event_day < (now() at time zone 'America/Mexico_City')::date-days) as older_event_rows
from candidate_periods order by days;
rollback;
