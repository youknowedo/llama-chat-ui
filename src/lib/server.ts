import { getLlama, LlamaChat } from 'node-llama-cpp';
import path from 'node:path';

const llama = await getLlama();
const model = await llama.loadModel({
	modelPath: path.join(process.cwd(), 'src', 'lib', 'models', 'llama-3.2-3b-instruct-q4_k_m.gguf')
});

const context = await model.createContext();
export const llamaChat = new LlamaChat({
	contextSequence: context.getSequence()
});
