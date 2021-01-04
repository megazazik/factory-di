import tape from 'tape';
import { Class, constant } from '..';

tape('ofClass. With params. Object', (t) => {
	class MyClass {
		constructor(public params: { pDep1: number }) {}
	}

	const container = Class(MyClass, { pDep1: 'dep1' }).register(
		'dep1',
		constant(864)
	);

	t.ok(container.resolve() instanceof MyClass);
	t.deepEqual(container.resolve().params, { pDep1: 864 });

	class MyClass2 {
		constructor(public params: { pDep1: number; pDep2: string }) {}
	}

	const container2 = Class(MyClass2, {
		pDep1: 'dep1',
		pDep2: 'dep2',
	})
		.register('dep1', constant(864))
		.register('dep2', constant('str2'));

	t.ok(container2.resolve() instanceof MyClass2);
	t.deepEqual(container2.resolve().params, { pDep1: 864, pDep2: 'str2' });

	t.end();
});

tape('ofClass. Nested. Object', (t) => {
	class Child1 {
		constructor(public params: { pnStr: string }) {}
	}

	class Child2 {
		constructor(public params: { pn2: boolean }) {}
	}

	class Parent {
		constructor(
			public params: {
				pdep1: number;
				pnested1: Child1;
				pnested2: Child2;
			}
		) {}
	}

	const container = Class(Parent, {
		pdep1: 'dep1',
		pnested1: 'nested1',
		pnested2: 'nested2',
	})
		.register('dep1', constant(154))
		.register(
			'nested1',
			Class(Child1, { pnStr: 'nStr' }).register(
				'nStr',
				constant('nStrValue')
			)
		)
		.register('nested2', Class(Child2, { pn2: 'n2' }))
		.register('n2', constant(true));

	const parent = container.resolve();

	t.ok(parent instanceof Parent);

	t.equal(parent.params.pdep1, 154);

	t.ok(parent.params.pnested1 instanceof Child1);
	t.deepEqual(parent.params.pnested1.params, { pnStr: 'nStrValue' });

	t.ok(parent.params.pnested2 instanceof Child2);
	t.deepEqual(parent.params.pnested2.params, { pn2: true });

	t.ok(container.resolve('nested1') instanceof Child1);
	t.deepEqual(container.resolve('nested1').params, { pnStr: 'nStrValue' });

	t.ok(container.resolve('nested2') instanceof Child2);
	t.deepEqual(container.resolve('nested2').params, { pn2: true });

	t.equal(container.resolve('nStr'), 'nStrValue');
	t.equal(container.resolve('dep1'), 154);
	t.equal(container.resolve('n2'), true);

	t.end();
});
