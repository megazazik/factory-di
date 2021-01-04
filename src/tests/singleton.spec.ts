import tape from 'tape';
import { Class, constant, singleton, SingletonManagerKey } from '..';

class C0 {
	constructor() {}
}

tape('singleton. Without params', (t) => {
	class C02 {
		constructor() {}
	}

	class C0Container {
		constructor(public c01: C0, public c02: C02) {}
	}

	const container = Class(C0Container, 'c01', 'c02')
		.register('c01', singleton(Class(C0)))
		.register('c02', singleton(Class(C02)));

	const instance1 = container.resolve();
	const instance2 = container.resolve();
	const c01Instance = container.resolve('c01');

	t.ok(c01Instance instanceof C0);
	t.equal(c01Instance, instance1.c01);
	t.equal(c01Instance, instance2.c01);

	const c02Instance = container.resolve('c02');

	t.ok(c02Instance instanceof C02);
	t.equal(c02Instance, instance1.c02);
	t.equal(c02Instance, instance2.c02);

	t.end();
});

tape(
	'singleton. One singleton returns same value via different dependencies',
	(t) => {
		class C0Container {
			constructor(public c01: C0, public c01Copy: C0) {}
		}

		const singletonContainer = singleton(Class(C0));
		const container = Class(C0Container, 'c01', 'c01Copy')
			.register('c01', singletonContainer)
			.register('c01Copy', singletonContainer);

		const instance = container.resolve();
		const c01Instance = container.resolve('c01');
		const c01CopyInstance = container.resolve('c01Copy');

		t.equal(c01Instance, instance.c01);
		t.equal(c01Instance, instance.c01Copy);
		t.equal(c01Instance, c01CopyInstance);

		t.end();
	}
);

tape('singleton. Different singletons return different values', (t) => {
	class C0Container {
		constructor(public c01: C0, public c01Copy: C0) {}
	}

	const container = Class(C0Container, 'c01', 'c01Copy')
		.register('c01', singleton(Class(C0)))
		.register('c01Copy', singleton(Class(C0)));

	const instance = container.resolve();
	const c01Instance = container.resolve('c01');
	const c01CopyInstance = container.resolve('c01Copy');

	t.equal(c01Instance, instance.c01);
	t.equal(c01CopyInstance, instance.c01Copy);
	t.notEqual(c01Instance, c01CopyInstance);

	t.end();
});

class C1 {
	constructor(public params: { c0: C0; strParam: string }) {}
}

tape('singleton. With params', (t) => {
	class TestContainer {
		constructor(public c1: C1, public c1Copy: C1) {}
	}

	const singletonContainer = singleton(
		Class(C1, { c0: 'c0', strParam: 'strParam' })
	);

	const container = Class(TestContainer, 'c1', 'c1Copy')
		.register('c1', singletonContainer)
		.register('c1Copy', singletonContainer)
		.register('c0', Class(C0))
		.register('strParam', constant('strValue'));

	const instance1 = container.resolve();
	const instance2 = container.resolve();
	const c1Instance = container.resolve('c1');
	const c1CopyInstance = container.resolve('c1Copy');

	t.ok(c1Instance instanceof C1);
	t.equal(c1Instance, instance1.c1);
	t.equal(c1Instance, instance1.c1Copy);
	t.equal(c1Instance, instance2.c1);
	t.equal(c1Instance, instance2.c1Copy);
	t.equal(c1Instance, c1CopyInstance);

	t.ok(c1Instance.params.c0 instanceof C0);
	t.equal(c1Instance.params.strParam, 'strValue');

	t.end();
});

tape(
	'singleton. Different values inside different branches. Without params',
	(t) => {
		class C0Container1 {
			constructor(public c0: C0) {}
		}

		class C0Container2 {
			constructor(public c0: C0) {}
		}

		class TestContainer {
			constructor(public p1: C0Container1, public p2: C0Container2) {}
		}

		const container = Class(TestContainer, 'p1', 'p2')
			.register(
				'p1',
				Class(C0Container1, 'c0').register('c0', singleton(Class(C0)))
			)
			.register(
				'p2',
				Class(C0Container2, 'c0').register('c0', singleton(Class(C0)))
			);
		const instance = container.resolve();
		const p1 = container.resolve('p1');
		const p2 = container.resolve('p2');

		t.ok(instance.p1.c0 instanceof C0);
		t.ok(instance.p2.c0 instanceof C0);

		t.notEqual(instance.p1, p1);
		t.equal(instance.p1.c0, p1.c0);

		t.notEqual(instance.p2, p2);
		t.equal(instance.p2.c0, p2.c0);

		t.notEqual(p1.c0, p2.c0);

		t.end();
	}
);

tape(
	'singleton. Different values inside different branches. Different params',
	(t) => {
		class WithParams {
			constructor(public strValue: string) {}
		}

		class C0Container1 {
			constructor(public p0: WithParams) {}
		}

		class C0Container2 {
			constructor(public p0: WithParams) {}
		}

		class TestContainer {
			constructor(public p1: C0Container1, public p2: C0Container2) {}
		}

		const container = Class(TestContainer, 'p1', 'p2')
			.register(
				'p1',
				Class(C0Container1, 'p0')
					.register('p0', singleton(Class(WithParams, 'strValue')))
					.register('strValue', constant('p1StrValue'))
			)
			.register(
				'p2',
				Class(C0Container2, 'p0')
					.register('p0', singleton(Class(WithParams, 'strValue')))
					.register('strValue', constant('p2StrValue'))
			);

		const instance = container.resolve();
		const p1 = container.resolve('p1');
		const p2 = container.resolve('p2');

		t.ok(instance.p1.p0 instanceof WithParams);
		t.ok(instance.p2.p0 instanceof WithParams);

		t.notEqual(instance.p1, p1);
		t.equal(instance.p1.p0, p1.p0);

		t.notEqual(instance.p2, p2);
		t.equal(instance.p2.p0, p2.p0);

		t.notEqual(p1.p0, p2.p0);

		t.equal(instance.p1.p0.strValue, 'p1StrValue');
		t.equal(instance.p2.p0.strValue, 'p2StrValue');

		t.end();
	}
);

tape('singleton. Same value inside different branches. One singleton', (t) => {
	class WithParams {
		constructor(public strValue: string) {}
	}

	class C0Container1 {
		constructor(public p0: WithParams) {}
	}

	class C0Container2 {
		constructor(public p0: WithParams) {}
	}

	class TestContainer {
		constructor(public p1: C0Container1, public p2: C0Container2) {}
	}

	const singletonContainer = singleton(Class(WithParams, 'strValue'));
	const container = Class(TestContainer, 'p1', 'p2')
		.register(
			'p1',
			Class(C0Container1, 'p0')
				.register('p0', singletonContainer)
				.register('strValue', constant('p1StrValue'))
		)
		.register(
			'p2',
			Class(C0Container2, 'p0')
				.register('p0', singletonContainer)
				.register('strValue', constant('p2StrValue'))
		);

	const instance = container.resolve();
	const p1 = container.resolve('p1');
	const p2 = container.resolve('p2');

	t.ok(instance.p1.p0 instanceof WithParams);
	t.ok(instance.p2.p0 instanceof WithParams);

	t.notEqual(instance.p1, p1);
	t.equal(instance.p1.p0, p1.p0);

	t.notEqual(instance.p2, p2);
	t.equal(instance.p2.p0, p2.p0);

	t.equal(p1.p0, p2.p0);

	t.ok(
		instance.p1.p0.strValue === 'p1StrValue' ||
			instance.p2.p0.strValue === 'p2StrValue'
	);

	t.end();
});

tape(
	'singleton. Different values inside different containers. One singleton',
	(t) => {
		class WithParams {
			constructor(public strValue: string) {}
		}

		class C0Container1 {
			constructor(public p0: WithParams) {}
		}

		class C0Container2 {
			constructor(public p0: WithParams) {}
		}

		class TestContainer {
			constructor(public p1: C0Container1, public p2: C0Container2) {}
		}

		const singletonContainer = singleton(Class(WithParams, 'strValue'));

		const c0Container1 = Class(C0Container1, 'p0')
			.register('p0', singletonContainer)
			.register('strValue', constant('p1StrValue'));

		const c0Container2 = Class(C0Container2, 'p0')
			.register('p0', singletonContainer)
			.register('strValue', constant('p2StrValue'));

		const container = Class(TestContainer, 'p1', 'p2')
			.register('p1', c0Container1)
			.register('p2', c0Container2);

		const instance = container.resolve();
		const p1 = c0Container1.resolve();
		const p2 = c0Container2.resolve();

		t.ok(instance.p1.p0 instanceof WithParams);
		t.ok(instance.p2.p0 instanceof WithParams);
		t.ok(p1.p0 instanceof WithParams);
		t.ok(p2.p0 instanceof WithParams);

		t.equal(instance.p1.p0, instance.p2.p0);

		t.notEqual(instance.p1.p0, p1.p0);
		t.notEqual(instance.p2.p0, p2.p0);
		t.notEqual(p1.p0, p2.p0);

		t.equal(p1.p0.strValue, 'p1StrValue');
		t.equal(p2.p0.strValue, 'p2StrValue');

		t.ok(
			instance.p1.p0.strValue === 'p1StrValue' ||
				instance.p2.p0.strValue === 'p2StrValue'
		);

		t.end();
	}
);

// @todo clear instances
