import html from '../content/index.html?raw';
import career from '../content/career.html?raw';
export function GET() {
  return new Response(html.replace('<!-- CAREER_PROFILE -->', career), { headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' } });
}
