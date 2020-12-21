/* eslint-disable max-classes-per-file */
import {
	Key,
	ContainerData,
	Dependencies,
	UnionToIntersection,
	FlatDependencies,
	FlatRegisteredDependencies,
	RequiredDepsOfContainer,
	RequiredDependenciesUnion,
} from './containerData';

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
			Exclude<
				keyof RequiredDepsOfContainer<Deps, RegisteredDeps>,
				keyof FlatRegisteredDependencies<RegisteredDeps>
			>
	  >;

export type NotRegisteredDependenciesError<
	NotRegistered
> = 'Not registered dependencies' & {
	missingKeys?: NotRegistered;
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

type UnknownGuard<T> = T extends Dependencies ? T : never;

function create<
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
			return create({
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
	const { resolve } = getContainerDataResolves(
		containerData,
		(k: Key) => {
			throw new Error(`Dependency "${String(k)}" is not registered`);
		},
		{}
	);
	return resolve;
}

function getAllKeys(obj: any): Key[] {
	return Object.keys(obj);
}

function getContainerDataResolves(
	{ getValue, registeredDeps }: ContainerData<any, any, any>,
	parentResolve: (key: Key) => any,
	overrideDeps: Record<Key, () => any>
) {
	const registeredResolves = getAllKeys(registeredDeps).reduce(
		(prev, k) =>
			Object.assign(prev, {
				[k]: () => registeredDeps[k].getValue(resolve),
			}),
		{}
	);
	const currentDependencies: Record<Key, () => any> = {
		...registeredResolves,
		...overrideDeps,
	};

	const deps: Record<Key, () => any> = {};

	getAllKeys(registeredDeps).forEach((childKey) => {
		const childDeps = getContainerDataResolves(
			registeredDeps[childKey],
			resolve,
			currentDependencies
		);
		Object.assign(deps, childDeps.deps);
		Object.assign(currentDependencies, { [childKey]: childDeps.resolve });
	});
	Object.assign(deps, currentDependencies);

	// const flatDeps = getFlatDependencies(registeredDeps);

	// /** @todo проверить с symbol */
	// const deps: any = Object.entries(flatDeps).reduce(
	// 	(prev, [key, data]) =>
	// 		Object.assign(prev, {
	// 			[key]: () => (data as any).getValue(resolve),
	// 		}),
	// 	{}
	// );

	function resolve(key?: any): any {
		if (key == undefined) {
			return getValue(resolve);
		}

		if (deps[key]) {
			return deps[key]();
		}

		return parentResolve(key);
	}

	return {
		resolve,
		deps,
	};
}

function getFlatDependencies(
	deps: Record<Key, ContainerData<any, any, any>>
): any {
	/** @todo проверить с symbol */
	return Object.keys(deps).reduce(
		(prev, key) =>
			Object.assign(prev, getFlatDependencies(deps[key].registeredDeps)),
		{ ...deps }
	);
}

export type OfClass = {
	<T>(c: { new (): T }): Container<T, {}, {}>;
	<Params extends [...any[]], T, Keys extends MapTuple<Params, Key>>(
		c: { new (...args: Params): T },
		...keys: Keys
	): Container<T, UnknownGuard<CombineTuplesToMap<Keys, Params>>, {}>;
};

export const ofClass: OfClass = (Constructor: any, ...argNames: string[]) =>
	create({
		registeredDeps: {},
		getValue: (resolve) => new Constructor(...argNames.map(resolve)),
	});

export const ofConstant = <T>(value: T) =>
	create({
		registeredDeps: {},
		getValue: () => value,
	}) as Container<T, {}, {}>;

/** @todo написать реализацию */
/** @todo описать типы параметров */
export const ofComputedValue = <T>(getValue: () => T) =>
	(null as unknown) as Container<T, {}, {}>;

/** @todo написать реализацию */
/** @todo описать типы параметров */
export const ofFactory = <T>(factory: (getValue: Key) => T) =>
	(null as unknown) as Container<T, {}, {}>;

/** @todo дописать проверку на добавление одинаковых ключей для зависимостей разных типов*/

// --------------------------------------------------------
/** @todo удалить все, что ниже */
class C0 {}
class C1 {
	constructor(public p1: string) {}
}
class C2 {
	constructor(public p1: string, public p2: number) {}
}

type Args = ConstructorParameters<typeof C2>;

type Tuple = [number, boolean];

type TupleElement = Tuple[1];

type MapTupleTest = MapTuple<Tuple, string>;

type Map2TupleTest = CombineTuplesToMap<['dep1', 'dep2'], [string, number]>;

export const a0 = ofClass(C0);
export const a1 = ofClass(C1, 'myDep');
a1.register('myDep', ofConstant('sfd')).resolve();

export const a2 = ofClass(C2, 'myDep', 'p2Dep');
export const aa2 = a2
	.register('myDep', ofConstant('myStringValue'))
	.register('p2Dep', ofConstant(123));

class A {
	constructor(public p1: string, public p2: number) {}
}

type TypeAreSame<T1, T2, Success, Fail> = T1 extends T2
	? T2 extends T1
		? Success
		: Fail
	: Fail;

type ArgsOfClass<T> = T extends { new (...args: infer A): any } ? A : never;

type Test = ArgsOfClass<typeof A>;

type TT = { [K in keyof Test]: number extends K ? boolean : never };

type NonN = { p1: string } & { p2: number };

type Normalize<T> = {
	[K in keyof T]: T[K];
};

type Norm = Normalize<NonN>;

// ---------------------------------------------------

// export type Element<Children extends Record<string, Element<any>>> = {
// 	children: Children;
// };

// type Flat<T extends AA> = UnionToIntersection<{
// 	[K in keyof T]: T[K] extends AA ? Flat<T[K]> : T[K]
// }>;

// type Flat<T extends Element<any>> = UnionToIntersection<T[keyof T]>;
// type Flat<T extends AA> = T[keyof T];

// type Flat<T extends AA> = {
// 	[K in keyof T]: T[K] extends AA ? Flat<T[K]> : T[K]
// };

// type FlatRec = UnionToIntersection<Flat<{
// 	myRec1: { value1: 12; child: { value2: 123, grandChild: {value25: 345345}} };
// 	myRec2: { value3: 5354345 };
// }>>;

// type Flat<T extends Container<any, any, any>> = UnionToIntersection<T[keyof T]>;

// type Flat<T extends Container<any, any, any>> = UnionToIntersection<{
// 	[K in keyof ResolvedDeps<T>]: Flat<ResolvedDeps<T>[K]>;
// }>;

// type Flat<T extends Container<any, any, any>> = {
// 	[K in keyof ResolvedDeps<T>]: Flat<ResolvedDeps<T>[K]>;
// };

type FlatDepsRec = FlatDependencies<{
	dep1: ContainerData<
		string,
		{
			dep11: string;
			dep12: number;
		},
		{
			inner1: ContainerData<
				{ inner1Value: number },
				{
					innerDep11: boolean;
				},
				{}
			>;
			inner2: ContainerData<
				boolean,
				{ innerDep12: number },
				{
					grandInner: ContainerData<
						{ grandInnerValue: string },
						{ grandInner: string },
						{}
					>;
				}
			>;
		}
	>;
	dep2: ContainerData<
		{ dep2Value: string },
		{
			dep22: { dep2Value: number };
		},
		{}
	>;
}>;

declare const flatDepsRec: FlatDepsRec;

// flatDepsRec.;

type TopLevelRequiredDeps = RequiredDependenciesUnion<
	{
		dep1: string;
		dep2: { dep2Value: string };
	},
	{
		dep1: Container<
			string,
			{
				dep11: string;
				dep12: number;
			},
			{
				inner1: Container<
					{ inner1Value: number },
					{
						innerDep11: boolean;
					},
					{}
				>;
				inner2: Container<
					boolean,
					{ innerDep12: number },
					{
						grandInner: Container<
							{ grandInnerValue: string },
							{ grandInner: string },
							{}
						>;
					}
				>;
			}
		>;
		dep2: Container<
			{ dep2Value: string },
			{
				dep22: { dep2Value: number };
			},
			{}
		>;
	},
	'inner1'
	// never
>;

declare const required: keyof UnionToIntersection<TopLevelRequiredDeps>;

type ReqDeps = RequiredDepsOfContainer<
	{
		dep1: string;
		dep2: { dep2Value: string };
	},
	{
		dep1: Container<
			string,
			{
				inner1: { inner1Value: number };
				inner2: boolean;
			},
			{
				// inner1: Container<
				// 	{ inner1Value: number },
				// 	{
				// 		// innerDep11: boolean;
				// 	},
				// 	{}
				// >;
				inner2: Container<
					boolean,
					{ innerDep12: number },
					{
						grandInner: Container<
							{ grandInnerValue: string },
							{ grandInner: string },
							{}
						>;
					}
				>;
			}
		>;
		// dep2: Container<
		// 	{ dep2Value: string },
		// 	{
		// 		dep22: { dep2Value: number };
		// 		inner2: boolean;
		// 	},
		// 	{}
		// >;
		inner2: Container<
			boolean,
			{
				// dep22: { dep2Value: number };
			},
			{}
		>;
	}
	// 'inner2'
	// never
>;

declare const req: keyof ReqDeps;

type TTT<T> = T[keyof T];

type ttt = UnionToIntersection<TTT<{}> | { p1: 1 } | {}>;
