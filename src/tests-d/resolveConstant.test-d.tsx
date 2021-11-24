import { expectType, expectError } from 'tsd';
import { Class, constant } from '..';

class C1 {
	constructor(public p1: string) {}
}

class C2 {
	constructor(public c1: C1, public p2: number) {}
}

const containerC2 = Class(C2, 'c2Dep1', 'c2Dep2');

export function constantsRegisterErrors() {
	expectError(containerC2.register('c2Dep2', constant('sdsd')));
	expectError(containerC2.register({ c2Dep2: constant('sdsd') }));
	expectError(containerC2.register('c2Dep2', 'sdsd'));
	expectError(containerC2.register({ c2Dep2: 'sdsd' }));
}

export function constantsRegister() {
	expectType<C2>(
		containerC2
			.register('c2Dep2', constant(1))
			.register('c2Dep1', constant(new C1('sdf')))
			.resolve()
	);

	expectType<C2>(
		containerC2
			.register({ c2Dep2: constant(12) })
			.register({ c2Dep1: constant(new C1('sdf')) })
			.resolve()
	);

	expectType<C2>(
		containerC2
			.register('c2Dep2', 1)
			.register('c2Dep1', new C1('sdf'))
			.resolve()
	);

	expectType<C2>(
		containerC2
			.register({ c2Dep2: 12 })
			.register({ c2Dep1: new C1('sdf') })
			.resolve()
	);
}
