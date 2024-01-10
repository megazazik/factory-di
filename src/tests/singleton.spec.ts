import tape from 'tape';
import { Class, constant, factory } from '..';

class C0 {
	constructor() {}
}

class Logger {
	constructor() {}
}
class Child {
	constructor(public logger: Logger) {}
}

class Parent {
	constructor(public logger: Logger, public child: Child) {}
}

class GrandParent {
	constructor(public parent: Parent) {}
}

tape('singleton. Simple', (t) => {
	const container = Class(Parent, 'logger', 'child')
		.register('logger', Class(Logger))
		.register('child', Class(Child, 'logger'))
		.singlton('logger');

	const parent = container.resolve();

	t.ok(parent.logger instanceof Logger);
	t.equal(parent.logger, parent.child.logger);

	t.end();
});

tape('singleton. Set singlton to child', (t) => {
	const container = Class(Parent, 'logger', 'child')
		.register('logger', Class(Logger))
		.register('child', Class(Child, 'logger').singlton('logger'));
	const parent = container.resolve();

	t.ok(parent.logger instanceof Logger);
	t.ok(parent.child.logger instanceof Logger);
	t.notEqual(parent.logger, parent.child.logger);

	t.end();
});

tape('singleton. Set singlton to parent', (t) => {
	const container = Class(GrandParent, 'parent')
		.register(
			'parent',
			Class(Parent, 'logger', 'child')
				.register('logger', Class(Logger))
				.register('child', Class(Child, 'logger'))
		)
		.singlton('logger');

	const grandParent = container.resolve();

	t.ok(grandParent.parent.logger instanceof Logger);
	t.equal(grandParent.parent.logger, grandParent.parent.child.logger);

	t.end();
});

tape('singleton. Set singlton to parent of factory', (t) => {
	const container = Class(Parent, 'logger', 'child')
		.register('logger', Class(Logger))
		.register('child', Class(Child, 'logger'));

	const factoryMethod = factory(container).singlton('logger').resolve();

	const parent = factoryMethod();

	t.ok(parent.logger instanceof Logger);
	t.equal(parent.logger, parent.child.logger);

	t.end();
});

// tape('singleton. Without params', (t) => {
// 	class C02 {
// 		constructor() {}
// 	}

// 	class C0Container {
// 		constructor(public c01: C0, public c02: C02) {}
// 	}

// 	const container = Class(C0Container, 'c01', 'c02')
// 		.register('c01', Class(C0))
// 		.register('c02', Class(C02));

// 	const factoryMethod = factory(container).singlton('c01', 'c02').resolve();
// 	const instance1 = factoryMethod();
// 	const instance2 = factoryMethod();

// 	t.ok(instance1.c01 instanceof C0);
// 	t.equal(instance1.c01, instance2.c01);

// 	t.ok(instance1.c02 instanceof C02);
// 	t.equal(instance1.c02, instance2.c02);

// 	t.end();
// });

// tape(
// 	'singleton. One singleton returns same value via different dependencies',
// 	(t) => {
// 		class C0Container {
// 			constructor(public c01: C0, public c01Copy: C0) {}
// 		}

// 		const singletonContainer = singleton(Class(C0));
// 		const container = Class(C0Container, 'c01', 'c01Copy')
// 			.register('c01', singletonContainer)
// 			.register('c01Copy', singletonContainer);

// 		const instance = container.resolve();
// 		const c01Instance = container.resolve('c01');
// 		const c01CopyInstance = container.resolve('c01Copy');

// 		t.equal(c01Instance, instance.c01);
// 		t.equal(c01Instance, instance.c01Copy);
// 		t.equal(c01Instance, c01CopyInstance);

// 		t.end();
// 	}
// );

// tape('singleton. Different singletons return different values', (t) => {
// 	class C0Container {
// 		constructor(public c01: C0, public c01Copy: C0) {}
// 	}

// 	const container = Class(C0Container, 'c01', 'c01Copy')
// 		.register('c01', singleton(Class(C0)))
// 		.register('c01Copy', singleton(Class(C0)));

// 	const instance = container.resolve();
// 	const c01Instance = container.resolve('c01');
// 	const c01CopyInstance = container.resolve('c01Copy');

// 	t.equal(c01Instance, instance.c01);
// 	t.equal(c01CopyInstance, instance.c01Copy);
// 	t.notEqual(c01Instance, c01CopyInstance);

// 	t.end();
// });

// class C1 {
// 	constructor(public params: { c0: C0; strParam: string }) {}
// }

// tape('singleton. With params', (t) => {
// 	class TestContainer {
// 		constructor(public c1: C1, public c1Copy: C1) {}
// 	}

// 	const singletonContainer = singleton(
// 		Class(C1, { c0: 'c0', strParam: 'strParam' })
// 	);

// 	const container = Class(TestContainer, 'c1', 'c1Copy')
// 		.register('c1', singletonContainer)
// 		.register('c1Copy', singletonContainer)
// 		.register('c0', Class(C0))
// 		.register('strParam', constant('strValue'));

// 	const instance1 = container.resolve();
// 	const instance2 = container.resolve();
// 	const c1Instance = container.resolve('c1');
// 	const c1CopyInstance = container.resolve('c1Copy');

// 	t.ok(c1Instance instanceof C1);
// 	t.equal(c1Instance, instance1.c1);
// 	t.equal(c1Instance, instance1.c1Copy);
// 	t.equal(c1Instance, instance2.c1);
// 	t.equal(c1Instance, instance2.c1Copy);
// 	t.equal(c1Instance, c1CopyInstance);

// 	t.ok(c1Instance.params.c0 instanceof C0);
// 	t.equal(c1Instance.params.strParam, 'strValue');

// 	t.end();
// });

// tape(
// 	'singleton. Different values inside different branches. Without params',
// 	(t) => {
// 		class C0Container1 {
// 			constructor(public c0: C0) {}
// 		}

// 		class C0Container2 {
// 			constructor(public c0: C0) {}
// 		}

// 		class TestContainer {
// 			constructor(public p1: C0Container1, public p2: C0Container2) {}
// 		}

// 		const container = Class(TestContainer, 'p1', 'p2')
// 			.register(
// 				'p1',
// 				Class(C0Container1, 'c0').register('c0', singleton(Class(C0)))
// 			)
// 			.register(
// 				'p2',
// 				Class(C0Container2, 'c0').register('c0', singleton(Class(C0)))
// 			);
// 		const instance = container.resolve();
// 		const p1 = container.resolve('p1');
// 		const p2 = container.resolve('p2');

// 		t.ok(instance.p1.c0 instanceof C0);
// 		t.ok(instance.p2.c0 instanceof C0);

// 		t.notEqual(instance.p1, p1);
// 		t.equal(instance.p1.c0, p1.c0);

// 		t.notEqual(instance.p2, p2);
// 		t.equal(instance.p2.c0, p2.c0);

// 		t.notEqual(p1.c0, p2.c0);

// 		t.end();
// 	}
// );

// tape(
// 	'singleton. Different values inside different branches. Different params',
// 	(t) => {
// 		class WithParams {
// 			constructor(public strValue: string) {}
// 		}

// 		class C0Container1 {
// 			constructor(public p0: WithParams) {}
// 		}

// 		class C0Container2 {
// 			constructor(public p0: WithParams) {}
// 		}

// 		class TestContainer {
// 			constructor(public p1: C0Container1, public p2: C0Container2) {}
// 		}

// 		const container = Class(TestContainer, 'p1', 'p2')
// 			.register(
// 				'p1',
// 				Class(C0Container1, 'p0')
// 					.register('p0', singleton(Class(WithParams, 'strValue')))
// 					.register('strValue', constant('p1StrValue'))
// 			)
// 			.register(
// 				'p2',
// 				Class(C0Container2, 'p0')
// 					.register('p0', singleton(Class(WithParams, 'strValue')))
// 					.register('strValue', constant('p2StrValue'))
// 			);

// 		const instance = container.resolve();
// 		const p1 = container.resolve('p1');
// 		const p2 = container.resolve('p2');

// 		t.ok(instance.p1.p0 instanceof WithParams);
// 		t.ok(instance.p2.p0 instanceof WithParams);

// 		t.notEqual(instance.p1, p1);
// 		t.equal(instance.p1.p0, p1.p0);

// 		t.notEqual(instance.p2, p2);
// 		t.equal(instance.p2.p0, p2.p0);

// 		t.notEqual(p1.p0, p2.p0);

// 		t.equal(instance.p1.p0.strValue, 'p1StrValue');
// 		t.equal(instance.p2.p0.strValue, 'p2StrValue');

// 		t.end();
// 	}
// );

// tape('singleton. Same value inside different branches. One singleton', (t) => {
// 	class WithParams {
// 		constructor(public strValue: string) {}
// 	}

// 	class C0Container1 {
// 		constructor(public p0: WithParams) {}
// 	}

// 	class C0Container2 {
// 		constructor(public p0: WithParams) {}
// 	}

// 	class TestContainer {
// 		constructor(public p1: C0Container1, public p2: C0Container2) {}
// 	}

// 	const singletonContainer = singleton(Class(WithParams, 'strValue'));
// 	const container = Class(TestContainer, 'p1', 'p2')
// 		.register(
// 			'p1',
// 			Class(C0Container1, 'p0')
// 				.register('p0', singletonContainer)
// 				.register('strValue', constant('p1StrValue'))
// 		)
// 		.register(
// 			'p2',
// 			Class(C0Container2, 'p0')
// 				.register('p0', singletonContainer)
// 				.register('strValue', constant('p2StrValue'))
// 		);

// 	const instance = container.resolve();
// 	const p1 = container.resolve('p1');
// 	const p2 = container.resolve('p2');

// 	t.ok(instance.p1.p0 instanceof WithParams);
// 	t.ok(instance.p2.p0 instanceof WithParams);

// 	t.notEqual(instance.p1, p1);
// 	t.equal(instance.p1.p0, p1.p0);

// 	t.notEqual(instance.p2, p2);
// 	t.equal(instance.p2.p0, p2.p0);

// 	t.equal(p1.p0, p2.p0);

// 	t.ok(
// 		instance.p1.p0.strValue === 'p1StrValue' ||
// 			instance.p2.p0.strValue === 'p2StrValue'
// 	);

// 	t.end();
// });

// tape(
// 	'singleton. Different values inside different containers. One singleton',
// 	(t) => {
// 		class WithParams {
// 			constructor(public strValue: string) {}
// 		}

// 		class C0Container1 {
// 			constructor(public p0: WithParams) {}
// 		}

// 		class C0Container2 {
// 			constructor(public p0: WithParams) {}
// 		}

// 		class TestContainer {
// 			constructor(public p1: C0Container1, public p2: C0Container2) {}
// 		}

// 		const singletonContainer = singleton(Class(WithParams, 'strValue'));

// 		const c0Container1 = Class(C0Container1, 'p0')
// 			.register('p0', singletonContainer)
// 			.register('strValue', constant('p1StrValue'));

// 		const c0Container2 = Class(C0Container2, 'p0')
// 			.register('p0', singletonContainer)
// 			.register('strValue', constant('p2StrValue'));

// 		const container = Class(TestContainer, 'p1', 'p2')
// 			.register('p1', c0Container1)
// 			.register('p2', c0Container2);

// 		const instance = container.resolve();
// 		const p1 = c0Container1.resolve();
// 		const p2 = c0Container2.resolve();

// 		t.ok(instance.p1.p0 instanceof WithParams);
// 		t.ok(instance.p2.p0 instanceof WithParams);
// 		t.ok(p1.p0 instanceof WithParams);
// 		t.ok(p2.p0 instanceof WithParams);

// 		t.equal(instance.p1.p0, instance.p2.p0);

// 		t.notEqual(instance.p1.p0, p1.p0);
// 		t.notEqual(instance.p2.p0, p2.p0);
// 		t.notEqual(p1.p0, p2.p0);

// 		t.equal(p1.p0.strValue, 'p1StrValue');
// 		t.equal(p2.p0.strValue, 'p2StrValue');

// 		t.ok(
// 			instance.p1.p0.strValue === 'p1StrValue' ||
// 				instance.p2.p0.strValue === 'p2StrValue'
// 		);

// 		t.end();
// 	}
// );

// tape('singleton. Clear instances', (t) => {
// 	class C02 {
// 		constructor() {}
// 	}

// 	class C0Container {
// 		constructor(public c01: C0, public c02: C02) {}
// 	}

// 	const container = Class(C0Container, 'c01', 'c02')
// 		.register('c01', singleton(Class(C0)))
// 		.register('c02', singleton(Class(C02)));

// 	const instance1 = container.resolve();
// 	const instance2 = container.resolve();

// 	// проверка объектов первого контейнера
// 	t.ok(instance1.c01 instanceof C0);
// 	t.equal(instance2.c01, instance1.c01);

// 	t.ok(instance1.c02 instanceof C02);
// 	t.equal(instance2.c02, instance1.c02);

// 	const container2 = Class(C0Container, 'c01', 'c02')
// 		.register('c01', singleton(Class(C0)))
// 		.register('c02', singleton(Class(C02)));

// 	const instance1_2 = container2.resolve();
// 	const instance2_2 = container2.resolve();

// 	// проверка объектов второго контейнера
// 	t.ok(instance1_2.c01 instanceof C0);
// 	t.equal(instance2_2.c01, instance1_2.c01);

// 	t.ok(instance1_2.c02 instanceof C02);
// 	t.equal(instance2_2.c02, instance1_2.c02);

// 	t.notEqual(instance2.c01, instance1_2.c01);

// 	container.resolve(SingletonManagerKey).clear();

// 	const instance1_new = container.resolve();
// 	const instance2_new = container.resolve();

// 	// проверка объектов первого сброшенного контейнера
// 	t.ok(instance1_new.c01 instanceof C0);
// 	t.equal(instance2_new.c01, instance1_new.c01);

// 	t.ok(instance1_new.c02 instanceof C02);
// 	t.equal(instance2_new.c02, instance1_new.c02);

// 	t.notEqual(
// 		instance1.c02,
// 		instance1_new.c02,
// 		'Old instances should be destroyed'
// 	);
// 	t.notEqual(
// 		instance1_2.c02,
// 		instance1_new.c02,
// 		'New objects should not be equal objects of independent container'
// 	);
// 	t.equal(instance1_2.c02, container2.resolve().c02),
// 		'Clear call should not affect independent caontainer';

// 	t.end();
// });
