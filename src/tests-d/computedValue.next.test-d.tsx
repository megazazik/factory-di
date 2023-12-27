import { expectError, expectType } from 'tsd';
import { Container, computedValue, constant } from '../next';

export function ofComputedValueWithoutDeps() {
	expectType<Container<string, {}, {}>>(computedValue(() => 'string'));
	expectType<Container<{ value: number }, {}, {}>>(
		computedValue(() => ({ value: 123 }))
	);
}

export function ofComputedValueOneDep() {
	expectType<Container<{ value: number }, { dep1: number }, {}>>(
		computedValue((p: number) => ({ value: p }), 'dep1')
	);
}

export function ofComputedValueTwoDep() {
	expectType<
		Container<
			{ value: number; p2: string },
			{ dep1: number; dep2: string },
			{}
		>
	>(
		computedValue(
			(p: number, p2: string) => ({ value: p, p2 }),
			'dep1',
			'dep2'
		)
	);

	expectType<
		Container<number, { dep1: number; dep2: string | undefined }, {}>
	>(computedValue((p: number, p2?: string) => 123, 'dep1', 'dep2'));

	expectType<
		Container<
			{ value: number; p2: string | undefined },
			{ dep1: number; dep2: string | undefined },
			{}
		>
	>(
		computedValue(
			(p: number, p2?: string) => ({ value: p, p2 }),
			'dep1',
			'dep2'
		)
	);
}

export function onComputedValueWithEmptyInterface() {
	expectType<Container<{ value: boolean }, { p0: {} }, {}>>(
		computedValue((p: {}) => ({ value: !!p }), 'p0')
	);

	expectType<Container<boolean, { p0: { p?: boolean } }, {}>>(
		computedValue((p: { p?: boolean }) => true, 'p0')
	);
}

export function ofComputedValueObjectOneDep() {
	expectType<Container<{ value: number }, { dep1: number }, {}>>(
		computedValue(({ p }: { p: number }) => ({ value: p }), { p: 'dep1' })
	);
}

export function ofComputedValueObjectTwoDep() {
	expectType<
		Container<
			{
				value: number;
				p2: string;
			},
			{ dep1: number; dep2: string },
			{}
		>
	>(
		computedValue(
			({ p, p2 }: { p: number; p2: string }) => ({ value: p, p2 }),
			{
				p: 'dep1',
				p2: 'dep2',
			}
		)
	);

	expectType<
		Container<true, { dep1: number; dep2?: string | undefined }, {}>
	>(
		computedValue((_: { p: number; p2?: string }) => true, {
			p: 'dep1',
			p2: 'dep2',
		})
	);
}

export function ofComputedValueObjectOneDepNoToken() {
	expectType<
		Container<
			{ value: number },
			{ dep1: number },
			{
				readonly dep1: Container<number, {}, {}>;
			}
		>
	>(
		computedValue(({ dep1 }: { dep1: number }) => ({ value: dep1 }), {
			dep1: constant(123),
		})
	);
}

export function ofComputedValueObjectNoFullEmbeddedDepNoToken() {
	expectType<
		Container<
			{ value: number },
			{ dep1: number },
			{
				readonly dep1: Container<number, { dep2: number }, {}>;
			}
		>
	>(
		computedValue(({ dep1 }: { dep1: number }) => ({ value: dep1 }), {
			dep1: computedValue((dep2: number) => dep2, 'dep2'),
		})
	);
}

export function ofComputedValueObjectTwoDepNoToken() {
	expectType<
		Container<
			{ value: number; p2: string },
			{ dep1: number; dep2: string },
			{
				readonly dep1: Container<number, {}, {}>;
				readonly dep2: Container<string, {}, {}>;
			}
		>
	>(
		computedValue(
			({ dep1, dep2 }: { dep1: number; dep2: string }) => ({
				value: dep1,
				p2: dep2,
			}),
			{
				dep1: constant(321),
				dep2: constant('sdfsdf'),
			}
		)
	);
}

export function ofComputedValueWrongParams() {
	// expectError(
	// 	computedValue(
	// 		({ p, p2 }: { p: number; p2: string }) => ({ value: p, p2 }),
	// 		{
	// 			p: 'dep1',
	// 			p2: 'dep2',
	// 			p3: 'wrong',
	// 		}
	// 	)
	// );

	expectError(
		computedValue(
			({ dep1, dep2 }: { dep1: number; dep2: string }) => true,
			{
				dep1: true,
				dep2: constant('sdfsdf'),
			}
		)
	);

	expectError(
		computedValue(
			({ dep1, dep2 }: { dep1: number; dep2: string }) => true,
			{
				dep1: constant('321'),
				dep2: constant('sdfsdf'),
			}
		)
	);
}
