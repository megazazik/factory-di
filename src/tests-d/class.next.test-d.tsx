import { expectError, expectType } from 'tsd';
import { Container, Class, constant } from '..';

export function ofComputedValueWithoutDeps() {
	class C {
		p1: string;
	}

	expectType<Container<C, {}, {}>>(Class(C));
}

export function ofComputedValueOneDep() {
	class C {
		constructor(public p: number) {}
	}

	expectType<Container<C, { dep1: number }, {}>>(Class(C, 'dep1'));
}

export function ofComputedValueTwoDep() {
	class C {
		constructor(public p1: number, public p2: string) {}
	}

	expectType<Container<C, { dep1: number; dep2: string }, {}>>(
		Class(C, 'dep1', 'dep2')
	);

	class C1 {
		constructor(public p1: number, public p2?: string) {}
	}

	expectType<Container<C1, { dep1: number; dep2: string | undefined }, {}>>(
		Class(C1, 'dep1', 'dep2')
	);
}

export function onComputedValueWithEmptyInterface() {
	class C {
		constructor(public p1: {}) {}
	}

	expectType<Container<C, { p0: {} }, {}>>(Class(C, 'p0'));

	class C1 {
		constructor(public p1: { p?: boolean }) {}
	}

	expectType<Container<C1, { p0: { p?: boolean } }, {}>>(Class(C1, 'p0'));
}

export function ofComputedValueObjectOneDep() {
	class C {
		constructor(public params: { p: number }) {}
	}
	expectType<Container<C, { dep1: number }, {}>>(Class(C, { p: 'dep1' }));
}

export function ofComputedValueObjectTwoDep() {
	class C {
		constructor(public params: { p: number; p2: string }) {}
	}

	expectType<Container<C, { dep1: number; dep2: string }, {}>>(
		Class(C, {
			p: 'dep1',
			p2: 'dep2',
		})
	);

	class C1 {
		constructor(public params: { p: number; p2?: string }) {}
	}

	expectType<Container<C1, { dep1: number; dep2?: string | undefined }, {}>>(
		Class(C1, {
			p: 'dep1',
			p2: 'dep2',
		})
	);
}

export function ofComputedValueObjectOneDepNoToken() {
	class C {
		constructor(public params: { dep1: number }) {}
	}

	expectType<
		Container<
			C,
			{ dep1: number },
			{ readonly dep1: Container<number, {}, {}> }
		>
	>(Class(C, { dep1: constant(123) }));
}

export function ofComputedValueObjectNoFullEmbeddedDepNoToken() {
	class C1 {
		constructor(public params: { c: C2 }) {}
	}

	class C2 {
		constructor(public params: number) {}
	}

	expectType<
		Container<
			C1,
			{ c: C2 },
			{ readonly c: Container<C2, { dep2: number }, {}> }
		>
	>(Class(C1, { c: Class(C2, 'dep2') }));
}

export function ofComputedValueObjectTwoDepNoToken() {
	class C {
		constructor(public params: { dep1: number; dep2: string }) {}
	}

	expectType<
		Container<
			C,
			{ dep1: number; dep2: string },
			{
				readonly dep1: Container<number, {}, {}>;
				readonly dep2: Container<string, {}, {}>;
			}
		>
	>(
		Class(C, {
			dep1: constant(321),
			dep2: constant('sdfsdf'),
		})
	);
}

export function ofComputedValueWrongParams() {
	class C {
		constructor(public params: { dep1: number; dep2: string }) {}
	}

	// expectError(
	// 	Class(C, {
	// 		dep1: 'd1',
	// 		dep2: 'd2',
	// 		p3: 'wrong',
	// 	})
	// );

	expectError(
		Class(C, {
			dep2: constant('sdfsdf'),
		})
	);

	expectError(
		Class(C, {
			dep1: true,
			dep2: constant('sdfsdf'),
		})
	);

	expectError(
		Class(C, {
			dep1: constant('321'),
			dep2: constant('sdfsdf'),
		})
	);

	class C1 {
		constructor(dep1: number, dep2: string) {}
	}

	expectError(Class(C1, 'dep1'));
	expectError(Class(C1, 'dep1', 'dep2', 'dep3'));
}
