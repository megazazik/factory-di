/**
 * @todo опциональные параметры у контейнеров?
 */
export * from './createContainer';
export * from './factory';
export * from './class';
export * from './computedValue';
export * from './singleton';
export * from './containerData';

// import { Key } from './containerData';

// export declare type OptionalKeys<T> = {
// 	[K in keyof T]-?: {} extends Pick<T, K> ? K : never;
// }[keyof T];

// export type NumberKey = `${number}`;

// export type OfComputedValue = {
// 	<Params extends [...any[]], T, Keys extends KeysTuple<Params>>(
// 		c: (...args: Params) => T,
// 		...keys: Keys
// 	): DepsFromParamsList<NumberKeys<Keys>, Params>
// };

// type DepsFromParamsList<T extends Record<NumberKey, string>, Params> = {
// 	[K in keyof T as T[K]]: K extends keyof Params ? Params[K]: never;
// };

// type NumberKeys<T extends [...Key[]]> = {
// 	[K in keyof T as K extends NumberKey ? K : never]: T[K];
// };

// export type KeysTuple<T extends [...any[]]> = { [I in keyof T]: Key };

// declare const computed: OfComputedValue;
// export const res = computed(
// 	(p1: string, p2?: number) => {},
// 	'param1',
// 	'param2'
// );
