import { ContainerData, Key } from './containerData';
import {
	Container,
	MapTuple,
	UnknownGuard,
	createContainer,
	ObjectValuesIntersection,
	CombineTuplesToMap,
	getAllKeys,
	ContainerDataValueKeys,
} from './createContainer';

export type OfComputedValue = {
	<T>(getValue: () => T): Container<T, {}, {}>;
	<Params extends [...any[]], T, Keys extends MapTuple<Params, Key>>(
		c: (...args: Params) => T,
		...keys: Keys
	): Container<T, UnknownGuard<CombineTuplesToMap<Keys, Params>>, {}>;
	<
		Params extends object,
		T,
		Keys extends Key,
		KeysMap extends ComputedValueDependenciesMap<Params, Keys>
	>(
		c: (params: Params) => T,
		keys: KeysMap & object
	): Container<
		T,
		UnknownGuard<
			ObjectValuesIntersection<{
				[K in keyof Params]: KeysMap[K] extends Key
					? { [KK in KeysMap[K]]: Params[K] }
					: { [KK in K]: Params[K] };
			}>
		>,
		{
			[K in ContainerDataValueKeys<KeysMap>]: KeysMap[K] extends ContainerData<
				any,
				any,
				any
			>
				? KeysMap[K]
				: never;
		}
	>;
};

export type ComputedValueDependenciesMap<Params extends object, Keys> = {
	[K in keyof Params]: Keys | ContainerData<Params[K], any, any>;
};

export const computedValue: OfComputedValue = <T>(
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

		return createContainer({
			registeredDeps,
			getValue: (resolve: any) =>
				getValue(
					getAllKeys(argNames[0]).reduce((prev, key) => {
						const value = (argNames[0] as any)[key];
						return Object.assign(prev, {
							[key]: resolve(
								typeof value === 'object' ? key : value
							),
						});
					}, {})
				),
		}) as Container<T, {}, {}>;
	}

	return createContainer({
		registeredDeps: {},
		getValue: (resolve) => getValue(...argNames.map(resolve)),
	}) as Container<T, {}, {}>;
};
