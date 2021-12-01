import {
	Key,
	ContainerData,
	Dependencies,
	UnionToIntersection,
	FlatDependencies,
	FlatRegisteredDependencies,
	RequiredDepsOfContainer,
} from './containerData';
import { InnerStorageKey } from './innerStorage';

const ContainerSymbol: unique symbol =
	typeof Symbol === 'function'
		? Symbol('ContainerSymbol')
		: ('__ContainerSymbol__' as any);

export type Container<
	Type,
	Deps extends Dependencies,
	RegisteredDeps extends Record<Key, ContainerData<any, any, any>>
> = ContainerData<Type, Deps, RegisteredDeps> & {
	register: Register<Type, Deps, RegisteredDeps>;
	resolve: Resolve<
		Type,
		FlatRegisteredDependencies<RegisteredDeps>,
		RequiredDepsOfContainer<Deps, RegisteredDeps>
	>;
	[ContainerSymbol]: true;
};

export type Resolve<MainType, FlatRegisteredDeps, FlatRequiredDeps> =
	FlatRegisteredDeps extends FlatRequiredDeps
		? {
				(): MainType;
				<K extends keyof FlatRequiredDeps>(key: K): FlatRequiredDeps[K];
		  }
		: ResolveWithRequiredDeps<
				Omit<FlatRequiredDeps, keyof FlatRegisteredDeps> &
					Partial<FlatRequiredDeps>,
				MainType
		  >;

export type ResolveWithRequiredDeps<Deps, Value> = (deps: Deps) => Value;

export type Register<
	Type,
	Deps extends Record<Key, any>,
	RegisteredDeps extends Record<Key, ContainerData<any, any, any>>
> = {
	<
		NewDeps extends Partial<
			DepsToContainerData<Deps & FlatDependencies<RegisteredDeps>>
		>
	>(
		deps: NewDeps &
			Partial<
				DepsToContainerData<Deps & FlatDependencies<RegisteredDeps>>
			>
	): Container<
		Type,
		Deps,
		RegisteredDeps & MapConstantsToContainers<NewDeps>
	>;
	<
		K extends keyof (Deps & FlatDependencies<RegisteredDeps>),
		Child extends ContainerData<
			(Deps & FlatDependencies<RegisteredDeps>)[K],
			any,
			any
		>
	>(
		key: K,
		child: Child
	): Container<Type, Deps, RegisteredDeps & { [KK in K]: Child }>;
	<
		K extends keyof (Deps & FlatDependencies<RegisteredDeps>),
		Child extends (Deps & FlatDependencies<RegisteredDeps>)[K]
	>(
		key: K,
		child: Child
	): Container<
		Type,
		Deps,
		RegisteredDeps & { [KK in K]: ContainerData<Child, {}, {}> }
	>;
};

export type MapConstantsToContainers<T extends Record<Key, any>> = {
	[K in keyof T]: T[K] extends ContainerData<any, any, any>
		? T[K]
		: ContainerData<T[K], {}, {}>;
};

export type DepsToContainerData<Deps> = {
	[K in keyof Deps]: ContainerData<Deps[K], any, any> | Deps[K];
};

export type MapTuple<T extends [...any[]], NewValue> = {
	[I in keyof T]: NewValue;
};

export type CombineTuplesToMap<
	T extends [...Key[]],
	NewValues extends [...any[]]
> = UnionToIntersection<
	{
		[I in keyof T]: T[I] extends Key
			? {
					[K in T[I]]: I extends keyof NewValues
						? NewValues[I]
						: never;
			  }
			: never;
	}[number]
>;

export type UnknownGuard<T> = T extends Dependencies ? T : never;

function isContainer(v: any): v is Container<any, any, any> {
	return v?.[ContainerSymbol] === true;
}

export function createContainer<
	Type,
	Deps extends Dependencies,
	RegisteredDeps extends Record<Key, ContainerData<any, any, any>>
>(
	containerData: ContainerData<Type, Deps, RegisteredDeps>
): Container<Type, Deps, RegisteredDeps> {
	let innerResolve: any = (key?: Key) => {
		// при первом вызове создаем resolve и заменяем им созданные ранее
		const newResolve = createResolve(containerData);
		innerResolve = newResolve;
		return newResolve(key);
	};

	const register = ((
		key: Key | object,
		container?: ContainerData<any, any, any> | any
	) => {
		return createContainer({
			...containerData,
			registeredDeps: {
				...containerData.registeredDeps,
				...(typeof key === 'object'
					? Object.fromEntries(
							getAllKeys(key).map((depKey) => [
								depKey,
								isContainer((key as any)[depKey])
									? (key as any)[depKey]
									: constant((key as any)[depKey]),
							])
					  )
					: {
							[key]: isContainer(container)
								? container
								: constant(container),
					  }),
			},
		});
	}) as any;

	return {
		...containerData,
		register,
		resolve: ((key?: Key) => {
			// переданы новые зависимости
			if (typeof key === 'object') {
				return register(key).resolve();
			}
			return innerResolve(key);
		}) as any,
		[ContainerSymbol]: true,
	};
}

export function constant<T>(value: T) {
	return createContainer({
		registeredDeps: {},
		getValue: () => value,
	}) as Container<T, {}, {}>;
}

function createResolve(containerData: ContainerData<any, any, any>) {
	const innerStorage = {};

	const { resolve } = getContainerDataResolves(
		containerData,
		(k: Key) => {
			if (k === InnerStorageKey) {
				return innerStorage;
			}
			throw new Error(`Dependency "${String(k)}" is not registered`);
		},
		new Set()
	);
	return resolve;
}

export function getAllKeys(obj: any): Key[] {
	const keys: Key[] = Object.keys(obj);
	if (typeof Object.getOwnPropertySymbols === 'function') {
		return keys.concat(Object.getOwnPropertySymbols(obj));
	}
	return keys;
}

function getContainerDataResolves(
	{ getValue, registeredDeps }: ContainerData<any, any, any>,
	parentResolve: (key: Key) => any,
	overrideDeps: Set<Key>
) {
	const currentDeps = new Set(
		Array.from(overrideDeps).concat(getAllKeys(registeredDeps))
	);

	const deps: Record<Key, () => any> = {};

	getAllKeys(registeredDeps).forEach((childKey) => {
		const childDeps = getContainerDataResolves(
			registeredDeps[childKey],
			resolve,
			currentDeps
		);
		Object.assign(deps, childDeps.deps, { [childKey]: childDeps.resolve });
	});

	function resolve(key?: any): any {
		if (key == undefined) {
			return getValue(resolve);
		}

		if (deps[key] && !overrideDeps.has(key)) {
			return deps[key]();
		}

		return parentResolve(key);
	}

	return {
		resolve,
		deps,
	};
}

export type ObjectValuesIntersection<T> = UnionToIntersection<T[keyof T]>;

export type ContainerDataValueKeys<T> = {
	[P in keyof T]: T[P] extends ContainerData<any, any, any> ? P : never;
}[keyof T];

/** @todo дописать проверку на добавление одинаковых ключей для зависимостей разных типов */
