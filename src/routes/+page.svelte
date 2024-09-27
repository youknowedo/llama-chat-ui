<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Send } from 'lucide-svelte';

	let history: {
		message: string;
		from: 'user' | 'bob';
	}[] = [];
	let prompt = '';

	const submit = (e: SubmitEvent) => {
		e.preventDefault();

		history = [...history, { message: prompt, from: 'user' }];

		fetch('/api/chat', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(prompt)
		})
			.then((res) => res.json())
			.then((res) => (history = [...history, { message: res, from: 'bob' }]));

		prompt = '';
	};
</script>

<div class="flex h-screen flex-col">
	<div class="container flex-1 py-8">
		{#each history as { message, from }, i}
			<div class="flex gap-2">
				{#if from === 'user'}
					<div class="max-w-[50%] rounded-lg bg-primary p-2 text-primary-foreground">
						{message}
					</div>
					<div class="flex-1" />
				{:else}
					<div class="flex-1" />
					<div class="max-w-[50%] rounded-lg bg-muted p-2 text-muted-foreground">
						{message}
					</div>
				{/if}
			</div>
		{/each}
	</div>

	<div class="border-t py-4">
		<form class="container flex gap-2" on:submit={submit}>
			<Input placeholder="Message Bob" bind:value={prompt} />
			<Button type="submit" class="h-10 w-10 p-3" disabled={!prompt}>
				<Send />
			</Button>
		</form>
	</div>
</div>
