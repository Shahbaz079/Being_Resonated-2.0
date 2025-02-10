import { initEdgeStoreClient } from '@edgestore/server/core';
import { edgeStoreRouter } from '../app/api/edgestore/[...edgestore]/route'; // Correct import

export const backendClient = initEdgeStoreClient({
  router: edgeStoreRouter,
});

/**
 * This type is used to create the type-safe client for the frontend.
 */
export type EdgeStoreRouter = typeof edgeStoreRouter;
