import { Key } from './containerData';
import {
	Container,
	MapTuple,
	UnknownGuard,
	createContainer,
	ObjectValuesIntersection,
	CombineTuplesToMap,
	getAllKeys,
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
		KeysMap extends Record<keyof Params, Keys>
	>(
		c: (params: Params) => T,
		keys: KeysMap
	): Container<
		T,
		UnknownGuard<
			ObjectValuesIntersection<
				{ [K in keyof Params]: { [KK in KeysMap[K]]: Params[K] } }
			>
		>,
		{}
	>;
};

export const computedValue: OfComputedValue = <T>(
	getValue: (...args: any[]) => T,
	...argNames: (string | object)[]
) =>
	typeof argNames[0] === 'object'
		? (createContainer({
				registeredDeps: {},
				getValue: (resolve) =>
					getValue(
						getAllKeys(argNames[0]).reduce(
							(prev, key) =>
								Object.assign(prev, {
									[key]: resolve((argNames[0] as never)[key]),
								}),
							{}
						)
					),
		  }) as Container<T, {}, {}>)
		: (createContainer({
				registeredDeps: {},
				getValue: (resolve) => getValue(...argNames.map(resolve)),
		  }) as Container<T, {}, {}>);
