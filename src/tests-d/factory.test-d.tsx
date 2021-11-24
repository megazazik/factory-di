import { expectType } from 'tsd';
import {
	Container,
	constant,
	FactoryResolve,
	factory,
	ResolveWithRequiredDeps,
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
	expectType<
		ResolveWithRequiredDeps<
			{ dep1: number } & { dep1?: number },
			{ value: number }
		>
	>(
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
