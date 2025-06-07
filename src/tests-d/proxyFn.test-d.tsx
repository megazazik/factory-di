import { expectType } from 'tsd';
import { Container, proxyFn } from '..';

export function ofProxyFn() {
	expectType<Container<{ value: number }, { dep1: number }, {}>>(
		proxyFn(({ dep1 }: { dep1: number }) => ({ value: dep1 }))
	);

	expectType<Container<{ value: number }, { dep1?: number | undefined }, {}>>(
		proxyFn(({ dep1 }: { dep1?: number }) => ({ value: dep1 ?? 0 }))
	);

	expectType<Container<{ value: number }, { dep1: { nested: number } }, {}>>(
		proxyFn(({ dep1 }: { dep1: { nested: number } }) => ({
			value: dep1.nested,
		}))
	);

	expectType<
		Container<
			{ value: number; p2: string },
			{ dep1: number; dep2: string },
			{}
		>
	>(
		proxyFn(({ dep1, dep2 }: { dep1: number; dep2: string }) => ({
			value: dep1,
			p2: dep2,
		}))
	);
}
