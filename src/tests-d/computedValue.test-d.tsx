import { expectType } from 'tsd';
import {
	Container,
	constant,
	NotRegisteredDependenciesError,
	computedValue,
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
	expectType<NotRegisteredDependenciesError<{ dep1: number }>>(
		computedValue((p: number) => ({ value: p }), 'dep1').resolve
	);
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
		computedValue(({ p }: { p: number }) => ({ value: p }), { p: 'dep1' })
	);
}

export function ofComputedValueObjectOneDepNoRegistered() {
	expectType<NotRegisteredDependenciesError<{ dep1: number }>>(
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
