import tape from 'tape';
import { Class, factory } from '..';

class Logger {
	constructor() {}
}

const loggerContainer = Class(Logger);

class Child {
	constructor(public logger: Logger) {}
}
const childContainer = Class(Child, 'logger');

class ParentWithTwoChildren {
	constructor(public child1: Child, public child2: Child) {}
}

const parent2ChildContainer = Class(ParentWithTwoChildren, 'child1', 'child2');

function loggersEquals(t: tape.Test, l1: Logger, l2: Logger, equal: boolean) {
	t.ok(l1 instanceof Logger);
	t.ok(l2 instanceof Logger);

	t.equal(l1 === l2, equal);

	t.end();
}

tape('singleton. Two resolve', (t) => {
	const c = childContainer
		.register('logger', loggerContainer)
		.singlton('logger');

	loggersEquals(t, c.resolve().logger, c.resolve().logger, false);
});

// 4 кейса, когда один и тот же дочерний контейнер регистрируется как 2 разных зависимости
// регистрация у потомка vs регистрация у родителя
// указания синглтоном у потомка vs указания синглтоном у родителя

tape(
	'singleton. Same child container used in 2 deps - 1. Register in child. Singleton of child',
	(t) => {
		const c = childContainer
			.register('logger', loggerContainer)
			.singlton('logger');

		const container = parent2ChildContainer
			.register('child1', c)
			.register('child2', c);

		const parent = container.resolve();

		loggersEquals(t, parent.child1.logger, parent.child2.logger, false);
	}
);

tape(
	'singleton. Same child container used in 2 deps - 2. Register in child. Singleton of parent',
	(t) => {
		const c = childContainer.register('logger', loggerContainer);
		const container = parent2ChildContainer
			.register('child1', c)
			.register('child2', c)
			.singlton('logger');

		const parent = container.resolve();

		loggersEquals(t, parent.child1.logger, parent.child2.logger, false);
	}
);

tape(
	'singleton. Same child container used in 2 deps - 3. Register in parent. Singleton of child',
	(t) => {
		const c = childContainer.singlton('logger');
		const container = parent2ChildContainer
			.register('child1', c)
			.register('child2', c)
			.register('logger', loggerContainer);

		const parent = container.resolve();

		loggersEquals(t, parent.child1.logger, parent.child2.logger, false);
	}
);

tape(
	'singleton. Same child container used in 2 deps - 4. Register in parent. Singleton of parent',
	(t) => {
		const container = parent2ChildContainer
			.register('child1', childContainer)
			.register('child2', childContainer)
			.register('logger', loggerContainer)
			.singlton('logger');

		const parent = container.resolve();

		loggersEquals(t, parent.child1.logger, parent.child2.logger, true);
	}
);

// 9 кейса, когда 1 фабрика регистрируется как 2 разных зависимости
// регистрация у потомка VS регистрация у фабрики VS регистрация у родителя
// синглтон у потомка VS синглтон у фабрики VS синглтон у родителя

class ParentWithTwoFactoryChildren {
	constructor(
		public createChild1: () => Child,
		public createChild2: () => Child
	) {}
}

const parent2FactoryChildContainer = Class(
	ParentWithTwoFactoryChildren,
	'child1',
	'child2'
);

tape(
	'singleton. Same factory used in 2 deps - 1. Register in child. Singleton of child',
	(t) => {
		const f = factory(
			childContainer
				.register('logger', loggerContainer)
				.singlton('logger')
		);
		const container = parent2FactoryChildContainer
			.register('child1', f)
			.register('child2', f);

		const parent = container.resolve();

		loggersEquals(
			t,
			parent.createChild1().logger,
			parent.createChild2().logger,
			false
		);
	}
);

tape(
	'singleton. Same factory used in 2 deps - 2. Register in child. Singleton of factory',
	(t) => {
		const f = factory(
			childContainer.register('logger', loggerContainer)
		).singlton('logger');
		const container = parent2FactoryChildContainer
			.register('child1', f)
			.register('child2', f);

		const parent = container.resolve();

		loggersEquals(
			t,
			parent.createChild1().logger,
			parent.createChild2().logger,
			false
		);
	}
);

tape(
	'singleton. Same factory used in 2 deps - 3. Register in child. Singleton of parent',
	(t) => {
		const f = factory(childContainer.register('logger', loggerContainer));
		const container = parent2FactoryChildContainer
			.register('child1', f)
			.register('child2', f)
			.singlton('logger');

		const parent = container.resolve();

		loggersEquals(
			t,
			parent.createChild1().logger,
			parent.createChild2().logger,
			false
		);
	}
);

tape(
	'singleton. Same factory used in 2 deps - 4. Register in factory. Singleton of child',
	(t) => {
		const f = factory(childContainer.singlton('logger')).register(
			'logger',
			loggerContainer
		);
		const container = parent2FactoryChildContainer
			.register('child1', f)
			.register('child2', f);

		const parent = container.resolve();

		loggersEquals(
			t,
			parent.createChild1().logger,
			parent.createChild2().logger,
			false
		);
	}
);

tape(
	'singleton. Same factory used in 2 deps - 5. Register in factory. Singleton of factory',
	(t) => {
		const f = factory(childContainer)
			.register('logger', loggerContainer)
			.singlton('logger');
		const container = parent2FactoryChildContainer
			.register('child1', f)
			.register('child2', f);

		const parent = container.resolve();

		loggersEquals(
			t,
			parent.createChild1().logger,
			parent.createChild2().logger,
			false
		);
	}
);

tape(
	'singleton. Same factory used in 2 deps - 6. Register in factory. Singleton of parent',
	(t) => {
		const f = factory(childContainer).register('logger', loggerContainer);
		const container = parent2FactoryChildContainer
			.register('child1', f)
			.register('child2', f)
			.singlton('logger');

		const parent = container.resolve();

		loggersEquals(
			t,
			parent.createChild1().logger,
			parent.createChild2().logger,
			false
		);
	}
);

tape(
	'singleton. Same factory used in 2 deps - 7. Register in parent. Singleton of child',
	(t) => {
		const f = factory(childContainer.singlton('logger'));
		const container = parent2FactoryChildContainer
			.register('child1', f)
			.register('child2', f)
			.register('logger', loggerContainer);
		const parent = container.resolve();

		loggersEquals(
			t,
			parent.createChild1().logger,
			parent.createChild2().logger,
			false
		);
	}
);

tape(
	'singleton. Same factory used in 2 deps - 8. Register in parent. Singleton of factory',
	(t) => {
		const f = factory(childContainer).singlton('logger');
		const container = parent2FactoryChildContainer
			.register('child1', f)
			.register('child2', f)
			.register('logger', loggerContainer);
		const parent = container.resolve();

		loggersEquals(
			t,
			parent.createChild1().logger,
			parent.createChild2().logger,
			false
		);
	}
);

tape(
	'singleton. Same factory used in 2 deps - 9. Register in parent. Singleton of parent',
	(t) => {
		const f = factory(childContainer);
		const container = parent2FactoryChildContainer
			.register('child1', f)
			.register('child2', f)
			.register('logger', loggerContainer)
			.singlton('logger');
		const parent = container.resolve();

		loggersEquals(
			t,
			parent.createChild1().logger,
			parent.createChild2().logger,
			true
		);
	}
);

// 9 кейсов, когда 1 фабрика - несколько вызовов фабрики
// регистрация у потомка vs регистрация у фабрики vs регистрация у родителя
// синглтон у потомка vs синглтон у фабрики vs синглтон у родителя
// + 1 кейс, когда 2 вызова resolve

class ParentWithOneFactoryChildren {
	constructor(public createChild: () => Child) {}
}

const parent1FactoryChildContainer = Class(
	ParentWithOneFactoryChildren,
	'child'
);

tape(
	'singleton. One factory, 2 call - 1. Register in child. Singleton of child',
	(t) => {
		const f = factory(
			childContainer
				.register('logger', loggerContainer)
				.singlton('logger')
		);
		const container = parent1FactoryChildContainer.register('child', f);
		const parent = container.resolve();

		loggersEquals(
			t,
			parent.createChild().logger,
			parent.createChild().logger,
			false
		);
	}
);

tape(
	'singleton. One factory, 2 call - 2. Register in child. Singleton of factory',
	(t) => {
		const f = factory(
			childContainer.register('logger', loggerContainer)
		).singlton('logger');
		const container = parent1FactoryChildContainer.register('child', f);
		const parent = container.resolve();

		loggersEquals(
			t,
			parent.createChild().logger,
			parent.createChild().logger,
			false
		);
	}
);

tape(
	'singleton. One factory, 2 call - 3. Register in child. Singleton of parent',
	(t) => {
		const f = factory(childContainer.register('logger', loggerContainer));
		const container = parent1FactoryChildContainer
			.register('child', f)
			.singlton('logger');
		const parent = container.resolve();

		loggersEquals(
			t,
			parent.createChild().logger,
			parent.createChild().logger,
			false
		);
	}
);

tape(
	'singleton. One factory, 2 call - 4. Register in factory. Singleton of child',
	(t) => {
		const f = factory(childContainer.singlton('logger')).register(
			'logger',
			loggerContainer
		);
		const container = parent1FactoryChildContainer.register('child', f);
		const parent = container.resolve();

		loggersEquals(
			t,
			parent.createChild().logger,
			parent.createChild().logger,
			false
		);
	}
);

tape(
	'singleton. One factory, 2 call - 5. Register in factory. Singleton of factory',
	(t) => {
		const f = factory(childContainer)
			.register('logger', loggerContainer)
			.singlton('logger');
		const container = parent1FactoryChildContainer.register('child', f);
		const parent = container.resolve();

		loggersEquals(
			t,
			parent.createChild().logger,
			parent.createChild().logger,
			true
		);
	}
);

tape(
	'singleton. One factory, 2 call - 6. Register in factory. Singleton of parent',
	(t) => {
		const f = factory(childContainer).register('logger', loggerContainer);
		const container = parent1FactoryChildContainer
			.register('child', f)
			.singlton('logger');
		const parent = container.resolve();

		loggersEquals(
			t,
			parent.createChild().logger,
			parent.createChild().logger,
			true
		);
	}
);

tape(
	'singleton. One factory, 2 call - 7. Register in parent. Singleton of child',
	(t) => {
		const f = factory(childContainer.singlton('logger'));
		const container = parent1FactoryChildContainer
			.register('child', f)
			.register('logger', loggerContainer);
		const parent = container.resolve();

		loggersEquals(
			t,
			parent.createChild().logger,
			parent.createChild().logger,
			false
		);
	}
);

tape(
	'singleton. One factory, 2 call - 8. Register in parent. Singleton of factory',
	(t) => {
		const f = factory(childContainer).singlton('logger');
		const container = parent1FactoryChildContainer
			.register('child', f)
			.register('logger', loggerContainer);
		const parent = container.resolve();

		loggersEquals(
			t,
			parent.createChild().logger,
			parent.createChild().logger,
			true
		);
	}
);

tape(
	'singleton. One factory, 2 call - 9. Register in parent. Singleton of parent',
	(t) => {
		const f = factory(childContainer);
		const container = parent1FactoryChildContainer
			.register('child', f)
			.register('logger', loggerContainer)
			.singlton('logger');
		const parent = container.resolve();

		loggersEquals(
			t,
			parent.createChild().logger,
			parent.createChild().logger,
			true
		);
	}
);

// 6 кейсов, когда общая зависимость у потомка и родителя
// регистрация зависимости только в родителя vs регистрация зависимости и в родителе, и в потомке
// пометка синглтоном у родителя vs пометка синглтоном у потомка vs пометка синглтоном и в родителе, и в потомке

class ParentWithLogger {
	constructor(public child: Child, public logger: Logger) {}
}

const parentWithLoggerContainer = Class(ParentWithLogger, 'child', 'logger');

tape(
	'singleton. Parent and child, same dep - 1. No register in child. Singleton of parent',
	(t) => {
		const container = parentWithLoggerContainer
			.register('logger', loggerContainer)
			.register('child', childContainer)
			.singlton('logger');
		const parent = container.resolve();

		loggersEquals(t, parent.logger, parent.child.logger, true);
	}
);

tape(
	'singleton. Parent and child, same dep - 2. Register in child. Singleton of parent',
	(t) => {
		const container = parentWithLoggerContainer
			.register('logger', loggerContainer)
			.register(
				'child',
				childContainer.register('logger', loggerContainer)
			)
			.singlton('logger');
		const parent = container.resolve();

		loggersEquals(t, parent.logger, parent.child.logger, true);
	}
);

tape(
	'singleton. Parent and child, same dep - 3. No register in child. Singleton of parent',
	(t) => {
		const container = parentWithLoggerContainer
			.register('logger', loggerContainer)
			.register('child', childContainer.singlton('logger'));
		const parent = container.resolve();

		loggersEquals(t, parent.logger, parent.child.logger, false);
	}
);

tape(
	'singleton. Parent and child, same dep - 4. Register in child. Singleton of parent',
	(t) => {
		const container = parentWithLoggerContainer
			.register('logger', loggerContainer)
			.register(
				'child',
				childContainer
					.singlton('logger')
					.register('logger', loggerContainer)
			);
		const parent = container.resolve();

		loggersEquals(t, parent.logger, parent.child.logger, false);
	}
);

tape(
	'singleton. Parent and child, same dep - 5. No register in child. Singleton of parent and child',
	(t) => {
		const container = parentWithLoggerContainer
			.register('logger', loggerContainer)
			.singlton('logger')
			.register('child', childContainer.singlton('logger'));
		const parent = container.resolve();

		loggersEquals(t, parent.logger, parent.child.logger, true);
	}
);

tape(
	'singleton. Parent and child, same dep - 6. Register in child. Singleton of parent and child',
	(t) => {
		const container = parentWithLoggerContainer
			.register('logger', loggerContainer)
			.singlton('logger')
			.register(
				'child',
				childContainer
					.singlton('logger')
					.register('logger', loggerContainer)
			);
		const parent = container.resolve();

		loggersEquals(t, parent.logger, parent.child.logger, true);
	}
);
