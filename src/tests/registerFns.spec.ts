import tape from 'tape';
import { constant, fn } from '..';

tape('registerFns. Basic functionality', (t) => {
	const container = fn((deps: { n: number }) => `value: ${deps.n}`);

	const result = container.registerFns({ n: () => 123 });
	t.equal(result.resolve(), 'value: 123');
	t.end();
});

tape('registerFns. With constant container', (t) => {
	const container = fn((deps: { n: number }) => `value: ${deps.n}`);

	const result = container.registerFns({ n: constant(123) });
	t.equal(result.resolve(), 'value: 123');
	t.end();
});

tape('registerFns. With function container', (t) => {
	const container = fn((deps: { n: number }) => `value: ${deps.n}`);

	const result = container.registerFns({ n: fn(() => 123) });
	t.equal(result.resolve(), 'value: 123');
	t.end();
});

tape('registerFns. Multiple dependencies', (t) => {
	const container = fn(
		(deps: { n: number; s: string }) => `${deps.s}: ${deps.n}`
	);

	const result = container.registerFns({
		n: () => 123,
		s: () => 'value',
	});

	t.equal(result.resolve(), 'value: 123');
	t.end();
});

tape('registerFns. Function with own dependencies', (t) => {
	const container = fn(
		(deps: { n: number; s: string }) => `${deps.s}: ${deps.n}`
	);

	const result = container
		.registerFns({
			n: fn((deps: { multiplier: number }) => 123 * deps.multiplier),
			s: (deps: { prefix: string }) => `${deps.prefix}_value`,
		})
		.registerFns({
			prefix: () => 'prefix123',
		});

	t.equal(result.resolve({ multiplier: 2 }), 'prefix123_value: 246');
	t.end();
});
