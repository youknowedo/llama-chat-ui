import { llamaChat } from '$lib/server';
import type { RequestHandler } from '@sveltejs/kit';
import type { LastEvaluation } from '../../../app';

export const POST: RequestHandler = async ({ request }) => {
	const data: LastEvaluation & { prompt: string } = await request.json();

	const chatHistory = data.cleanHistory;
	const chatHistoryContextWindow = data.contextWindow;
	const lastContextShiftMetadata = data.contextShiftMetadata;
	const prompt = data.prompt;

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

	return new Response(JSON.stringify(res.lastEvaluation));
};
