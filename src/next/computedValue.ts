import { Container } from './container';
import { DepsFromParamsList, Key, KeysTuple, NumberKeysOnly } from './types';

export type OfComputedValue = {
	<T>(getValue: () => T): Container<T, {}, {}>;

	<Params extends object, T, const KeysMap extends DependenciesMap<Params>>(
		c: (params: Params) => T,
		keys: KeysMap
	): KeysMap extends Key // на случай, если передали токен, который соответствует типу первого параметра
		? Container<T, { [KK in KeysMap]: Params }, {}>
		: Container<
				T,
				{
					[K in keyof Params as KeysMap[K] extends Key
						? KeysMap[K]
						: K]: Params[K];
				},
				{
					[K in keyof KeysMap as KeysMap[K] extends Container<
						any,
						any,
						any
					>
						? K
						: never]: KeysMap[K] extends Container<any, any, any>
						? KeysMap[K]
						: never;
				}
		  >;

	<Params extends [...any[]], T, Keys extends KeysTuple<Params>>(
		c: (...args: Params) => T,
		...keys: Keys
	): Container<T, DepsFromParamsList<NumberKeysOnly<Keys>, Params>, {}>;
};

export type DependenciesMap<Params extends object> = {
	[K in keyof Params]: Key | Container<Params[K], any, any>;
};

export declare const computedValue: OfComputedValue;
// export const res1 = computedValue(
// 	(p1: string, p2?: number) => true,
// 	'param1',
// 	'param2'
// );
// export const res2 = computedValue((pp: { p1: string; p2?: number }) => true, {
// 	p1: 'param1',
// 	p2: 'asd',
// });
