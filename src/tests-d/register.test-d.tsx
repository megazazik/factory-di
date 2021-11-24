import { expectType, expectError } from 'tsd';
import { Class, constant, ResolveWithRequiredDeps } from '..';

class C2 {
	constructor(public p1: string, public p2: number) {}
}

class C3 {
	constructor(public c2: C2, public p2: number) {}
}

export function ofClassChildrenDeps() {
	const c2Container = Class(C2, 'c2Dep1', 'c2Dep2');
	const c3Container = Class(C3, 'depC2', 'depP1');

	expectType<
		ResolveWithRequiredDeps<
			{ depP1: number } & {
				depP1?: number;
				depC2?: C2;
				c2Dep1?: string;
				c2Dep2?: number;
			},
			C3
		>
	>(
		c3Container.register(
			'depC2',
			c2Container.register({
				c2Dep1: constant('sdfsdf'),
				c2Dep2: constant(123),
			})
		).resolve
	);

	expectType<
		ResolveWithRequiredDeps<
			{ depP1: number } & {
				depP1?: number;
				depC2?: C2;
				c2Dep1?: string;
				c2Dep2?: number;
			},
			C3
		>
	>(
		c3Container
			.register({
				depC2: c2Container.register({ c2Dep1: constant('sdfsdf') }),
			})
			.register({ c2Dep2: constant(123) }).resolve
	);

	expectType<C3>(
		c3Container
			.register({
				depC2: c2Container.register({ c2Dep1: constant('sdfsdf') }),
			})
			.register({
				c2Dep2: constant(123),
				depP1: constant(123),
			})
			.resolve()
	);

	expectType<C3>(
		c3Container
			.register({
				depC2: c2Container.register({
					c2Dep1: constant('sdfsdf'),
					c2Dep2: constant(123),
				}),
			})
			.register({ depP1: constant(123) })
			.resolve()
	);
}

class C4 {
	constructor(public c3: C3) {}
}

export function ofClassGrandChildrenDeps() {
	const c2Container = Class(C2, 'c2Dep1', 'c2Dep2').register(
		'c2Dep1',
		constant('423')
	);
	const c3Container = Class(C3, 'depC2', 'depP1').register({
		depC2: c2Container,
	});
	const c4Container = Class(C4, 'depC3').register({ depC3: c3Container });

	expectType<
		ResolveWithRequiredDeps<
			{ depP1: number; c2Dep2: number } & {
				depC3?: C3;
				depP1?: number;
				depC2?: C2;
				c2Dep1?: string;
				c2Dep2?: number;
			},
			C4
		>
	>(c4Container.resolve);

	expectType<
		ResolveWithRequiredDeps<
			{ depP1: number } & {
				depC3?: C3;
				depP1?: number;
				depC2?: C2;
				c2Dep1?: string;
				c2Dep2?: number;
			},
			C4
		>
	>(c4Container.register({ c2Dep2: constant(908) }).resolve);

	expectType<C4>(
		c4Container
			.register({
				depP1: constant(123),
				c2Dep2: constant(908),
			})
			.resolve()
	);
}

class C5 {
	constructor(public c3: C3, public c6: C6) {}
}

class C6 {
	constructor(public c2: C2) {}
}

export function ofClassOverrideDeps() {
	const c5Container = Class(C5, 'depC3', 'depC6');
	const c6Container = Class(C6, 'depC2');
	const c3Container = Class(C3, 'depC2', 'c3Number');

	class C2Child extends C2 {
		constructor() {
			super('', 0);
		}
	}

	expectType<C5>(
		c5Container
			.register({
				depC3: c3Container,
				depC6: c6Container.register('depC2', Class(C2Child)),
				c3Number: constant(34),
			})
			.resolve()
	);

	expectType<C5>(
		c5Container
			.register({
				depC3: c3Container,
				depC6: c6Container,
				c3Number: constant(34),
				depC2: Class(C2Child),
			})
			.resolve()
	);

	expectType<C5>(
		c5Container
			.register({
				depC3: c3Container.register({
					depC2: Class(C2, 'c2String', 'c2Number'),
				}),
			})
			.register({
				depC6: c6Container,
				c3Number: constant(34),
				depC2: Class(C2Child),
			})
			.resolve()
	);

	expectType<
		ResolveWithRequiredDeps<
			{ c2String: string; c2Number: number } & {
				c2String?: string;
				c2Number?: number;
				depC3?: C3;
				depC6?: C6;
				depC2?: C2;
				c3Number?: number;
			},
			C5
		>
	>(
		c5Container
			.register({
				depC3: c3Container.register(
					'depC2',
					Class(C2, 'c2String', 'c2Number')
				),
			})
			.register({
				depC6: c6Container.register('depC2', Class(C2Child)),
				c3Number: constant(34),
			}).resolve
	);

	expectType<
		ResolveWithRequiredDeps<
			{ c3Number: number } & {
				depC3?: C3;
				depC6?: C6;
				depC2?: C2;
				c3Number?: number;
			},
			C5
		>
	>(
		c5Container
			.register({
				depC3: c3Container.register({
					depC2: Class(C2, 'c2String', 'c2Number'),
					unknown: constant(123),
				}),
			})
			.register({
				depC6: c6Container,
				depC2: Class(C2Child),
			}).resolve
	);

	expectType<C5>(
		c5Container
			.register({
				depC3: c3Container.register({
					depC2: Class(C2, 'c2String', 'c2Number'),
				}),
			})
			.register({
				depC6: c6Container,
				depC2: Class(C2Child),
				c3Number: constant(34),
			})
			.resolve()
	);
}

export function ofClassErrors() {
	const c3Container = Class(C3, 'depC2', 'c3Number');

	/** @todo поправить, чтобы здесь была ошибка */
	// expectError(
	// 	c3Container.register({
	// 		c3Number: constant(123),
	// 		unknown: constant(321),
	// 	})
	// );

	expectError(c3Container.register({ unknown: constant(321) }));

	expectError(c3Container.register({ c3Number: constant('123') }));
}
