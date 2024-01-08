const depsKey = Symbol('deps');
const allDepsKey = Symbol('allDeps');
const registeredDepsKey = Symbol('registeredDeps');

export class Container<
	Type,
	Deps extends Dependencies,
	RegisteredDeps extends Record<Key, Container<any, any, any>>,
	AllDeps extends Dependencies = Deps &
		UnionToIntersection<
			RegisteredDeps[keyof RegisteredDeps][typeof allDepsKey]
		>
> {
	[depsKey]: Deps;
	[registeredDepsKey]: RegisteredDeps;
	[allDepsKey]: AllDeps;

	/** @todo удалить */
	_deps: Deps;
	_registeredDeps: RegisteredDeps;
	_allDeps: AllDeps;

	constructor(protected getValue: GetValue<Type, Deps>) {}

	readonly resolve: Resolve<
		Type,
		AllDeps,
		RequiredDeps<Container<Type, Deps, RegisteredDeps>, never>
	> = () => {
		return null as any;
	};

	register<NewDeps extends Partial<DepsToContainerData<AllDeps>>>(
		deps: NewDeps
	): Container<
		Type,
		Deps,
		HumanReadableType<
			Omit<RegisteredDeps, keyof NewDeps> &
				MapConstantsToContainers<NewDeps>
		>
	>;
	register<
		K extends keyof AllDeps,
		Child extends Container<AllDeps[K], any, any>
	>(
		key: K,
		child: Child
	): Container<
		Type,
		Deps,
		HumanReadableType<Omit<RegisteredDeps, K> & { [KK in K]: Child }>
	>;
	register<K extends keyof AllDeps, Value extends AllDeps[K]>(
		key: K,
		child: Value
	): Container<
		Type,
		Deps,
		HumanReadableType<
			Omit<RegisteredDeps, K> & {
				[KK in K]: Container<Value, {}, {}>;
			}
		>
	>;
	register() {
		return null as any;
	}
}

export type MapConstantsToContainers<T extends Record<Key, any>> = {
	[K in keyof T]: T[K] extends Container<any, any, any>
		? T[K]
		: Container<T[K], {}, {}>;
};

export type DepsToContainerData<Deps> = {
	[K in keyof Deps]: Container<Deps[K], any, any> | Deps[K];
};

export function constant<T>(value: T) {
	return new Container<T, {}, {}>(() => value);
}

declare const NeverGuardSymbol: unique symbol;

export type Resolve<
	MainType,
	Deps extends Dependencies,
	RequiredDepsTokens extends Key
> = RequiredDepsTokens | typeof NeverGuardSymbol extends typeof NeverGuardSymbol
	? {
			(): MainType;
			(deps: Partial<Deps> & object): MainType;
			<K extends keyof Deps>(key: K): Deps[K];
	  }
	: (
			deps: HumanReadableType<
				Partial<Omit<Deps, RequiredDepsTokens>> &
					Pick<Deps, RequiredDepsTokens>
			>
	  ) => MainType;

export type RequiredDeps<
	C extends Container<any, any, any>,
	ParentDepKeys extends Key
> =
	| Exclude<
			Extract<keyof C[typeof depsKey], Key>,
			keyof C[typeof registeredDepsKey] | ParentDepKeys
	  >
	| ChidrenRequiredDepKeys<C[typeof registeredDepsKey], ParentDepKeys>;

export type ChidrenRequiredDepKeys<
	RegisteredDeps extends Record<Key, Container<any, any, any>>,
	DepKeys extends Key
> = [keyof RegisteredDeps] extends [never]
	? never
	: {
			[K in keyof RegisteredDeps]: K extends DepKeys
				? never
				: RequiredDeps<
						RegisteredDeps[K],
						Extract<keyof RegisteredDeps, Key> | DepKeys
				  >;
	  }[keyof RegisteredDeps];

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

export type GetValue<Type, Deps extends Dependencies> = (
	resolve: <K extends keyof Deps>(k: K) => Deps[K]
) => Type;
