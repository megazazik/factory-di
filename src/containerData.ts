export type Key = string | symbol;
export type Dependencies = Record<Key, any>;

declare const DepsSymbol: unique symbol;

export type ContainerData<
	Type,
	Deps extends Dependencies,
	RegisteredDeps extends Record<Key, ContainerData<any, any, any>>
> = {
	[DepsSymbol]?: Deps;
	registeredDeps: RegisteredDeps;
	getValue: GetValue<Type, Deps>;
};

export type GetValue<Type, Deps extends Dependencies> = (
	resolve: <K extends keyof Deps>(k: K) => Deps[K]
) => Type;

export type RegisteredDepsOfContainer<T extends ContainerData<any, any, any>> =
	T['registeredDeps'];

export type DepsOfContainer<T extends ContainerData<any, any, any>> =
	T[typeof DepsSymbol];

export type ValueOfContainer<T extends ContainerData<any, any, any>> =
	ReturnType<T['getValue']>;

export type FlatDependenciesUnion<
	Deps extends Record<Key, ContainerData<any, any, any>>
> = [keyof Deps] extends [never]
	? {}
	: {
			[K in keyof Deps]: DepsOfContainer<Deps[K]> &
				FlatDependenciesUnion<RegisteredDepsOfContainer<Deps[K]>>;
	  }[keyof Deps];

export type FlatDependencies<
	Deps extends Record<Key, ContainerData<any, any, any>>
> = UnionToIntersection<FlatDependenciesUnion<Deps>>;

export type AllDependenciesOfContainer<T extends ContainerData<any, any, any>> =
	DepsOfContainer<T> & FlatDependencies<RegisteredDepsOfContainer<T>>;

export type UnionToIntersection<U> = (
	U extends any ? (k: U) => void : never
) extends (k: infer I) => void
	? I
	: never;

export type FlatRegisteredDependenciesUnion<
	Deps extends Record<Key, ContainerData<any, any, any>>
> = [keyof Deps] extends [never]
	? {}
	: {
			[K in keyof Deps]: { [KK in K]: ValueOfContainer<Deps[K]> } &
				FlatRegisteredDependenciesUnion<
					RegisteredDepsOfContainer<Deps[K]>
				>;
	  }[keyof Deps];

export type FlatRegisteredDependencies<
	Deps extends Record<Key, ContainerData<any, any, any>>
> = UnionToIntersection<FlatRegisteredDependenciesUnion<Deps>>;

export type RequiredDependenciesUnion<
	Deps extends Record<Key, any>,
	RegisteredDeps extends Record<Key, ContainerData<any, any, any>>,
	AboveRegistered
> = Deps &
	({} extends RegisteredDeps
		? {}
		: {
				[K in keyof RegisteredDeps]: K extends AboveRegistered
					? {}
					: RequiredDependenciesUnion<
							DepsOfContainer<RegisteredDeps[K]>,
							RegisteredDepsOfContainer<RegisteredDeps[K]>,
							keyof RegisteredDeps | AboveRegistered
					  >;
		  }[keyof RegisteredDeps]);

export type RequiredDepsOfContainer<
	Deps extends Record<Key, any>,
	RegisteredDeps extends Record<Key, ContainerData<any, any, any>>
> = UnionToIntersection<RequiredDependenciesUnion<Deps, RegisteredDeps, never>>;
