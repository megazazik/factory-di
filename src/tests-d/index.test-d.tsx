import { expectType, expectError } from 'tsd';
import { ofClass, Container } from '..';

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
		ofClass(C1, 'dep1').registerValue('dep1', 'asdfdf').resolve()
	);
}

export function ofClassOneDepNoRegistered() {
	expectType<never>(ofClass(C1, 'dep1').resolve);
}

export function ofClassOneDepErrors() {
	expectError(ofClass(C1));
	expectError(ofClass(C1, 'dep1', 'dep2'));
	expectError(ofClass(C1, 'dep1').registerValue('dep1', 123));
	expectError(ofClass(C1, 'dep1').registerValue('unknwn', 123));
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
			.registerValue('dep1', 'asdfdf')
			.registerValue('dep2', 123)
			.resolve()
	);
}

export function ofClassTwoDepNoRegistered() {
	expectType<never>(ofClass(C2, 'dep1', 'dep2').resolve);
	expectType<never>(
		ofClass(C2, 'dep1', 'dep2').registerValue('dep2', 123).resolve
	);
}

export function ofClassTwoDepErrors() {
	expectError(ofClass(C2));
	expectError(ofClass(C2, 'dep1'));
	expectError(ofClass(C2, 'dep1', 'dep2', 'dep3'));
}
