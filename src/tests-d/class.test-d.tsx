import { expectType, expectAssignable, expectError } from 'tsd';
import { Class, Container, constant, ResolveWithRequiredDeps } from '..';

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
