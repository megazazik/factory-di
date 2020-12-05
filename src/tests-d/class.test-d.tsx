import {
	expectType,
	expectError,
	expectNotType,
	expectNotAssignable,
} from 'tsd';
import {
	ofClass,
	Container,
	ofValue,
	NotRegisteredDependenciesError,
} from '..';

class C0 {}

export function ofClassWithoutDeps() {
	expectType<Container<C0, {}, {}>>(ofClass(C0));
	expectType<C0>(ofClass(C0).resolve());
}

class C1 {
	constructor(public p1: string) {}
}

export function ofClassOneDep() {
	expectType<Container<C1, { dep1: string }, {}>>(ofClass(C1, 'dep1'));
	expectType<C1>(
		ofClass(C1, 'dep1').register('dep1', ofValue('asdfdf')).resolve()
	);
}

export function ofClassOneDepNoRegistered() {
	expectType<NotRegisteredDependenciesError<'dep1'>>(
		ofClass(C1, 'dep1').resolve
	);
}

export function ofClassOneDepErrors() {
	expectError(ofClass(C1));
	expectError(ofClass(C1, 'dep1', 'dep2'));
	expectError(ofClass(C1, 'dep1').register('dep1', ofValue(123)));
	expectError(ofClass(C1, 'dep1').register('unknwn', ofValue(123)));
}

class C2 {
	constructor(public p1: string, public p2: number) {}
}

export function ofClassTwoDep() {
	expectType<Container<C2, { dep1: string } & { dep2: number }, {}>>(
		ofClass(C2, 'dep1', 'dep2')
	);

	expectType<C2>(
		ofClass(C2, 'dep1', 'dep2')
			.register('dep1', ofValue('asdfdf'))
			.register('dep2', ofValue(123))
			.resolve()
	);
}

export function ofClassTwoDepNoRegistered() {
	expectType<NotRegisteredDependenciesError<'dep1' | 'dep2'>>(
		ofClass(C2, 'dep1', 'dep2').resolve
	);
	expectType<NotRegisteredDependenciesError<'dep1'>>(
		ofClass(C2, 'dep1', 'dep2').register('dep2', ofValue(123)).resolve
	);
}

export function ofClassTwoDepErrors() {
	expectError(ofClass(C2));
	expectError(ofClass(C2, 'dep1'));
	expectError(ofClass(C2, 'dep1', 'dep2', 'dep3'));
}

class C3 {
	constructor(public c2: C2, public p2: number) {}
}

export function ofClassChildrenDeps() {
	const c2Container = ofClass(C2, 'c2Dep1', 'c2Dep2');
	const c3Container = ofClass(C3, 'depC2', 'depP1');

	expectType<NotRegisteredDependenciesError<'c2Dep2'>>(
		c3Container
			.register(
				'depC2',
				c2Container.register('c2Dep1', ofValue('sdfsdf'))
			)
			.register('depP1', ofValue(123)).resolve
	);

	expectType<NotRegisteredDependenciesError<'depP1'>>(
		c3Container.register(
			'depC2',
			c2Container
				.register('c2Dep1', ofValue('sdfsdf'))
				.register('c2Dep2', ofValue(123))
		).resolve
	);

	expectType<NotRegisteredDependenciesError<'depP1'>>(
		c3Container
			.register(
				'depC2',
				c2Container.register('c2Dep1', ofValue('sdfsdf'))
			)
			.register('c2Dep2', ofValue(123)).resolve
	);

	expectType<NotRegisteredDependenciesError<'depP1'>>(
		c3Container
			.register(
				'depC2',
				c2Container.register('c2Dep1', ofValue('sdfsdf'))
			)
			.register('c2Dep2', ofValue(123)).resolve
	);

	expectNotAssignable<NotRegisteredDependenciesError<any>>(
		c3Container
			.register(
				'depC2',
				c2Container.register('c2Dep1', ofValue('sdfsdf'))
			)
			.register('c2Dep2', ofValue(123))
			.register('depP1', ofValue(123)).resolve
	);

	expectNotAssignable<NotRegisteredDependenciesError<any>>(
		c3Container
			.register(
				'depC2',
				c2Container
					.register('c2Dep1', ofValue('sdfsdf'))
					.register('c2Dep2', ofValue(123))
			)
			.register('depP1', ofValue(123)).resolve
	);
}

class C4 {
	constructor(public c3: C3) {}
}

export function ofClassGrandChildrenDeps() {
	const c2Container = ofClass(C2, 'c2Dep1', 'c2Dep2').register(
		'c2Dep1',
		ofValue('423')
	);
	const c3Container = ofClass(C3, 'depC2', 'depP1').register(
		'depC2',
		c2Container
	);
	const c4Container = ofClass(C4, 'depC3').register('depC3', c3Container);

	expectType<NotRegisteredDependenciesError<'depP1' | 'c2Dep2'>>(
		c4Container.resolve
	);

	expectType<NotRegisteredDependenciesError<'depP1'>>(
		c4Container.register('c2Dep2', ofValue(908)).resolve
	);

	expectNotAssignable<NotRegisteredDependenciesError<any>>(
		c4Container
			.register('depP1', ofValue(123))
			.register('c2Dep2', ofValue(908)).resolve
	);
}
