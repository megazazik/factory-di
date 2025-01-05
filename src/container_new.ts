import { constructorSymbol, createValueSymbol } from './innerMethods';

declare const depsKey: unique symbol;
declare const allDepsKey: unique symbol;
declare const registeredDepsKey: unique symbol;

export type GetValue<Type, Deps extends Dependencies> = (
	resolve: <K extends keyof Deps>(k: K) => { value: Deps[K] } | null,
	singltonTokens: Set<Key>
) => Type;

// export type ComputeContainerAllDeps<
// 	Deps extends Dependencies,
// 	RegisteredDeps extends Record<Key, Container<any, any, any>>
// > = Deps & RegisteredDeps[keyof RegisteredDeps][typeof allDepsKey]
export type ComputeContainerAllDeps<
	Deps extends Dependencies,
	RegisteredDeps extends Record<Key, Container<any, any, any>>
> = Deps &
	UnionToIntersection<
		RegisteredDeps[keyof RegisteredDeps][typeof allDepsKey]
	>;

type AllDeps<
	Deps extends Dependencies,
	RegisteredDeps extends Record<Key, Container<any, any, any>>
> = Deps &
	// RegisteredDeps[keyof RegisteredDeps][typeof allDepsKey];
	({} extends RegisteredDeps
		? {}
		: RegisteredDeps[keyof RegisteredDeps][typeof allDepsKey]);

export class Container<
	Type,
	Deps extends Dependencies,
	RegisteredDeps extends Record<Key, Container<any, any, any>>
> {
	[depsKey]: Deps;
	[registeredDepsKey]: RegisteredDeps;
	[allDepsKey]: AllDeps<Deps, RegisteredDeps>;

	private constructor(
		private getValue: GetValue<Type, Deps>,
		private regDeps: RegisteredDeps,
		private singltonTokens: Set<Key>
	) {}

	static [constructorSymbol]<
		Type,
		Deps extends Dependencies,
		RegisteredDeps extends Record<Key, Container<any, any, any>>
	>(getValue: GetValue<Type, Deps>, regDeps: RegisteredDeps) {
		return new Container<Type, Deps, RegisteredDeps>(
			getValue,
			regDeps,
			new Set()
		);
	}

	singlton(
		// ...tokens: Array<keyof AllDeps>
		// ...tokens: Array<keyof ComputeContainerAllDeps<Deps, RegisteredDeps>>
		...tokens: Array<keyof UnionToIntersection<this[typeof allDepsKey]>>
	): Container<Type, Deps, RegisteredDeps> {
		return new Container(
			this.getValue,
			this.regDeps,
			new Set([...this.singltonTokens, ...(tokens as Key[])])
		);
	}

	readonly resolve: Resolve<
		Type,
		// ComputeContainerAllDeps<Deps, RegisteredDeps>, // AllDeps,
		this[typeof allDepsKey],
		RequiredDeps<this, never>
	> = ((deps: Partial<Deps> = {}) =>
		this[createValueSymbol](
			(k) => (k in deps ? { value: deps[k] } : null),
			new Set()
		)) as any;

	[createValueSymbol](
		parentCreateValue: (k: Key) => { value: any } | null,
		parentSingltonTokens: Set<Key>
	): Type {
		const instances = new Map<Key, any>();

		const singltonTokens = new Set([
			...this.singltonTokens,
			...parentSingltonTokens,
		]);

		const createValue = (kk: Key) => {
			if (instances.has(kk)) {
				return { value: instances.get(kk) };
			}

			const parentValue = parentCreateValue(kk);
			if (parentValue) {
				if (singltonTokens.has(kk)) {
					instances.set(kk, parentValue.value);
				}
				return parentValue;
			}

			const child = this.regDeps[kk];
			if (child) {
				const childValue = child[createValueSymbol](
					createValue,
					singltonTokens
				);

				if (singltonTokens.has(kk)) {
					instances.set(kk, childValue);
				}
				return { value: childValue };
			}

			return null;
		};
		return this.getValue(createValue as any, singltonTokens);
	}

	// register<
	// 	NewDeps extends Partial<
	// 		// DepsToContainerData<ComputeContainerAllDeps<Deps, RegisteredDeps>>
	// 		DepsToContainerData<this[typeof allDepsKey]>
	// 	>
	// >(
	// 	// register<NewDeps extends Partial<DepsToContainerData<AllDeps>>>(
	// 	deps: NewDeps
	// ): Container<
	// 	Type,
	// 	Deps,
	// 	HumanReadableType<
	// 		Omit<RegisteredDeps, keyof NewDeps> &
	// 			MapConstantsToContainers<NewDeps>
	// 	>
	// >;
	// register<
	// 	// K extends keyof ComputeContainerAllDeps<Deps, RegisteredDeps>,
	// 	K extends keyof this[typeof allDepsKey],
	// 	Child extends Container<
	// 		this[typeof allDepsKey][K],
	// 		// ComputeContainerAllDeps<Deps, RegisteredDeps>[K],
	// 		any,
	// 		any
	// 	>
	// 	// K extends keyof AllDeps,
	// 	// Child extends Container<AllDeps[K], any, any>
	// >(
	// 	key: K,
	// 	child: Child
	// ): Container<
	// 	Type,
	// 	Deps,
	// 	HumanReadableType<Omit<RegisteredDeps, K> & { [KK in K]: Child }>
	// >;
	// register<
	// 	// K extends keyof ComputeContainerAllDeps<Deps, RegisteredDeps>,
	// 	// Value extends ComputeContainerAllDeps<Deps, RegisteredDeps>[K]
	// 	K extends keyof this[typeof allDepsKey],
	// 	Value extends this[typeof allDepsKey][K]
	// >(
	// 	// register<K extends keyof AllDeps, Value extends AllDeps[K]>(
	// 	key: K,
	// 	child: Value
	// ): Container<
	// 	Type,
	// 	Deps,
	// 	HumanReadableType<
	// 		Omit<RegisteredDeps, K> & {
	// 			[KK in K]: Container<Value, {}, {}>;
	// 		}
	// 	>
	// >;
	register: Register<Type, Deps, RegisteredDeps, this[typeof allDepsKey]> = ((
		key: Key | object,
		container?: Container<any, any, any> | any
	) => {
		return new Container(
			this.getValue,
			{
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
			},
			this.singltonTokens
		) as any;
	}) as any;
}

export type Register<
	Type,
	Deps extends Dependencies,
	RegisteredDeps extends Record<Key, Container<any, any, any>>,
	AllDeps extends Dependencies
> = {
	<
		NewDeps extends Partial<
			// DepsToContainerData<ComputeContainerAllDeps<Deps, RegisteredDeps>>
			DepsToContainerData<UnionToIntersection<AllDeps>>
		>
	>(
		// register<NewDeps extends Partial<DepsToContainerData<AllDeps>>>(
		deps: NewDeps
	): Container<
		Type,
		Deps,
		HumanReadableType<
			Omit<RegisteredDeps, keyof NewDeps> &
				MapConstantsToContainers<NewDeps>
		>
		// ComputeContainerAllDeps<
		// 	Deps,
		// 	HumanReadableType<
		// 		Omit<RegisteredDeps, keyof NewDeps> &
		// 			MapConstantsToContainers<NewDeps>
		// 	>
		// >
	>;
	<
		// K extends keyof ComputeContainerAllDeps<Deps, RegisteredDeps>,
		K extends keyof UnionToIntersection<AllDeps>,
		Child extends Container<
			UnionToIntersection<AllDeps>[K],
			// ComputeContainerAllDeps<Deps, RegisteredDeps>[K],
			any,
			any
		>
		// K extends keyof AllDeps,
		// Child extends Container<AllDeps[K], any, any>
	>(
		key: K,
		child: Child
	): Container<
		Type,
		Deps,
		HumanReadableType<Omit<RegisteredDeps, K> & { [KK in K]: Child }>
		// ComputeContainerAllDeps<
		// 	Deps,
		// 	HumanReadableType<Omit<RegisteredDeps, K> & { [KK in K]: Child }>
		// >
	>;
	<
		// K extends keyof ComputeContainerAllDeps<Deps, RegisteredDeps>,
		// Value extends ComputeContainerAllDeps<Deps, RegisteredDeps>[K]
		K extends keyof UnionToIntersection<AllDeps>,
		Value extends UnionToIntersection<AllDeps>[K]
	>(
		// register<K extends keyof AllDeps, Value extends AllDeps[K]>(
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
};

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
			(deps: Partial<UnionToIntersection<Deps>> & object): MainType;
	  }
	: (
			deps: HumanReadableType<
				Partial<Omit<UnionToIntersection<Deps>, RequiredDepsTokens>> &
					SafePick<UnionToIntersection<Deps>, RequiredDepsTokens>
			>
	  ) => MainType;

type SafePick<T, K extends Key> = {
	[P in keyof T as P extends K ? P : never]: T[P];
};

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

export type DependenciesMap<Params extends object> = {
	[K in keyof Params]: Key | Container<Params[K], any, any>;
};

export type ContainerFromParamsAsObject<
	Params extends object,
	T,
	KeysMap extends DependenciesMap<Params>
> = KeysMap extends Key // на случай, если передали токен, который соответствует типу первого параметра
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
