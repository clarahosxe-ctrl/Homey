-- Homey : à exécuter une fois dans Supabase (SQL Editor).
-- Pas de comptes : un foyer = un code secret. Les tables ne sont pas lisibles
-- directement (RLS sans policy) ; tout passe par les fonctions ci-dessous.

create table if not exists households (
  code text primary key,
  name text not null,
  created_at timestamptz not null default now()
);

create table if not exists docs (
  household text not null references households(code) on delete cascade,
  key text not null,
  value json not null,
  updated_at timestamptz not null default now(),
  primary key (household, key)
);

alter table households enable row level security;
alter table docs enable row level security;

create or replace function create_household(p_name text) returns text
language plpgsql security definer set search_path = public as $$
declare
  alphabet constant text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  c text;
begin
  loop
    c := '';
    for i in 1..8 loop
      c := c || substr(alphabet, 1 + floor(random() * length(alphabet))::int, 1);
    end loop;
    begin
      insert into households(code, name) values (c, left(p_name, 60));
      return c;
    exception when unique_violation then
      -- on retente avec un autre code
    end;
  end loop;
end $$;

create or replace function join_household(p_code text) returns text
language sql security definer set search_path = public as $$
  select name from households where code = upper(p_code);
$$;

create or replace function get_docs(p_code text)
returns table(key text, value json, updated_at timestamptz)
language sql security definer set search_path = public as $$
  select d.key, d.value, d.updated_at from docs d where d.household = upper(p_code);
$$;

create or replace function put_doc(p_code text, p_key text, p_value json) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not exists (select 1 from households where code = upper(p_code)) then
    raise exception 'foyer inconnu';
  end if;
  insert into docs(household, key, value, updated_at)
  values (upper(p_code), p_key, p_value, now())
  on conflict (household, key) do update set value = excluded.value, updated_at = now();
end $$;

grant execute on function create_household(text), join_household(text), get_docs(text), put_doc(text, text, json) to anon;

-- Photos (ajout) : lecture d'un seul document par clé. Les photos sont stockées comme des documents "photo-<id>".
create or replace function get_doc(p_code text, p_key text) returns json
language sql security definer set search_path = public as $$
  select value from docs where household = upper(p_code) and key = p_key;
$$;
grant execute on function get_doc(text, text) to anon;
