export type Key = string | symbol;
export type Dependencies = Record<Key, any>;

export type NumberKey = `${number}`;

export type DepsFromParamsList<T extends Record<NumberKey, Key>, Params> = {
	[K in keyof T as T[K] extends Key ? T[K] : never]: K extends keyof Params
		? Params[K]
		: never;
};

export type NumberKeysOnly<T extends [...Key[]]> = {
	[K in keyof T as K extends NumberKey ? K : never]: T[K];
};

export type KeysTuple<T extends [...any[]]> = { [I in keyof T]: Key };

export type UnionToIntersection<U> = (
	U extends any ? (k: U) => void : never
) extends (k: infer I) => void
	? I
	: never;

/**
 * Make a type assembled from several types/utilities more readable.
 * (e.g. the type will be shown as the final resulting type instead of as a bunch of type utils wrapping the initial type).
 */
export type HumanReadableType<T> = T extends infer U
	? { [K in keyof U]: U[K] }
	: never;
