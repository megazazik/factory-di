import { expectError, expectType } from 'tsd';
import {
	Container,
	constant,
	FactoryResolve,
	factory,
	Resolve,
	computedValue,
} from '..';

export function ofFactoryWithoutDeps() {
	expectType<Container<string, {}, {}>>(factory(() => 'string'));
	expectType<Container<{ value: boolean }, {}, {}>>(
		factory((resolve) => ({ value: Boolean(resolve) }))
	);
}

export function ofFactoryOneDep() {
	expectType<Container<{ value: number }, { dep1: number }, {}>>(
		factory((resolve: FactoryResolve<{ dep1: number }>) => ({
			value: resolve('dep1'),
		}))
	);
}

export function ofFactoryOneDepNoRegistered() {
	expectType<Resolve<{ value: number }, { dep1: number }, 'dep1'>>(
		factory((resolve: FactoryResolve<{ dep1: number }>) => ({
			value: resolve('dep1'),
		})).resolve
	);
}

export function ofFactoryTwoDep() {
	expectType<
		Container<
			{ value: number; value2: string },
			{ dep1: number; dep22: string },
			{}
		>
	>(
		factory((resolve: FactoryResolve<{ dep1: number; dep22: string }>) => ({
			value: resolve('dep1'),
			value2: resolve('dep22'),
		}))
	);

	expectType<{ value: number; value2: string }>(
		factory((resolve: FactoryResolve<{ dep1: number; dep22: string }>) => ({
			value: resolve('dep1'),
			value2: resolve('dep22'),
		}))
			.register('dep1', constant(432))
			.register('dep22', constant('dfg'))
			.resolve()
	);
}

export function ofFactoryContainerParamList() {
	const child1 = constant('myvalue');
	expectType<Container<() => string, {}, {}>>(factory(child1));

	const child2 = computedValue((v: string) => ({ v }), 'vToken');
	expectType<Container<() => { v: string }, { vToken: string }, {}>>(
		factory(child2)
	);

	const child3 = computedValue((v: string) => ({ v }), 'vToken');
	expectType<Container<(v: string) => { v: string }, {}, {}>>(
		factory(child3, 'vToken')
	);

	const child4 = computedValue(
		(v: string, v2: number) => ({ v, v2 }),
		'vToken',
		'v2Token'
	);
	expectType<
		Container<(v: string, v2: number) => { v: string; v2: number }, {}, {}>
	>(factory(child4, 'vToken', 'v2Token'));

	expectType<
		Container<
			(v: string) => { v: string; v2: number },
			{ v2Token: number },
			{}
		>
	>(factory(child4, 'vToken'));

	expectType<
		Container<
			(v2: number) => { v: string; v2: number },
			{ vToken: string },
			{}
		>
	>(factory(child4, 'v2Token'));

	expectType<
		Container<
			(v2: number) => { v: string; v2: number },
			{ vToken: string },
			{ vToken: Container<string, {}, {}> }
		>
	>(factory(child4.register('vToken', 'vValue' as string), 'v2Token'));

	expectType<
		Container<
			(v2: number) => { v: string; v2: number },
			{ vToken: string },
			{
				vToken: Container<string, {}, {}>;
				v2Token: Container<number, {}, {}>;
			}
		>
	>(
		factory(
			child4
				.register('vToken', 'vValue' as string)
				.register('v2Token', 12 as number),
			'v2Token'
		)
	);
}

export function ofFactoryContainerParamObject() {
	const child3 = computedValue((v: string) => ({ v }), 'vToken');
	expectType<
		Container<(params: { vTokenParam: string }) => { v: string }, {}, {}>
	>(factory(child3, { vTokenParam: 'vToken' }));

	const child4 = computedValue(
		(v: string, v2: number) => ({ v, v2 }),
		'vToken',
		'v2Token'
	);
	expectType<
		Container<
			(params: { param1: string; param2: number }) => {
				v: string;
				v2: number;
			},
			{},
			{}
		>
	>(
		factory(child4, {
			param1: 'vToken',
			param2: 'v2Token',
		})
	);
	expectType<
		Container<
			(params: { param: string }) => { v: string; v2: number },
			{ v2Token: number },
			{}
		>
	>(factory(child4, { param: 'vToken' }));
	expectType<
		Container<
			(params: { param: number }) => { v: string; v2: number },
			{ vToken: string },
			{}
		>
	>(factory(child4, { param: 'v2Token' }));
	expectType<
		Container<
			(params: { param: number }) => { v: string; v2: number },
			{ vToken: string },
			{ vToken: Container<string, {}, {}> }
		>
	>(
		factory(child4.register('vToken', 'vValue' as string), {
			param: 'v2Token',
		})
	);
	expectType<
		Container<
			(params: { param: number }) => { v: string; v2: number },
			{ vToken: string },
			{
				vToken: Container<string, {}, {}>;
				v2Token: Container<number, {}, {}>;
			}
		>
	>(
		factory(
			child4
				.register('vToken', 'vValue' as string)
				.register('v2Token', 12 as number),
			{ param: 'v2Token' }
		)
	);
}

export function ofFactoryWrongParams() {
	expectError(
		factory(
			computedValue((v: string) => ({ v }), 'vToken'),
			'wrongToken'
		)
	);

	expectError(
		factory(
			computedValue((v: string) => ({ v }), 'vToken'),
			{
				vParam: 'wrongToken',
			}
		)
	);
}
