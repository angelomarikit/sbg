-- Hide landing sections removed from the public homepage

update public.site_sections
set is_visible = false, updated_at = now()
where page_id = 'home' and section_key in ('formats', 'promotions');

update public.site_sections
set content_json = coalesce(content_json, '{}'::jsonb) || '{"secondaryCta":{"label":"Customer Stories","href":"#testimonials"}}'::jsonb
where page_id = 'home' and section_key = 'hero';