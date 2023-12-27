import { expectError, expectType } from 'tsd';
import {
	Container,
	constant,
	computedValue,
	ResolveWithRequiredDeps,
	ContainerData,
} from '..';

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

export function ofComputedValueOneDepNoRegistered() {
	expectType<
		ResolveWithRequiredDeps<
			{ dep1: number } & { dep1?: number },
			{ value: number }
		>
	>(computedValue((p: number) => ({ value: p }), 'dep1').resolve);
}

export function ofComputedValueTwoDep() {
	expectType<
		Container<
			{ value: number; p2: string },
			{ dep1: number } & { dep2: string },
			{}
		>
	>(
		computedValue(
			(p: number, p2: string) => ({ value: p, p2 }),
			'dep1',
			'dep2'
		)
	);

	expectType<{ value: number; p2: string }>(
		computedValue(
			(p: number, p2: string) => ({ value: p, p2 }),
			'dep1',
			'dep2'
		)
			.register('dep1', constant(432))
			.register('dep2', constant('dfg'))
			.resolve()
	);
}

export function ofComputedValueObjectOneDep() {
	expectType<Container<{ value: number }, { dep1: number }, {}>>(
		computedValue(({ p }: { p: number }) => ({ value: p }), {
			p: 'dep1',
			p2: 'dfsdf', // wrong param
		})
	);
}

export function ofComputedValueObjectOneDepNoRegistered() {
	expectType<
		ResolveWithRequiredDeps<
			{ dep1: number } & { dep1?: number },
			{ value: number }
		>
	>(
		computedValue(({ p }: { p: number }) => ({ value: p }), { p: 'dep1' })
			.resolve
	);
}

export function ofComputedValueObjectTwoDep() {
	expectType<
		Container<
			{ value: number; p2: string },
			{ dep1: number } & { dep2: string },
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

	expectType<{ value: number; p2: string }>(
		computedValue(
			({ p, p2 }: { p: number; p2: string }) => ({ value: p, p2 }),
			{
				p: 'dep1',
				p2: 'dep2',
			}
		)
			.register('dep1', constant(432))
			.register('dep2', constant('dfg'))
			.resolve()
	);
}

export function onComputedValueWithEmptyInterface() {
	expectType<Container<{ value: boolean }, { p0: {} }, {}>>(
		computedValue((p: {}) => ({ value: !!p }), 'p0')
	);
}

export function ofComputedValueObjectOneDepNoToken() {
	expectType<
		Container<
			{ value: number },
			{ dep1: number },
			{
				dep1: Container<number, {}, {}>;
			}
		>
	>(
		computedValue(({ dep1 }: { dep1: number }) => ({ value: dep1 }), {
			dep1: constant(123),
		})
	);
}

export function ofComputedValueObjectFullEmbeddedDepNoToken() {
	expectType<
		Container<
			{ value: number },
			{ dep1: number },
			{
				dep1: Container<
					number,
					{ dep2: number },
					{ dep2: ContainerData<123, {}, {}> }
				>;
			}
		>
	>(
		computedValue(({ dep1 }: { dep1: number }) => ({ value: dep1 }), {
			dep1: computedValue((dep2: number) => dep2, 'dep2').register(
				'dep2',
				123
			),
		})
	);

	expectType<{ value: number }>(
		computedValue(({ dep1 }: { dep1: number }) => ({ value: dep1 }), {
			dep1: computedValue((dep2: number) => dep2, 'dep2').register(
				'dep2',
				123
			),
		}).resolve()
	);
}

export function ofComputedValueObjectNoFullEmbeddedDepNoToken() {
	expectType<
		Container<
			{ value: number },
			{ dep1: number },
			{
				dep1: Container<number, { dep2: number }, {}>;
			}
		>
	>(
		computedValue(({ dep1 }: { dep1: number }) => ({ value: dep1 }), {
			dep1: computedValue((dep2: number) => dep2, 'dep2'),
		})
	);

	expectType<{ value: number }>(
		computedValue(({ dep1 }: { dep1: number }) => ({ value: dep1 }), {
			dep1: computedValue((dep2: number) => dep2, 'dep2'),
		}).resolve({
			dep2: 123,
		})
	);

	expectError(
		computedValue(({ dep1 }: { dep1: number }) => ({ value: dep1 }), {
			dep1: computedValue((dep2: number) => dep2, 'dep2'),
		}).resolve()
	);
}

export function ofComputedValueObjectTwoDepNoToken() {
	expectType<
		Container<
			{ value: number; p2: string },
			{ dep1: number } & { dep2: string },
			{
				dep1: Container<number, {}, {}>;
				dep2: Container<string, {}, {}>;
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

	expectType<{ value: number; p2: string }>(
		computedValue(
			({ dep1, dep2 }: { dep1: number; dep2: string }) => ({
				value: dep1,
				p2: dep2,
			}),
			{
				dep1: constant(321),
				dep2: constant('sdfsdf'),
			}
		).resolve()
	);
}

export function ofComputedValueWrongParams() {
	expectError(
		computedValue(
			({ dep1, dep2 }: { dep1: number; dep2: string }) => ({
				value: dep1,
				p2: dep2,
			}),
			{
				dep1: true,
				dep2: constant('sdfsdf'),
			}
		)
	);

	expectError(
		computedValue(
			({ dep1, dep2 }: { dep1: number; dep2: string }) => ({
				value: dep1,
				p2: dep2,
			}),
			{
				dep1: constant('321'),
				dep2: constant('sdfsdf'),
			}
		)
	);
}
