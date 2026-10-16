create extension if not exists pg_trgm with schema extensions;

create table if not exists public.hadiths (
  id text primary key,
  topic text not null default '',
  hadith_text text not null,
  source text not null default '',
  narrator text,
  volume text,
  page text,
  search_text text not null,
  dataset_version uuid not null
);

create index if not exists hadiths_search_text_trgm_idx
  on public.hadiths using gin (search_text extensions.gin_trgm_ops);

alter table public.hadiths enable row level security;

revoke all on public.hadiths from anon, authenticated;
grant select on public.hadiths to anon, authenticated;
grant all on public.hadiths to service_role;

drop policy if exists "Hadiths are searchable by everyone" on public.hadiths;
create policy "Hadiths are searchable by everyone"
  on public.hadiths
  for select
  to anon, authenticated
  using (true);

create or replace function public.search_hadiths(search_query text, result_limit integer default 100)
returns table (
  id text,
  topic text,
  hadith_text text,
  source text,
  narrator text,
  volume text,
  page text,
  total_count bigint
)
language sql
stable
security invoker
set search_path = public, extensions
as $$
  with matched as (
    select
      h.id,
      h.topic,
      h.hadith_text,
      h.source,
      h.narrator,
      h.volume,
      h.page,
      count(*) over () as total_count
    from public.hadiths as h
    where coalesce(search_query, '') <> ''
      and (
        h.search_text ilike '%' || search_query || '%'
        or not exists (
          select 1
          from unnest(string_to_array(search_query, ' ')) as tokens(word)
          where word <> ''
            and h.search_text not ilike '%' || word || '%'
        )
      )
    order by
      case
        when h.hadith_text ilike '%' || search_query || '%' then 0
        when h.topic ilike '%' || search_query || '%' then 1
        else 2
      end,
      h.id
    limit greatest(1, least(coalesce(result_limit, 100), 100))
  )
  select
    matched.id,
    matched.topic,
    matched.hadith_text,
    matched.source,
    matched.narrator,
    matched.volume,
    matched.page,
    matched.total_count
  from matched;
$$;

revoke all on function public.search_hadiths(text, integer) from public;
grant execute on function public.search_hadiths(text, integer) to anon, authenticated;
