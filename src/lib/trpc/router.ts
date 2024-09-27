import type { Context } from '$lib/trpc/context';
import { initTRPC } from '@trpc/server';
import { router } from '../../hooks.server';

export const t = initTRPC.context<Context>().create();

export type Router = typeof router;
