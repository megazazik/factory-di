import { expectType, expectError, expectNotAssignable } from 'tsd';
import { Class, constant, NotRegisteredDependenciesError } from '..';

class C1 {
	constructor(public p1: string) {}
}

export function ofClassOneDepErrors() {
	expectError(Class(C1));
	expectError(Class(C1, 'dep1', 'dep2'));
	expectError(Class(C1, 'dep1').register('dep1', constant(123)));
	expectError(Class(C1, 'dep1').register('unknwn', constant(123)));
}

class C2 {
	constructor(public p1: string, public p2: number) {}
}

export function ofClassTwoDepErrors() {
	expectError(Class(C2));
	expectError(Class(C2, 'dep1'));
	expectError(Class(C2, 'dep1', 'dep2', 'dep3'));
}

class C3 {
	constructor(public c2: C2, public p2: number) {}
}

export function ofClassChildrenDeps() {
	const c2Container = Class(C2, 'c2Dep1', 'c2Dep2');
	const c3Container = Class(C3, 'depC2', 'depP1');

	expectType<NotRegisteredDependenciesError<{ c2Dep2: number }>>(
		c3Container
			.register(
				'depC2',
				c2Container.register('c2Dep1', constant('sdfsdf'))
			)
			.register('depP1', constant(123)).resolve
	);

	expectType<NotRegisteredDependenciesError<{ depP1: number }>>(
		c3Container.register(
			'depC2',
			c2Container
				.register('c2Dep1', constant('sdfsdf'))
				.register('c2Dep2', constant(123))
		).resolve
	);

	expectType<NotRegisteredDependenciesError<{ depP1: number }>>(
		c3Container
			.register(
				'depC2',
				c2Container.register('c2Dep1', constant('sdfsdf'))
			)
			.register('c2Dep2', constant(123)).resolve
	);

	expectType<NotRegisteredDependenciesError<{ depP1: number }>>(
		c3Container
			.register(
				'depC2',
				c2Container.register('c2Dep1', constant('sdfsdf'))
			)
			.register('c2Dep2', constant(123)).resolve
	);

	expectNotAssignable<NotRegisteredDependenciesError<any>>(
		c3Container
			.register(
				'depC2',
				c2Container.register('c2Dep1', constant('sdfsdf'))
			)
			.register('c2Dep2', constant(123))
			.register('depP1', constant(123)).resolve
	);

	expectNotAssignable<NotRegisteredDependenciesError<any>>(
		c3Container
			.register(
				'depC2',
				c2Container
					.register('c2Dep1', constant('sdfsdf'))
					.register('c2Dep2', constant(123))
			)
			.register('depP1', constant(123)).resolve
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
	const c3Container = Class(C3, 'depC2', 'depP1').register(
		'depC2',
		c2Container
	);
	const c4Container = Class(C4, 'depC3').register('depC3', c3Container);

	expectType<
		NotRegisteredDependenciesError<{ depP1: number; c2Dep2: number }>
	>(c4Container.resolve);

	expectType<NotRegisteredDependenciesError<{ depP1: number }>>(
		c4Container.register('c2Dep2', constant(908)).resolve
	);

	expectNotAssignable<NotRegisteredDependenciesError<any>>(
		c4Container
			.register('depP1', constant(123))
			.register('c2Dep2', constant(908)).resolve
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

	expectNotAssignable<NotRegisteredDependenciesError<any>>(
		c5Container
			.register('depC3', c3Container)
			.register('depC6', c6Container.register('depC2', Class(C2Child)))
			.register('c3Number', constant(34)).resolve
	);

	expectNotAssignable<NotRegisteredDependenciesError<any>>(
		c5Container
			.register('depC3', c3Container)
			.register('depC6', c6Container)
			.register('c3Number', constant(34))
			.register('depC2', Class(C2Child)).resolve
	);

	expectNotAssignable<NotRegisteredDependenciesError<any>>(
		c5Container
			.register(
				'depC3',
				c3Container.register('depC2', Class(C2, 'c2String', 'c2Number'))
			)
			.register('depC6', c6Container)
			.register('c3Number', constant(34))
			.register('depC2', Class(C2Child))
			.register('c2Number', constant(123))
			.register('c2String', constant('sdf')).resolve
	);

	expectType<
		NotRegisteredDependenciesError<{ c2String: String; c2Number: number }>
	>(
		c5Container
			.register(
				'depC3',
				c3Container.register('depC2', Class(C2, 'c2String', 'c2Number'))
			)
			.register('depC6', c6Container.register('depC2', Class(C2Child)))
			.register('c3Number', constant(34)).resolve
	);

	expectType<NotRegisteredDependenciesError<{ c3Number: number }>>(
		c5Container
			.register(
				'depC3',
				c3Container.register('depC2', Class(C2, 'c2String', 'c2Number'))
			)
			.register('depC6', c6Container)
			.register('depC2', Class(C2Child)).resolve
	);

	expectNotAssignable<NotRegisteredDependenciesError<any>>(
		c5Container
			.register(
				'depC3',
				c3Container.register('depC2', Class(C2, 'c2String', 'c2Number'))
			)
			.register('depC6', c6Container)
			.register('depC2', Class(C2Child))
			.register('c3Number', constant(34)).resolve
	);
}

export function ofClassResolveAcceptableParams() {
	const c5Container = Class(C5, 'depC3', 'depC6');
	const c6Container = Class(C6, 'depC2');
	const c3Container = Class(C3, 'depC2', 'c3Number');

	class C2Child extends C2 {
		constructor() {
			super('', 0);
		}
	}

	expectType<C2>(
		c6Container.register('depC2', Class(C2Child)).resolve('depC2')
	);

	expectType<C2>(
		c3Container
			.register('depC2', Class(C2Child))
			.register('c3Number', constant(123))
			.resolve('depC2')
	);

	expectType<number>(
		c3Container
			.register('depC2', Class(C2Child))
			.register('c3Number', constant(123))
			.resolve('c3Number')
	);

	expectType<number>(
		c5Container
			.register(
				'depC3',
				c3Container.register(
					'depC2',
					Class(C2, 'c2String', 'c2Number').register(
						'c2Number',
						constant(123)
					)
				)
			)
			.register('depC6', c6Container)
			.register('c3Number', constant(34))
			.register('c2String', constant('sdf'))
			.resolve('c2Number')
	);

	expectType<string>(
		c5Container
			.register(
				'depC3',
				c3Container.register(
					'depC2',
					Class(C2, 'c2String', 'c2Number').register(
						'c2Number',
						constant(123)
					)
				)
			)
			.register('depC6', c6Container)
			.register('c3Number', constant(34))
			.register('c2String', constant('sdf'))
			.resolve('c2String')
	);

	expectError(
		c5Container
			.register(
				'depC3',
				c3Container.register('depC2', Class(C2, 'c2String', 'c2Number'))
			)
			.register('depC6', c6Container)
			.register('depC2', Class(C2Child))
			.register('c3Number', constant(34))
			.resolve('c2String')
	);

	expectError(
		c5Container
			.register(
				'depC3',
				c3Container.register('depC2', Class(C2, 'c2String', 'c2Number'))
			)
			.register('depC6', c6Container)
			.register('depC2', Class(C2Child))
			.register('c3Number', constant(34))
			.resolve('c2Number')
	);

	expectError(
		c5Container
			.register(
				'depC3',
				c3Container.register('depC2', Class(C2, 'c2String', 'c2Number'))
			)
			.register('depC6', c6Container)
			.register('depC2', Class(C2Child))
			.register('c3Number', constant(34))
			.resolve('unknown')
	);
}
