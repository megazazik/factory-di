import { expectType } from 'tsd';
import {
	Container,
	ofConstant,
	NotRegisteredDependenciesError,
	FactoryResolve,
	ofFactory,
} from '..';

export function ofFactoryWithoutDeps() {
	expectType<Container<string, {}, {}>>(ofFactory(() => 'string'));
	expectType<Container<{ value: boolean }, {}, {}>>(
		ofFactory((resolve) => ({ value: Boolean(resolve) }))
	);
}

export function ofFactoryOneDep() {
	expectType<Container<{ value: number }, { dep1: number }, {}>>(
		ofFactory((resolve: FactoryResolve<{ dep1: number }>) => ({
			value: resolve('dep1'),
		}))
	);
}

export function ofFactoryOneDepNoRegistered() {
	expectType<NotRegisteredDependenciesError<{ dep1: number }>>(
		ofFactory((resolve: FactoryResolve<{ dep1: number }>) => ({
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
		ofFactory(
			(resolve: FactoryResolve<{ dep1: number; dep22: string }>) => ({
				value: resolve('dep1'),
				value2: resolve('dep22'),
			})
		)
	);

	expectType<{ value: number; value2: string }>(
		ofFactory(
			(resolve: FactoryResolve<{ dep1: number; dep22: string }>) => ({
				value: resolve('dep1'),
				value2: resolve('dep22'),
			})
		)
			.register('dep1', ofConstant(432))
			.register('dep22', ofConstant('dfg'))
			.resolve()
	);
}
