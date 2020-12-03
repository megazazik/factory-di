/* eslint-disable max-classes-per-file */
export type Key = string | symbol;
export type Dependencies = Record<Key, any>;

export type UnionToIntersection<U> = (
	U extends any ? (k: U) => void : never
) extends (k: infer I) => void
	? I
	: never;

export type ResolvedDeps<
	T extends Container<any, any, any>
> = T extends Container<any, any, infer D> ? D : never;

export type ValueOfContainer<
	T extends Container<any, any, any>
> = T extends Container<infer V, any, any> ? V : never;

export type FlatDependenciesUnion<
	Deps extends Record<Key, Container<any, any, any>>
> = [keyof Deps] extends [never]
	? {}
	: {
			[K in keyof Deps]: { [KK in K]: ValueOfContainer<Deps[K]> } &
				FlatDependenciesUnion<ResolvedDeps<Deps[K]>>;
	  }[keyof Deps];

export type FlatDependencies<
	Deps extends Record<Key, Container<any, any, any>>
> = UnionToIntersection<FlatDependenciesUnion<Deps>>;

type Resolve<MainType, Deps extends Record<Key, any>> = {
	(): MainType;
	<K extends keyof Deps>(key: K): Deps[K];
};

/** @todo Добавить иерархию */
/** @todo Скрывать resolve, когда зависимости не определены */
export type Container<
	Type,
	Deps extends Dependencies,
	ResolvedDeps extends Record<Key, Container<any, any, any>>
> = {
	registerValue<K extends keyof Deps>(
		key: K,
		dep: Deps[K]
	): Container<
		Type,
		Deps,
		ResolvedDeps & { [KK in K]: Container<Deps[K], {}, {}> }
	>;
	resolve: FlatDependencies<ResolvedDeps> extends Deps
		? Resolve<Type, FlatDependencies<ResolvedDeps>>
		: never;
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

type UnknownGuard<T> = T extends Dependencies ? T : never;

export type OfClass = {
	<T>(c: { new (): T }): Container<T, {}, {}>;
	<Params extends [...any[]], T, Keys extends MapTuple<Params, Key>>(
		c: { new (...args: Params): T },
		...keys: Keys
	): Container<T, UnknownGuard<CombineTuplesToMap<Keys, Params>>, {}>;
};

export const ofClass: OfClass = () => null as any;

// --------------------------------------------------------

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
a1.registerValue('myDep', 'sfd').resolve();

export const a2 = ofClass(C2, 'myDep', 'p2Dep');
export const aa2 = a2
	.registerValue('myDep', 'myStringValue')
	.registerValue('p2Dep', 123);

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

type FlatRec = UnionToIntersection<
	FlatDependenciesUnion<{
		dep1: Container<
			string,
			{},
			{
				inner1: Container<{ inner1Value: number }, {}, {}>;
				inner2: Container<
					boolean,
					{},
					{
						grandInner: Container<
							{ grandInnerValue: string },
							{},
							{}
						>;
					}
				>;
			}
		>;
		dep2: Container<{ dep2Value: string }, {}, {}>;
	}>
>;

declare const flatRec: FlatRec;

// flatRec.
