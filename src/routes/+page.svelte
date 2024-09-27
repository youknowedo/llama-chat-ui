<script lang="ts">
	import { page } from '$app/stores';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Skeleton } from '$lib/components/ui/skeleton';
	import { trpc } from '$lib/trpc/client';
	import { Send } from 'lucide-svelte';
	import Loader from 'lucide-svelte/icons/loader';
	import type { ChatHistoryItem } from 'node-llama-cpp';
	import { onMount } from 'svelte';
	import type { LastEvaluation } from '../app';

	let history: ChatHistoryItem[] = [];
	let contextWindow: ChatHistoryItem[] = [];
	let prompt = '';
	let generating = false;

	const newChat = async (e: SubmitEvent) => {
		e.preventDefault();

		generating = true;
		trpc($page)
			.chat.prompt.mutate({
				prompt,
				cleanHistory: history,
				contextWindow
			})
			.then((res) => {
				history = res.cleanHistory as ChatHistoryItem[];
				contextWindow = res.contextWindow as ChatHistoryItem[];
				generating = false;
			});

		history = [...history, { type: 'user', text: prompt }];
		prompt = '';
	};

	onMount(async () => {
		generating = true;
		await trpc($page)
			.chat.create.mutate()
			.then((res) => {
				history = res.cleanHistory as ChatHistoryItem[];
				contextWindow = res.contextWindow as ChatHistoryItem[];
			});
		generating = false;
	});
</script>

<div class="flex h-screen flex-col">
	<div class="h-[calc(100vh-5rem)] overflow-y-scroll py-8">
		<div class="container">
			{#each history as message, i}
				<div class="flex">
					{#if message.type === 'user'}
						<div class="max-w-[50%] rounded-lg bg-primary p-2 text-primary-foreground">
							{message.text}
						</div>
						<div class="flex-1" />
					{:else if message.type === 'model'}
						<div class="flex-1" />
						<div class="max-w-[50%] rounded-lg bg-muted p-2 text-muted-foreground">
							{message.response}
						</div>
					{/if}
				</div>
			{/each}

			{#if generating}
				<div class="flex">
					<div class="flex-1" />
					<Skeleton class="h-10 w-1/4" />
				</div>
			{/if}
		</div>
	</div>

	<div class="border-t">
		<form class="container flex h-20 items-center gap-2" on:submit={newChat}>
			<Input placeholder="Message Bob" bind:value={prompt} />
			<Button type="submit" class="h-10 w-10 p-3" disabled={!prompt || generating}>
				{#if generating}
					<Loader class="spinner" />
				{:else}
					<Send />
				{/if}
			</Button>
		</form>
	</div>
</div>

<style>
	:global(.spinner) {
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		0% {
			transform: rotate(0deg);
		}
		100% {
			transform: rotate(360deg);
		}
	}
</style>
