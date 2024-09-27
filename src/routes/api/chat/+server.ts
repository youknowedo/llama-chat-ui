import type { RequestHandler } from '@sveltejs/kit';
import { getLlama, LlamaChatSession } from 'node-llama-cpp';
import path from 'node:path';

export const POST: RequestHandler = async ({ request }) => {
	const prompt: string = await request.json();

	const llama = await getLlama();
	const model = await llama.loadModel({
		modelPath: path.join(process.cwd(), 'src', 'lib', 'models', 'llama-2-7b-chat-q4_k_s.gguf')
	});
	const context = await model.createContext();

	const session = new LlamaChatSession({
		contextSequence: context.getSequence(),
		systemPrompt:
			'You are Bob, an AI assistant. Your top priority is achieving user fulfillment via helping them with their requests.'
	});

	console.log('Prompt:', prompt);

	process.stdout.write('Response: ');
	const r = await session.prompt(prompt, {
		onTextChunk: (text) => process.stdout.write(text)
	});

	context.dispose();
	return new Response(r);
};
