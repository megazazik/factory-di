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
