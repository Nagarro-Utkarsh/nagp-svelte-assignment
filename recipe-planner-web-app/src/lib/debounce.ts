interface Debounced<A extends unknown[]> {
	(...args: A): void;
	cancel(): void;
}

export function debounce<A extends unknown[]>(fn: (...args: A) => void, delay = 300): Debounced<A> {
	let timer: ReturnType<typeof setTimeout> | undefined;

	const run = (...args: A) => {
		clearTimeout(timer);
		timer = setTimeout(() => fn(...args), delay);
	};

	run.cancel = () => clearTimeout(timer);

	return run;
}
