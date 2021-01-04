import { Key } from './containerData';
import { Container, createContainer } from './createContainer';

export type FactoryResolve<Params extends Record<Key, any>> = <
	K extends keyof Params
>(
	key: K
) => Params[K];

export const factory = <T, Params extends Record<Key, any>>(
	factory: (getValue: FactoryResolve<Params>) => T
) =>
	createContainer({
		registeredDeps: {},
		getValue: factory,
	}) as Container<T, Params, {}>;
