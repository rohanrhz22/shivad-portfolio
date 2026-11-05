import { env } from 'cloudflare:workers';
import { portfolioApi } from '../../../server/portfolio.mjs';
import ids from '../../../content/video-ids.json';
export const dynamic = 'force-dynamic';
export const GET = async (request: Request) => {
  // The starter provides an isolated mock identity only in local development.
  if (import.meta.env.DEV && request.headers.get('oai-authenticated-user-id') === 'local_seedy') {
    const headers = new Headers(request.headers);
    headers.set('oai-authenticated-user-email','rohanrameshdop@gmail.com');
    request = new Request(request.url,{method:request.method,headers,...(request.method==='GET'||request.method==='HEAD'?{}:{body:await request.text()})});
  }
  return portfolioApi(request,env,ids);
};
export const PUT = GET;
