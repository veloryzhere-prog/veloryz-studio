import {serveDesignAsset} from '../../../lib/design-asset-proxy';
export const dynamic='force-dynamic';
export async function GET(request:Request){
 return (await serveDesignAsset(request))||new Response('Preview asset not found',{status:404,headers:{'Cache-Control':'no-store'}});
}
