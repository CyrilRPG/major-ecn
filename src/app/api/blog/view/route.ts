import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

export async function POST(req: NextRequest) {
  const { slug } = await req.json();
  if (!slug || typeof slug !== 'string') {
    return NextResponse.json({ error: 'slug required' }, { status: 400 });
  }

  const { data, error } = await supabase.rpc('increment_blog_view', { p_slug: slug });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ count: data });
}

export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get('slug');

  if (slug) {
    const { data } = await supabase
      .from('blog_views')
      .select('view_count')
      .eq('slug', slug)
      .maybeSingle();
    return NextResponse.json({ count: data?.view_count ?? 0 });
  }

  const { data } = await supabase
    .from('blog_views')
    .select('slug, view_count')
    .order('view_count', { ascending: false });
  return NextResponse.json({ views: data ?? [] });
}
