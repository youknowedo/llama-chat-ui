import { llamaChat } from '$lib/server';
import type { RequestHandler } from '@sveltejs/kit';

export const POST: RequestHandler = async () => {
	const chatHistory = llamaChat.chatWrapper.generateInitialChatHistory();

	chatHistory.push({
		type: 'system',
		text: 'You are Bob, an AI assistant. Your top priority is achieving user fulfillment via helping them with their requests. You are keep your responses short and to the point, and you are always ready to help. You are also very professional and polite.'
	});

	return new Response(
		JSON.stringify({
			cleanHistory: chatHistory,
			contextWindow: chatHistory,
			contextShiftMetadata: null
		})
	);
};
