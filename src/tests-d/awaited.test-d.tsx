import { expectError, expectType } from 'tsd';
import {
	Container,
	constant,
	FactoryResolve,
	factory,
	awaited,
	Resolve,
	computedValue,
} from '..';

export function ofAwaitedWithoutDeps() {
	expectType<Container<() => Promise<string>, {}, {}>>(
		awaited(async () => constant('string'))
	);
	expectType<Container<() => Promise<{ value: boolean }>, {}, {}>>(
		awaited(async () => constant({ value: true as boolean }))
	);
}

export function ofAwaitedContainerParamObject() {
	const child1 = computedValue((v: string) => ({ v }), 'vToken');
	expectType<Container<() => Promise<{ v: string }>, { vToken: string }, {}>>(
		awaited(async () => child1)
	);

	expectType<
		Resolve<() => Promise<{ v: string }>, { vToken: string }, 'vToken'>
	>(awaited(async () => child1).resolve);

	const child2 = computedValue((v: string) => ({ v }), 'vToken').register(
		'vToken',
		'value' as string
	);
	expectType<
		Container<
			() => Promise<{ v: string }>,
			{ vToken: string },
			{ vToken: Container<string, {}, {}> }
		>
	>(awaited(async () => child2));

	expectType<
		Resolve<() => Promise<{ v: string }>, { vToken: string }, never>
	>(awaited(async () => child2).resolve);
}
