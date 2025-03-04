
import { initEdgeStoreClient } from '@edgestore/server/core';
 // Import from the separate module
import { createEdgeStoreProvider } from "@edgestore/react"

import { initEdgeStore } from '@edgestore/server'

const es = initEdgeStore.create();

/**
 * This is the main router for the Edge Store buckets.
 */
export const edgeStoreRouter = es.router({
  mypublicImages: es.imageBucket(),

  mypublicVideos: es.fileBucket({
    maxSize: 1024 * 1024 * 80, // 80MB
    accept: ['video/*'], // Accept all video formats
}),

})

export const backendClient = initEdgeStoreClient({
  router: edgeStoreRouter,
});

/**
 * This type is used to create the type-safe client for the frontend.
 */
export type EdgeStoreRouter = typeof edgeStoreRouter;
