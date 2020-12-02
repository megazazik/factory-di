/* eslint-disable max-classes-per-file */

type Dependencies = Record<string | symbol, any>;

export type Container<
	Type,
	Deps extends Dependencies,
	ResolvedDeps extends Dependencies
> = {
	register<K extends keyof Deps>(
		key: K,
		dep: Deps[K]
	): Container<Type, Deps, ResolvedDeps & { [KK in K]: Deps[K] }>;
	resolve: ResolvedDeps extends Deps ? () => Type : never;
};

export type OfClass = {
	<T>(c: { new (): T }): Container<T, {}, {}>;
	<T, P1, K1 extends string | symbol>(
		c: { new (p1: P1): T },
		k1: K1
	): Container<T, { [P in K1]: P1 }, {}>;
	<T, P1, K1 extends string | symbol, P2, K2 extends string | symbol>(
		c: { new (p1: P1, p2: P2): T },
		k1: K1,
		k2: K2
	): Container<T, { [P in K1]: P1 } & { [P in K2]: P2 }, {}>;
};

export const ofClass: OfClass = () => null as any;

class C0 {}
class C1 {
	constructor(public p1: string) {}
}
class C2 {
	constructor(public p1: string, public p2: number) {}
}

export const a0 = ofClass(C0);
export const a1 = ofClass(C1, 'myDep');
a1.register('myDep', 'sfd').resolve();

export const a2 = ofClass(C2, 'myDep', 'p2Dep');
export const aa2 = a2.register('myDep', 'myStringValue').register('p2Dep', 123);

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

export type AA = {
	[key: string]: Record<string, number>;
};

type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (
	k: infer I
) => void
	? I
	: never;

type Flat<T extends AA> = UnionToIntersection<T[keyof T]>;

type FlatRec = Flat<{
	myRec1: { value1: 12; value2: 345 };
	myRec2: { value3: 5354345 };
}>;
