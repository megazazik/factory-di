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

export type OfClass = {
	<T>(c: { new (): T }): Container<T, {}, {}>;
	<Params extends [...any[]], T, Keys extends MapTuple<Params, Key>>(
		c: { new (...args: Params): T },
		...keys: Keys
	): Container<T, UnknownGuard<CombineTuplesToMap<Keys, Params>>, {}>;
	<
		Params extends object,
		T,
		Keys extends Key,
		KeysMap extends Record<keyof Params, Keys>
	>(
		c: { new (args: Params): T },
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

export const Class: OfClass = (Constructor: any, ...argNames: string[]) =>
	typeof argNames[0] === 'object'
		? createContainer({
				registeredDeps: {},
				getValue: (resolve) =>
					new Constructor(
						getAllKeys(argNames[0]).reduce(
							(prev, key) =>
								Object.assign(prev, {
									[key]: resolve((argNames[0] as never)[key]),
								}),
							{}
						)
					),
		  })
		: createContainer({
				registeredDeps: {},
				getValue: (resolve) =>
					new Constructor(...argNames.map(resolve)),
		  });
