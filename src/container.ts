import { constructorSymbol, createValueSymbol } from './innerMethods';

declare const depsKey: unique symbol;
declare const allDepsKey: unique symbol;
declare const registeredDepsKey: unique symbol;

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
	private _singltonKeys: Key[] = [];

	private constructor(
		private getValue: GetValue<Type, Deps>,
		private regDeps: RegisteredDeps
	) {}

	static [constructorSymbol] = <
		Type,
		Deps extends Dependencies,
		RegisteredDeps extends Record<Key, Container<any, any, any>>
	>(
		getValue: GetValue<Type, Deps>,
		regDeps: RegisteredDeps
	) => {
		return new Container<Type, Deps, RegisteredDeps>(getValue, regDeps);
	};

	singlton(
		...tokens: Array<keyof AllDeps>
	): Container<Type, Deps, RegisteredDeps> {
		return null as any; // new Container()
	}

	readonly resolve: Resolve<
		Type,
		AllDeps,
		RequiredDeps<Container<Type, Deps, RegisteredDeps>, never>
	> = (deps: Partial<Deps> = {}) =>
		this[createValueSymbol]((k) => (k in deps ? { value: deps[k] } : null));

	private [createValueSymbol](
		parentCreateValue: (k: Key) => { value: any } | null
	): Type {
		const createValue = (kk: Key) => {
			const parentValue = parentCreateValue(kk);
			if (parentValue) {
				return parentValue;
			}

			const child = this.regDeps[kk];
			if (child) {
				return { value: child[createValueSymbol](createValue) };
			}

			return null;
		};
		return this.getValue(createValue as any);
	}

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
	register(key: Key | object, container?: Container<any, any, any> | any) {
		return new Container(this.getValue, {
			...this.regDeps,
			...(typeof key === 'object'
				? Object.fromEntries(
						getAllKeys(key).map((depKey) => [
							depKey,
							(key as any)[depKey] instanceof Container
								? (key as any)[depKey]
								: constant((key as any)[depKey]),
						])
				  )
				: {
						[key]:
							container instanceof Container
								? container
								: constant(container),
				  }),
		}) as any;
	}
}

export function getAllKeys(obj: any): Key[] {
	const keys: Key[] = Object.keys(obj);
	if (typeof Object.getOwnPropertySymbols === 'function') {
		return keys.concat(Object.getOwnPropertySymbols(obj));
	}
	return keys;
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
	return Container[constructorSymbol]<T, {}, {}>(() => value, {});
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
> = {
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
// export type HumanReadableType<T> = T;

export type GetValue<Type, Deps extends Dependencies> = (
	resolve: <K extends keyof Deps>(k: K) => { value: Deps[K] } | null
) => Type;
