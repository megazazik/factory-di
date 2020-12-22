import { expectType } from 'tsd';
import {
	Container,
	ofConstant,
	NotRegisteredDependenciesError,
	ofComputedValue,
} from '..';

export function ofComputedValueWithoutDeps() {
	expectType<Container<string, {}, {}>>(ofComputedValue(() => 'string'));
	expectType<Container<{ value: number }, {}, {}>>(
		ofComputedValue(() => ({ value: 123 }))
	);
}

export function ofComputedValueOneDep() {
	expectType<Container<{ value: number }, { dep1: number }, {}>>(
		ofComputedValue((p: number) => ({ value: p }), 'dep1')
	);
}

export function ofComputedValueOneDepNoRegistered() {
	expectType<NotRegisteredDependenciesError<'dep1'>>(
		ofComputedValue((p: number) => ({ value: p }), 'dep1').resolve
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
		ofComputedValue(
			(p: number, p2: string) => ({ value: p, p2 }),
			'dep1',
			'dep2'
		)
	);

	expectType<{ value: number; p2: string }>(
		ofComputedValue(
			(p: number, p2: string) => ({ value: p, p2 }),
			'dep1',
			'dep2'
		)
			.register('dep1', ofConstant(432))
			.register('dep2', ofConstant('dfg'))
			.resolve()
	);
}
