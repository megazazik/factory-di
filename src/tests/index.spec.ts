import tape from 'tape';
import { Class, constant } from '..';

class C0 {}

class C1 {
	constructor(public p1: number) {}
}

tape('ofClass. Without params', (t) => {
	const container = Class(C0);

	t.ok(container.resolve() instanceof C0);

	t.end();
});

tape('ofConstant', (t) => {
	const container = constant(543);

	t.equal(container.resolve(), 543);
	t.equal(container.resolve(), 543);

	const value = { f1: 'value' };
	const objContainer = constant(value);

	t.equal(objContainer.resolve(), value);
	t.equal(objContainer.resolve(), value);

	t.end();
});

tape('Resolve. With one param', (t) => {
	const container = Class(C1, 'p1Value').register('p1Value', constant(321));

	const instance = container.resolve();
	t.ok(instance instanceof C1);

	t.equal(instance.p1, 321);

	t.end();
});

class C2 {
	constructor(public с1: C1, public p2: string) {}
}

class C3 {
	constructor(public c2: C2, public c0: C0) {}
}

tape('Resolve. No registered dependency', (t) => {
	const container = Class(C2, 'c2', 'p2').register(
		'c2',
		Class(C1, 'p1Value').register('p1Value', constant(321))
	);

	const c2: C2 = (container as any).resolve();
	t.equal(c2.p2, undefined);

	t.end();
});

tape('Resolve. New instance on every resolve call', (t) => {
	const container = Class(C3, 'c2', 'c0')
		.register('c0', Class(C0))
		.register('c2', Class(C2, 'c1', 'p2'))
		.register('c1', Class(C1, 'p1'))
		.register('p1', constant(937))
		.register('p2', constant('p2Value'));

	const instance = container.resolve();
	const instance2 = container.resolve();
	t.notEqual(instance, instance2);
	t.notEqual(instance.c0, instance2.c0);
	t.notEqual(instance.c2, instance2.c2);
	t.notEqual(instance.c2.с1, instance2.c2.с1);

	t.end();
});

class C4 {
	constructor(public с3: C3) {}
}

tape('Resolve. Deep nested', (t) => {
	const container = Class(C4, 'c3')
		.register('c3', Class(C3, 'c2', 'c0'))
		.register('c0', Class(C0))
		.register('c2', Class(C2, 'c1', 'p2'))
		.register('c1', Class(C1, 'p1'))
		.register('p1', constant(937))
		.register('p2', constant('p2Value'));

	const instance = container.resolve();
	t.ok(instance instanceof C4);
	t.ok(instance.с3 instanceof C3);
	t.ok(instance.с3.c2 instanceof C2);
	t.ok(instance.с3.c0 instanceof C0);
	t.ok(instance.с3.c2.с1 instanceof C1);
	t.equal(instance.с3.c2.p2, 'p2Value');
	t.equal(instance.с3.c2.с1.p1, 937);

	t.end();
});

tape('Resolve. Dependencies registered at child containers', (t) => {
	const container = Class(C4, 'c3')
		.register('c3', Class(C3, 'c2', 'c0').register('c0', Class(C0)))
		.register(
			'c2',
			Class(C2, 'c1', 'p2').register('p2', constant('p2Value'))
		)
		.register('c1', Class(C1, 'p1'))
		.register('p1', constant(937));

	const instance = container.resolve();
	t.ok(instance instanceof C4);
	t.ok(instance.с3 instanceof C3);
	t.ok(instance.с3.c2 instanceof C2);
	t.ok(instance.с3.c0 instanceof C0);
	t.ok(instance.с3.c2.с1 instanceof C1);
	t.equal(instance.с3.c2.p2, 'p2Value');
	t.equal(instance.с3.c2.с1.p1, 937);

	t.end();
});

tape('Resolve. Dependencies registered at several children containers', (t) => {
	class CWithP1 {
		constructor(public p1: number) {}
	}

	class Parent {
		constructor(public c2: C2, public cWithP1: CWithP1) {}
	}

	const container = Class(Parent, 'c2', 'cWithP1')
		.register('cWithP1', Class(CWithP1, 'p1').register('p1', constant(659)))
		.register(
			'c2',
			Class(C2, 'c1', 'p2')
				.register('p2', constant('p2Value'))
				.register('c1', Class(C1, 'p1'))
				.register('p1', constant(321))
		);

	const instance = container.resolve();
	t.ok(instance instanceof Parent);
	t.equal(instance.c2.с1.p1, 321);
	t.equal(instance.cWithP1.p1, 659);

	t.end();
});

tape('Resolve. Override registered dependencies at parent', (t) => {
	class CWithP1 {
		constructor(public p1: number) {}
	}

	class Parent {
		constructor(public c2: C2, public cWithP1: CWithP1) {}
	}

	const container = Class(Parent, 'c2', 'cWithP1')
		.register('cWithP1', Class(CWithP1, 'p1').register('p1', constant(659)))
		.register(
			'c2',
			Class(C2, 'c1', 'p2')
				.register('p2', constant('p2Value'))
				.register('c1', Class(C1, 'p1'))
				.register('p1', constant(321))
		)
		.register('p1', constant(456));

	const instance = container.resolve();
	t.ok(instance instanceof Parent);
	t.equal(instance.c2.с1.p1, 456);
	t.equal(instance.cWithP1.p1, 456);

	t.end();
});

tape(
	'Resolve. Object. Dependencies registered at several children containers',
	(t) => {
		class CWithP1 {
			constructor(public p1: number) {}
		}

		class Parent {
			constructor(public c2: C2, public cWithP1: CWithP1) {}
		}

		const container = Class(Parent, 'c2', 'cWithP1')
			.register({
				cWithP1: Class(CWithP1, 'p1').register({ p1: constant(659) }),
			})
			.register({
				c2: Class(C2, 'c1', 'p2').register({
					p2: constant('p2Value'),
					c1: Class(C1, 'p1'),
					p1: constant(321),
				}),
			});

		const instance = container.resolve();
		t.ok(instance instanceof Parent);
		t.equal(instance.c2.с1.p1, 321);
		t.equal(instance.cWithP1.p1, 659);

		t.end();
	}
);
