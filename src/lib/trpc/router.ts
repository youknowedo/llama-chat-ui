import { router as tRouter } from './context';
import { chat } from './procedures/chat';

export const router = tRouter({
	chat
});

export type Router = typeof router;
