import { UnionToIntersection } from './container';

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
