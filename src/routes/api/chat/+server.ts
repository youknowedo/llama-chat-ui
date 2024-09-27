import type { RequestHandler } from '@sveltejs/kit';
import { getLlama, LlamaChat } from 'node-llama-cpp';
import path from 'node:path';
import type { LastEvaluation } from '../../../app';

export const POST: RequestHandler = async ({ request }) => {
	const data: LastEvaluation & { prompt: string } = await request.json();

	const chatHistory = data.cleanHistory;
	const chatHistoryContextWindow = data.contextWindow;
	const lastContextShiftMetadata = data.contextShiftMetadata;
	const prompt = data.prompt;

	const llama = await getLlama();
	const model = await llama.loadModel({
		modelPath: path.join(process.cwd(), 'src', 'lib', 'models', 'llama-2-7b-chat-q4_k_s.gguf')
	});
	const context = await model.createContext();
	const llamaChat = new LlamaChat({
		contextSequence: context.getSequence()
	});

	console.log('Prompt:', prompt);
	chatHistory.push({
		type: 'user',
		text: data.prompt
	});
	chatHistoryContextWindow.push({
		type: 'user',
		text: data.prompt
	});

	chatHistory.push({
		type: 'model',
		response: []
	});
	chatHistoryContextWindow.push({
		type: 'model',
		response: []
	});

	process.stdout.write('Response: ');
	const res = await llamaChat.generateResponse(chatHistory, {
		onTextChunk: (text) => process.stdout.write(text),
		contextShift: {
			lastEvaluationMetadata: lastContextShiftMetadata
		},
		lastEvaluationContextWindow: {
			history: chatHistoryContextWindow
		}
	});

	context.dispose();
	return new Response(JSON.stringify(res.lastEvaluation));
};
