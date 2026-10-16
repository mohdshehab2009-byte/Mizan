create index if not exists hadiths_topic_idx
  on public.hadiths (topic);

create index if not exists hadiths_topic_prefix_idx
  on public.hadiths (lower(topic) text_pattern_ops);

create or replace function public.search_hadiths_by_topic(
  search_query text,
  topic_filter text default '',
  result_limit integer default 100
)
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
    where (
        coalesce(topic_filter, '') = ''
        or h.topic = topic_filter
      )
      and (
        coalesce(search_query, '') = ''
        or h.search_text ilike '%' || search_query || '%'
        or not exists (
          select 1
          from unnest(string_to_array(search_query, ' ')) as tokens(word)
          where word <> ''
            and h.search_text not ilike '%' || word || '%'
        )
      )
    order by
      case
        when coalesce(search_query, '') = '' then 0
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

revoke all on function public.search_hadiths_by_topic(text, text, integer) from public;
grant execute on function public.search_hadiths_by_topic(text, text, integer) to anon, authenticated;

create or replace function public.search_hadith_topics(
  topic_query text default '',
  result_limit integer default 30
)
returns table (topic text)
language sql
stable
security invoker
set search_path = public
as $$
  select distinct h.topic
  from public.hadiths as h
  where btrim(h.topic) <> ''
    and (
      coalesce(topic_query, '') = ''
      or lower(h.topic) like lower(topic_query) || '%' escape '\'
    )
  order by h.topic
  limit greatest(1, least(coalesce(result_limit, 30), 30));
$$;

revoke all on function public.search_hadith_topics(text, integer) from public;
grant execute on function public.search_hadith_topics(text, integer) to anon, authenticated;

create or replace function public.get_daily_hadith(day_key text)
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
set search_path = public
as $$
  with row_count as (
    select count(*) as total
    from public.hadiths
  ),
  day_offsets as (
    select
      row_count.total,
      (
        (hashtextextended(day_key, 42) & 9223372036854775807)
        % nullif(row_count.total, 0)
      ) as today_offset,
      (
        (
          hashtextextended(
            to_char(to_date(day_key, 'YYYY-MM-DD') - 1, 'YYYY-MM-DD'),
            42
          )
          & 9223372036854775807
        )
        % nullif(row_count.total, 0)
      ) as previous_offset
    from row_count
  ),
  ranked as (
    select
      h.id,
      h.topic,
      h.hadith_text,
      h.source,
      h.narrator,
      h.volume,
      h.page,
      day_offsets.total,
      day_offsets.today_offset,
      day_offsets.previous_offset,
      row_number() over (order by h.id collate "C") as row_position
    from public.hadiths as h
    cross join day_offsets
    where day_offsets.total > 0
      and day_key ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$'
  ),
  selected as (
    select ranked.*
    from ranked
    where ranked.row_position = case
      when ranked.total > 1 and ranked.today_offset = ranked.previous_offset
        then (ranked.today_offset + 1) % ranked.total
      else ranked.today_offset
    end + 1
  )
  select
    selected.id,
    selected.topic,
    selected.hadith_text,
    selected.source,
    selected.narrator,
    selected.volume,
    selected.page,
    selected.total
  from selected;
$$;

revoke all on function public.get_daily_hadith(text) from public;
grant execute on function public.get_daily_hadith(text) to anon, authenticated;
