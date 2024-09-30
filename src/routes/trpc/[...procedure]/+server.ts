import { createSvelteKitContext } from '$lib/trpc/context';
import { router } from '$lib/trpc/router';
import type { RequestHandler } from '@sveltejs/kit';
import { fetchRequestHandler } from '@trpc/server/adapters/fetch';

export const GET = ((event) =>
	fetchRequestHandler({
		req: event.request,
		router: router,
		endpoint: '/trpc',
		createContext: createSvelteKitContext(event.locals)
	})) satisfies RequestHandler;

export const POST = ((event) =>
	fetchRequestHandler({
		req: event.request,
		router: router,
		endpoint: '/trpc',
		createContext: createSvelteKitContext(event.locals)
	})) satisfies RequestHandler;
