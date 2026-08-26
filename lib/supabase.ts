import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseKey)

// Schema SQL para rodar no Supabase:
// 
// create table niggan_data (
//   id text primary key default 'main',
//   data jsonb not null,
//   updated_at timestamp default now()
// );
// insert into niggan_data (id, data) values ('main', '{}');
// alter table niggan_data enable row level security;
// create policy "allow all" on niggan_data for all using (true);
