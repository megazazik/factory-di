import { HumanReadableType, UnionToIntersection } from './container';

export * from './container';
export * from './factory';
export * from './computedValue';
export * from './class';
export * from './awaited';

// export type O = {
// 	p1: { p11: string; p12: number };
// 	p2: { p21: string; p22: number };
// };

// type TT<OO> = ((p: OO) => any) extends (p: infer T) => any ? T : never;

// type t = TT<O[keyof O]>;

// function ff<T extends Record<string, P>, P>(p: T): P {
// 	return p as any;
// }
// function fff<P>(p: Record<string, P>): P {
// 	return p as any;
// }

// const a = fff({} as O);

// interface Dep<K, T> {
// 	key: K;
// 	type: T;
// }
// export type PP = {
// 	dep1: Dep<'s1', 'string'>;
// 	dep2: Dep<'n1', 'number'>;
// };

// type D = PP[keyof PP];
// type dd = PP[keyof PP]['key'];
// type dt = PP[keyof PP]['type'];
// type ttt = D;
// type p = Partial<D>;

// type TTT = { p1: string } | { p2: number };
// declare function register<A extends Partial<{ p1: string } | { p2: number }>>(
// 	p: A
// ): A;
// declare function reg<
// 	A extends Partial<UnionToIntersection<{ p1: string } | { p2: number }>>
// >(p: A): A;
// type gg = TTT[keyof TTT];

// const aaa = register({ p1: '345', p2: '12313' });
// const aaaa = reg({ p1: '345', p2: 12313 });

type Dep<K extends string, V> = /* {
	[k in K]: V;
} &  */ {
	key: K;
	// value: V;
	dep: {
		[k in K]: V;
	};
	container: {
		[k in K]: C<V, any, any>;
	};
};

type Ch<K extends string, CC extends C<any, any, any>> = {
	[k in K]: CC;
} & {
	key: K;
};

type Stub = Ch<never, never>;

export class C<
	T,
	D extends Dep<any, any>,
	RegisteredDeps extends Ch<any, any> | Stub
> {
	v: T;
	__Deps: D;
	__registeredDeps: RegisteredDeps;
	__allDeps: AllDeps<this>;
	// __allDeps: AllDeps<C<D, RegisteredDeps>>

	// register<T extends this[' _allDeps']>(p: T): C<D, RegisteredDeps>;
	// register(p: HumanReadableType<Omit<AllDeps<this>, 'key'>>): C<D, RegisteredDeps>;
	// register(p: HumanReadableType<Omit<AllDeps<this>, 'key'>>): C<D, RegisteredDeps>;
	// register(p: UnionToIntersection<AllDeps<this>>): C<D, RegisteredDeps>;
	// register(p: this['__allDeps']['dep']): C<D, RegisteredDeps>;
	// register<T extends this['__allDeps']['dep']>(p: T): C<D, RegisteredDeps>;
	// register1<T extends this['__allDeps']['dep']>(
	// 	p: Partial<Pick<T, this['__allDeps']['key']>>
	// ): C<T, D, RegisteredDeps>;
	// register<T extends this['__allDeps']['container']>(
	// 	p: Partial<Pick<T, this['__allDeps']['key']>>
	// ): C<T, D, RegisteredDeps>;
	// register<T extends this['__allDeps']['container']>(
	// 	p: T
	// ): C<T, D, RegisteredDeps> {
	// 	return {} as any
	// }
	register<
		N extends Partial<UnionToIntersection<this['__allDeps']['container']>>
	>(p: N): C<T, D, RegisteredDeps & N> {
		// >(p: N): C<T, D, RegisteredDeps & Pick<N, this['__allDeps']['key']>> {
		return {} as any;
	}
}

// export type ContainerOf<T extends Dep<any, any>> =

export type Register<
	T,
	D extends Dep<any, any>,
	RegisteredDeps extends Ch<any, any> | Stub,
	AllDeps extends Dep<any, any>
> = <T extends D>(p: T) => T;

export type CC = C<boolean, Dep<'p1', number> | Dep<'p2', string>, Stub>;

export type CCC = C<
	boolean,
	Dep<'p1', number> | Dep<'p2', string>,
	Ch<'p1', C<number, Dep<'p3', number> | Dep<'p4', string>, Stub>>
>;

type AllDeps<T extends C<any, any, any>> =
	| T['__Deps']
	| RegsFromAllDeps<T['__registeredDeps']>['__allDeps'];
type RegsFromAllDeps<R extends Ch<any, any>> = R[R['key']];

type ttt = AllDeps<CC>;
type tttt = AllDeps<CCC>;

type f = RegsFromAllDeps<CC['__registeredDeps']>;
type ff = RegsFromAllDeps<CCC['__registeredDeps']>['__allDeps'];

type ggg = HumanReadableType<AllDeps<CCC>>;

export type C4 = C<
	boolean,
	Dep<'p5', number> | Dep<'p6', string>,
	Ch<'p1', CCC>
>;

type g5 = AllDeps<C4>['dep'];
type g2 = HumanReadableType<AllDeps<C4>>;
type g3 = Omit<AllDeps<C4>, 'key'>;
type g4 = UnionToIntersection<HumanReadableType<AllDeps<C4>['dep']>>;

// ----------------------- register
declare const c4: C4;

// c4.register({ p1: '123' });

function newC<T>(): C<T, never, Stub> {
	return null as any;
}

// c4.register({ p1: newC<number>(), p2: '123' });
// c4.register1({ p1: 123, p2: '123' });
const c5 = c4.register({
	p1: newC<number>(),
	p2: newC<string>(),
	p123123: true,
});

// -----------------------

type AA = (Dep<'p1', number> | Dep<'p2', string>) & Record<string, never>;
type AAA = AA['key'];
type AAAA = AA['p1'];
type AAAAA = AA['p2'];
type AAAAAA = AA[AA['key']];
