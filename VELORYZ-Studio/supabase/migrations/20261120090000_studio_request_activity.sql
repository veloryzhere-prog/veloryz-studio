create table if not exists veloryz_studio.studio_request_events(
 request_id text not null references veloryz_studio.studio_enquiries(id) on delete cascade,
 version integer not null, status text not null, notes text not null, recorded_at text not null,
 primary key(request_id,version));
alter table veloryz_studio.studio_request_events enable row level security;
grant select,insert on veloryz_studio.studio_request_events to service_role;
create or replace function veloryz_studio.record_request_event() returns trigger language plpgsql security invoker set search_path='' as $$
begin
 insert into veloryz_studio.studio_request_events values(new.id,new.version,new.status,new.notes,new.updated_at);
 return new;
end $$;
create trigger studio_request_activity after insert or update of version on veloryz_studio.studio_enquiries for each row execute function veloryz_studio.record_request_event();
insert into veloryz_studio.studio_request_events select id,version,status,notes,updated_at from veloryz_studio.studio_enquiries on conflict do nothing;
create unique index enquiry_confirmed_appointment on veloryz_studio.studio_enquiries(preferred_date,preferred_time) where status='confirmed' and preferred_date<>'';
drop index veloryz_studio.enquiry_confirmed_slot;
insert into veloryz_studio.query_contracts values ('b454c06e8768e460f1bbb545d4773fb872a356ae36ee16f4fa879a79209ff592',$q$SELECT status,notes,recorded_at FROM veloryz_studio.studio_request_events WHERE request_id=? ORDER BY version DESC LIMIT 100$q$);
