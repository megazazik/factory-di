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

export type Container<
	Type,
	Deps extends Dependencies,
	RegisteredDeps extends Record<Key, ContainerData<any, any, any>>
> = ContainerData<Type, Deps, RegisteredDeps> & {
	register: Register<Type, Deps, RegisteredDeps>;
	resolve: Resolve<Type, Deps, RegisteredDeps>;
};

export type Resolve<
	MainType,
	Deps,
	RegisteredDeps extends Record<Key, ContainerData<any, any, any>>
> = FlatRegisteredDependencies<RegisteredDeps> extends RequiredDepsOfContainer<
	Deps,
	RegisteredDeps
>
	? {
			(): MainType;
			<K extends keyof RequiredDepsOfContainer<Deps, RegisteredDeps>>(
				key: K
			): RequiredDepsOfContainer<Deps, RegisteredDeps>[K];
	  }
	: NotRegisteredDependenciesError<
			Omit<
				RequiredDepsOfContainer<Deps, RegisteredDeps>,
				keyof FlatRegisteredDependencies<RegisteredDeps>
			>
	  >;

export type NotRegisteredDependenciesError<
	NotRegistered
> = 'Not registered dependencies' & {
	missingKeys?: keyof NotRegistered;
};

export type Register<
	Type,
	Deps extends Record<Key, any>,
	RegisteredDeps extends Record<Key, ContainerData<any, any, any>>
> = <
	K extends keyof (Deps & FlatDependencies<RegisteredDeps>),
	Child extends ContainerData<
		(Deps & FlatDependencies<RegisteredDeps>)[K],
		any,
		any
	>
>(
	key: K,
	child: Child
) => Container<Type, Deps, RegisteredDeps & { [KK in K]: Child }>;

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

	return {
		...containerData,
		register: ((key, container) => {
			return createContainer({
				...containerData,
				registeredDeps: {
					...containerData.registeredDeps,
					[key]: container,
				},
			});
		}) as Register<Type, Deps, RegisteredDeps>,
		resolve: ((key?: Key) => innerResolve(key)) as any,
	};
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

/** @todo дописать проверку на добавление одинаковых ключей для зависимостей разных типов */
