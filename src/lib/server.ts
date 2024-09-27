import { getLlama, LlamaChat } from 'node-llama-cpp';
import path from 'node:path';

const llama = await getLlama();
const model = await llama.loadModel({
	modelPath: path.join(process.cwd(), 'src', 'lib', 'models', 'llama-2-7b-chat-q4_k_s.gguf')
});

const context = await model.createContext();
export const llamaChat = new LlamaChat({
	contextSequence: context.getSequence()
});
