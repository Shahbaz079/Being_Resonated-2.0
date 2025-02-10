import { createEdgeStoreNextHandler } from '@edgestore/server/adapters/next/app';
import { edgeStoreRouter } from '@/lib/edgeStoreClient';

const handler = createEdgeStoreNextHandler({
  router: edgeStoreRouter,
});

export { handler as GET, handler as POST };
