import { createContext } from '$lib/trpc/context';
import { chat } from '$lib/trpc/procedures/chat';
import { t } from '$lib/trpc/router';
import type { Handle } from '@sveltejs/kit';
import { createTRPCHandle } from 'trpc-sveltekit';

export const router = t.router({
	chat
});

export const handle: Handle = createTRPCHandle({ router, createContext });
