import { ContainerData, Dependencies, Key } from './containerData';
import { Container, createContainer } from './createContainer';

export type FactoryResolve<Params extends Record<Key, any>> = <
	K extends keyof Params
>(
	key: K
) => Params[K];

export type Factory = {
	// factory(container)
	<
		T,
		D extends Dependencies,
		RD extends Record<Key, ContainerData<any, any, any>>
	>(
		container: Container<T, D, RD>
	): Container<() => T, D, RD>;
	// factory(container, {param1: 'token1', param2: 'token2'})
	<
		T,
		D extends Dependencies,
		RD extends Record<Key, ContainerData<any, any, any>>,
		ParamsMap extends Record<Key, keyof D>
	>(
		container: Container<T, D, RD>,
		params: ParamsMap
	): Container<
		(params: FactoryParamsObject<ParamsMap, D>) => T,
		Omit<D, ParamsMap[keyof ParamsMap]>,
		RD
	>;
	// factory(container, 'token1', 'token2')
	<
		T,
		D extends Dependencies,
		RD extends Record<Key, ContainerData<any, any, any>>,
		const Args extends readonly (keyof D)[]
	>(
		container: Container<T, D, RD>,
		...args: Args
	): Container<
		(...args: FactoryParamsList<Args, D>) => T,
		Omit<D, Args[number]>,
		RD
	>;
	// factory((getValue) => getValue('token'))
	<T, Params extends Record<Key, any>>(
		factory: (getValue: FactoryResolve<Params>) => T
	): Container<T, Params, {}>;
};

export type FactoryParamsObject<
	ParamsMap extends Record<Key, keyof D>,
	D extends Dependencies
> = {
	[K in keyof ParamsMap]: D[ParamsMap[K]];
};

export type FactoryParamsList<
	Args extends readonly (keyof D)[],
	D extends Dependencies
> = {
	[K in keyof Args]: D[Args[K]];
};

export const factory: Factory = (factory: any) => {
	if (typeof factory === 'function') {
		return createContainer({
			registeredDeps: {},
			getValue: factory,
		});
	}

	return null as any;
};
