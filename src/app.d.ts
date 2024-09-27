import type { ChatHistoryItem } from 'node-llama-cpp';

// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

type LastEvaluation = {
	cleanHistory: ChatHistoryItem[];
	contextWindow: ChatHistoryItem[];
	contextShiftMetadata: object;
};

export { LastEvaluation };
