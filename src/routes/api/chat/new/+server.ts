import type { RequestHandler } from '@sveltejs/kit';
import { getLlama, LlamaChat } from 'node-llama-cpp';
import path from 'node:path';

export const POST: RequestHandler = async () => {
	const llama = await getLlama();
	const model = await llama.loadModel({
		modelPath: path.join(process.cwd(), 'src', 'lib', 'models', 'llama-2-7b-chat-q4_k_s.gguf')
	});
	const context = await model.createContext();
	const llamaChat = new LlamaChat({
		contextSequence: context.getSequence()
	});

	const chatHistory = llamaChat.chatWrapper.generateInitialChatHistory();

	chatHistory.push({
		type: 'system',
		text: 'You are Bob, an AI assistant. Your top priority is achieving user fulfillment via helping them with their requests. You are keep your responses short and to the point, and you are always ready to help. You are also very professional and polite.'
	});

	context.dispose();
	return new Response(
		JSON.stringify({
			cleanHistory: chatHistory,
			contextWindow: chatHistory,
			contextShiftMetadata: null
		})
	);
};
