'use client'

import { type EdgeStoreRouter}  from "@/lib/edgeStoreClient"
import { createEdgeStoreProvider } from "@edgestore/react"

export const {EdgeStoreProvider,useEdgeStore}=createEdgeStoreProvider<EdgeStoreRouter>();

