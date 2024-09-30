import { llamaChat } from '$lib/server';
import { observable } from '@trpc/server/observable';
import type { ChatHistoryItem } from 'node-llama-cpp';
import { z, ZodType } from 'zod';
import type { LastEvaluation } from '../../../app';
import { publicProcedure, router } from '../context';

const historyItem: ZodType<ChatHistoryItem> = z.union([
	z.object({
		type: z.literal('system'),
		text: z.string()
	}),
	z.object({
		type: z.literal('user'),
		text: z.string()
	}),
	z.object({
		type: z.literal('model'),
		response: z.array(z.string())
	})
]);

export const chat = router({
	create: publicProcedure.mutation(() => {
		const chatHistory = llamaChat.chatWrapper.generateInitialChatHistory();

		chatHistory.push({
			type: 'system',
			text: 'You are Bob, an AI assistant. Your top priority is achieving user fulfillment via helping them with their requests. You are keep your responses short and to the point, and you are always ready to help. You are also very professional and polite.'
		});

		return {
			cleanHistory: chatHistory,
			contextWindow: chatHistory,
			contextShiftMetadata: null
		};
	}),
	prompt: publicProcedure
		.input(
			z.object({
				cleanHistory: z.array(historyItem),
				contextWindow: z.array(historyItem),
				contextShiftMetadata: z.nullable(z.any()),
				prompt: z.string()
			})
		)
		.mutation(async ({ input }) => {
			const chatHistory = input.cleanHistory;
			const chatHistoryContextWindow = input.contextWindow;
			const lastContextShiftMetadata = input.contextShiftMetadata;
			const prompt = input.prompt;

			console.log('Prompt:', prompt);
			chatHistory.push({
				type: 'user',
				text: input.prompt
			});
			chatHistoryContextWindow.push({
				type: 'user',
				text: input.prompt
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

			return res.lastEvaluation;
		}),
	promptAsync: publicProcedure
		.input(
			z.object({
				cleanHistory: z.array(historyItem),
				contextWindow: z.array(historyItem),
				contextShiftMetadata: z.nullable(z.any()),
				prompt: z.string()
			})
		)
		.subscription(({ input, signal }) => {
			return observable<
				{ type: 'chunk'; text: string } | { type: 'eval'; lastEval: LastEvaluation }
			>((emit) => {
				const chatHistory = input.cleanHistory;
				const chatHistoryContextWindow = input.contextWindow;
				const lastContextShiftMetadata = input.contextShiftMetadata;
				const prompt = input.prompt;

				console.log('Prompt:', prompt);
				chatHistory.push({
					type: 'user',
					text: input.prompt
				});
				chatHistoryContextWindow.push({
					type: 'user',
					text: input.prompt
				});

				chatHistory.push({
					type: 'model',
					response: []
				});
				chatHistoryContextWindow.push({
					type: 'model',
					response: []
				});

				(async () => {
					const res = await llamaChat.generateResponse(chatHistory, {
						onTextChunk: (text) =>
							emit.next({
								type: 'chunk',
								text
							}),
						signal,
						contextShift: {
							lastEvaluationMetadata: lastContextShiftMetadata
						},
						lastEvaluationContextWindow: {
							history: chatHistoryContextWindow
						}
					});

					emit.next({
						type: 'eval',
						lastEval: res.lastEvaluation
					});
				})();

				return () => {};
			});
		})
});
