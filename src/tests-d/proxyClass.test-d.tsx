import { expectType } from 'tsd';
import { Container, proxyClass } from '..';

export function ofProxyClass() {
	class C {
		constructor(public params: { dep1: number; dep2: string }) {}
	}

	expectType<Container<C, { dep1: number; dep2: string }, {}>>(proxyClass(C));

	class C1 {
		constructor(public params: { dep1?: number; dep2: string }) {}
	}

	expectType<Container<C1, { dep1?: number | undefined; dep2: string }, {}>>(
		proxyClass(C1)
	);

	class C2 {
		constructor(
			public params: { dep1: { nested: number }; dep2: string }
		) {}
	}

	expectType<Container<C2, { dep1: { nested: number }; dep2: string }, {}>>(
		proxyClass(C2)
	);
}
