import { constructorSymbol, createValueSymbol } from './innerMethods';
import { Dependencies, Key, Container, HumanReadableType } from './container';

export type FactoryResolve<Params extends Record<Key, any>> = <
	K extends keyof Params
>(
	key: K
) => Params[K];

export type Factory = {
	// factory(() => value)
	<T>(factory: (getValue: FactoryResolve<{}>) => T): Container<T, {}, {}>;

	// factory(container)
	<
		T,
		D extends Dependencies,
		RD extends Record<Key, Container<any, any, any>>
	>(
		container: Container<T, D, RD>
	): Container<() => T, D, RD>;
	// factory(container, {param1: 'token1', param2: 'token2'})
	<
		T,
		D extends Dependencies,
		RD extends Record<Key, Container<any, any, any>>,
		ParamsMap extends Record<Key, keyof D>
	>(
		container: Container<T, D, RD>,
		params: ParamsMap
	): Container<
		(params: FactoryParamsObject<ParamsMap, D>) => T,
		HumanReadableType<Omit<D, ParamsMap[keyof ParamsMap]>>,
		RD
	>;
	// factory(container, 'token1', 'token2')
	<
		T,
		D extends Dependencies,
		RD extends Record<Key, Container<any, any, any>>,
		const Args extends readonly (keyof D)[]
	>(
		container: Container<T, D, RD>,
		...args: Args
	): Container<
		(...args: FactoryParamsList<Args, D>) => T,
		HumanReadableType<Omit<D, Args[number]>>,
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

export const factory: Factory = (
	factory: ((...args: any[]) => any) | Container<any, any, any>,
	...params: any[]
) => {
	if (typeof factory === 'function') {
		return Container[constructorSymbol](
			(resolve) => factory((k: any) => resolve(k)?.value ?? undefined),
			{}
		);
	}

	if (typeof params[0] === 'object') {
		const argsMap = Object.fromEntries(
			Object.entries(params[0]).map(([k, v]) => [v, k])
		);
		// when params is object, not array
		return Container[constructorSymbol](
			(parentResolve, singltonTokens) => (args: Record<Key, Key>) => {
				const resolve: typeof parentResolve = (k) => {
					if (k in argsMap) {
						return { value: args[argsMap[k]] };
					}

					return parentResolve(k);
				};
				return factory[createValueSymbol](resolve, singltonTokens);
			},
			{}
		) as any;
	}

	const argsMap = Object.fromEntries(params.map((v, i) => [v, i]));
	return Container[constructorSymbol](
		(parentResolve, singltonTokens) =>
			(...args: Key[]) => {
				const resolve: typeof parentResolve = (k) => {
					if (k in argsMap) {
						return { value: args[argsMap[k]] };
					}

					return parentResolve(k);
				};
				return factory[createValueSymbol](resolve, singltonTokens);
			},
		{}
	) as any;
};
