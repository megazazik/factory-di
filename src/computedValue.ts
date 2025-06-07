import { constructorSymbol } from './innerMethods';
import {
	Container,
	ContainerFromParamsAsObject,
	DependenciesMap,
	DepsFromParamsList,
	HumanReadableType,
	KeysToStrings,
	KeysTuple,
	NumberKeysOnly,
	getAllKeys,
} from './container';

export interface OfFunction {
	<T>(getValue: () => T): Container<T, {}, {}>;

	<Params extends object, T, const KeysMap extends DependenciesMap<Params>>(
		c: keyof KeysMap extends keyof Params
			? (params: Params) => T
			: `Object has unknown params: ${KeysToStrings<
					Exclude<keyof KeysMap, keyof Params>
			  >}`,
		keys: KeysMap
	): ContainerFromParamsAsObject<Params, T, KeysMap>;

	<Params extends [...any[]], T, Keys extends KeysTuple<Params>>(
		c: (...args: Params) => T,
		...keys: Keys
	): Container<
		T,
		HumanReadableType<DepsFromParamsList<NumberKeysOnly<Keys>, Params>>,
		{}
	>;
}

export type OfComputedValue = OfFunction;

export const fn: OfFunction = <T>(
	getValue: (...args: any[]) => T,
	...argNames: (string | object)[]
) => {
	if (typeof argNames[0] === 'object') {
		const registeredDeps = {} as any;
		Object.entries(argNames[0]).forEach(([key, value]) => {
			if (typeof value === 'object') {
				registeredDeps[key] = value;
			}
		});

		return Container[constructorSymbol](
			(resolve: any) =>
				getValue(
					getAllKeys(argNames[0]).reduce((prev, key) => {
						const value = (argNames[0] as any)[key];
						return Object.assign(prev, {
							[key]:
								resolve(typeof value === 'object' ? key : value)
									?.value ?? undefined,
						});
					}, {})
				),
			registeredDeps
		) as Container<T, {}, {}>;
	}

	return Container[constructorSymbol](
		(resolve: any) =>
			getValue(...argNames.map((k) => resolve(k)?.value ?? undefined)),
		{}
	) as Container<T, {}, {}>;
};

export const computedValue: OfFunction = fn;
