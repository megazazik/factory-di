import { expectType, expectAssignable, expectError } from 'tsd';
import {
	Class,
	Container,
	constant,
	ResolveWithRequiredDeps,
	ContainerData,
} from '..';

class C0 {}

export function ofClassWithoutDeps() {
	expectType<Container<C0, {}, {}>>(Class(C0));
	expectType<C0>(Class(C0).resolve());
}

class C1 {
	constructor(public p1: string) {}
}

export function ofClassOneDep() {
	expectType<Container<C1, { dep1: string }, {}>>(Class(C1, 'dep1'));
	expectType<C1>(
		Class(C1, 'dep1').register('dep1', constant('asdfdf')).resolve()
	);
}

export function ofClassOneDepNoRegistered() {
	expectType<C1>(Class(C1, 'dep1').resolve({ dep1: 'sdg' }));

	expectError(Class(C1, 'dep1').resolve({}));
}

class C2 {
	constructor(public p1: string, public p2: number) {}
}

export function ofClassTwoDep() {
	expectType<Container<C2, { dep1: string } & { dep2: number }, {}>>(
		Class(C2, 'dep1', 'dep2')
	);

	expectType<C2>(
		Class(C2, 'dep1', 'dep2')
			.register('dep1', constant('asdfdf'))
			.register('dep2', constant(123))
			.resolve()
	);
}

export function ofClassTwoDepNoRegistered() {
	expectType<
		ResolveWithRequiredDeps<
			{ dep1: string; dep2: number } & { dep1?: string; dep2?: number },
			C2
		>
	>(Class(C2, 'dep1', 'dep2').resolve);

	expectType<
		ResolveWithRequiredDeps<
			{ dep1: string } & { dep1?: string; dep2?: number },
			C2
		>
	>(Class(C2, 'dep1', 'dep2').register('dep2', constant(123)).resolve);
}

class C1Object {
	constructor(public params: { p1: string }) {}
}

export function ofClassObjectOneDep() {
	expectType<Container<C1Object, { dep1: string }, {}>>(
		Class(C1Object, { p1: 'dep1' })
	);
	expectType<C1Object>(
		Class(C1Object, { p1: 'dep1' })
			.register('dep1', constant('asdfdf'))
			.resolve()
	);
}

export function ofClassObjectOneDepNoRegistered() {
	expectAssignable<ResolveWithRequiredDeps<{ dep1: string }, C1Object>>(
		Class(C1Object, { p1: 'dep1' }).resolve
	);
}

class C2Object {
	constructor(public params: { p1: string; p2: number }) {}
}

export function ofClassObjectTwoDep() {
	expectType<Container<C2Object, { dep1: string } & { dep2: number }, {}>>(
		Class(C2Object, { p1: 'dep1', p2: 'dep2' })
	);

	expectType<C2Object>(
		Class(C2Object, { p1: 'dep1', p2: 'dep2' })
			.register('dep1', constant('asdfdf'))
			.register('dep2', constant(123))
			.resolve()
	);
}

export function ofClassObjectTwoDepNoRegistered() {
	expectAssignable<
		ResolveWithRequiredDeps<{ dep1: string; dep2: number }, C2Object>
	>(Class(C2Object, { p1: 'dep1', p2: 'dep2' }).resolve);

	expectAssignable<ResolveWithRequiredDeps<{ dep1: string }, C2Object>>(
		Class(C2Object, { p1: 'dep1', p2: 'dep2' }).register(
			'dep2',
			constant(123)
		).resolve
	);
}

export function ofClassObjectOneDepNoToken() {
	expectType<
		Container<
			C1Object,
			{ p1: string },
			{
				p1: Container<string, {}, {}>;
			}
		>
	>(Class(C1Object, { p1: constant('dep1') }));

	expectType<C1Object>(Class(C1Object, { p1: constant('dep1') }).resolve());
}

class WithC1 {
	constructor(public params: { c1: C1 }) {}
}

export function ofClassObjectFullEmbeddedDepNoToken() {
	expectType<
		Container<
			WithC1,
			{ c1: C1 },
			{
				c1: Container<
					C1,
					{ p1: string },
					{ p1: Container<'sdfsf', {}, {}> }
				>;
			}
		>
	>(
		Class(WithC1, {
			c1: Class(C1, 'p1').register('p1', constant('sdfsf')),
		})
	);

	expectType<WithC1>(
		Class(WithC1, {
			c1: Class(C1, 'p1').register('p1', constant('sdfsf')),
		}).resolve()
	);
}

export function ofClassObjectNoFullEmbeddedDepNoToken() {
	expectType<
		Container<
			WithC1,
			{ c1: C1 },
			{
				c1: Container<C1, { p1: string }, {}>;
			}
		>
	>(
		Class(WithC1, {
			c1: Class(C1, 'p1'),
		})
	);

	expectType<WithC1>(
		Class(WithC1, {
			c1: Class(C1, 'p1'),
		}).resolve({ p1: 'sdvdfv' })
	);

	expectError(
		Class(WithC1, {
			c1: Class(C1, 'p1'),
		}).resolve()
	);
}

export function ofClassObjectTwoDepNoToken() {
	expectType<
		Container<
			C2Object,
			{ p1: string } & { p2: number },
			{
				p1: Container<string, {}, {}>;
				p2: Container<number, {}, {}>;
			}
		>
	>(Class(C2Object, { p1: constant('123'), p2: constant(312) }));

	expectType<C2Object>(
		Class(C2Object, {
			p1: constant('dep1'),
			p2: constant(321),
		}).resolve()
	);
}

export function ofClassWrongParams() {
	expectError(
		Class(C2Object, {
			p1: true,
			p2: constant(321),
		})
	);

	expectError(
		Class(C2Object, {
			p1: constant(321),
			p2: constant(321),
		})
	);

	/** @todo сделать, чтобы проходил один из следующих тестов */
	// expectType<
	// 	Container<
	// 		C2Object,
	// 		{ p1: string } & { p2: number },
	// 		{
	// 			p1: Container<string, {}, {}>;
	// 			p2: Container<number, {}, {}>;
	// 		}
	// 	>
	// >(
	// 	Class(C2Object, {
	// 		p1: constant('123'),
	// 		p2: constant(312),
	// 		p3: constant(123),
	// 	})
	// );

	// expectError(
	// 	Class(C2Object, {
	// 		p1: constant('321'),
	// 		p2: constant(321),
	// 		p3: constant(321),
	// 	})
	// );
}
