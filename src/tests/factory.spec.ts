import tape from 'tape';
import { factory, constant, FactoryResolve, computedValue } from '..';

tape('ofFactory. Without params', (t) => {
	const container = factory(() => 'my_string');

	t.equal(container.resolve(), 'my_string');

	t.end();
});

tape('ofFactory. With params', (t) => {
	const container = factory((resolve: FactoryResolve<{ dep1: number }>) => ({
		value: resolve('dep1'),
	})).register('dep1', constant(864));

	t.deepEqual(container.resolve(), { value: 864 });

	const container2 = factory(
		(resolve: FactoryResolve<{ dep1: number; dep2: string }>) => ({
			value: resolve('dep1'),
			str: resolve('dep2'),
		})
	)
		.register('dep1', constant(864))
		.register('dep2', constant('str2'));

	t.deepEqual(container2.resolve(), { value: 864, str: 'str2' });

	t.end();
});

tape('ofFactory. Nested', (t) => {
	const container = factory(
		(
			resolve: FactoryResolve<{
				dep1: number;
				nested1: { nestedValue: string };
				nested2: boolean;
			}>
		) => ({
			value: resolve('dep1'),
			n1: resolve('nested1'),
			n2: resolve('nested2'),
		})
	)
		.register('dep1', constant(154))
		.register(
			'nested1',
			factory((resolve: FactoryResolve<{ nStr: string }>) => ({
				nestedValue: resolve('nStr'),
			})).register('nStr', constant('nStrValue'))
		)

		.register(
			'nested2',
			factory((resolve: FactoryResolve<{ n2: boolean }>) => resolve('n2'))
		)
		.register('n2', constant(true));

	t.deepEqual(container.resolve(), {
		value: 154,
		n1: { nestedValue: 'nStrValue' },
		n2: true,
	});

	t.end();
});

tape('ofFactory. From container. Param list', (t) => {
	const child1 = computedValue((v: string) => ({ v }), 'vToken');

	const factoryMethod1 = factory(child1)
		.register('vToken', 'vValue1')
		.resolve();
	t.deepEqual(factoryMethod1(), { v: 'vValue1' });

	const factoryMethod2 = factory(
		child1.register('vToken', 'vValue1')
	).resolve();
	t.deepEqual(factoryMethod2(), { v: 'vValue1' });

	const factoryMethod3 = factory(child1, 'vToken').resolve();
	t.deepEqual(factoryMethod3('vValue1'), { v: 'vValue1' });

	const child2 = computedValue(
		(v: string, v2: number) => ({ v, v2 }),
		'vToken',
		'v2Token'
	);

	const factoryMethod4 = factory(child2).resolve({
		vToken: 'vValue1',
		v2Token: 321,
	});
	t.deepEqual(factoryMethod4(), { v: 'vValue1', v2: 321 });

	const factoryMethod5 = factory(
		child2.register({ vToken: 'vValue2' })
	).resolve({
		v2Token: 456,
	});
	t.deepEqual(factoryMethod5(), { v: 'vValue2', v2: 456 });

	const factoryMethod6 = factory(child2, 'vToken').resolve({
		v2Token: 457,
	});
	t.deepEqual(factoryMethod6('vValue3'), { v: 'vValue3', v2: 457 });

	const factoryMethod7 = factory(
		child2.register({
			v2Token: 458,
		}),
		'vToken'
	)
		.register({
			v2Token: 459,
		})
		.resolve();
	t.deepEqual(factoryMethod7('vValue4'), { v: 'vValue4', v2: 459 });

	const factoryMethod8 = factory(
		child2.register({
			v2Token: 458,
		}),
		'vToken',
		'v2Token'
	).resolve();
	t.deepEqual(factoryMethod8('vValue4', 22), { v: 'vValue4', v2: 22 });

	t.end();
});

tape('ofFactory. From container. Param object', (t) => {
	const child1 = computedValue((v: string) => ({ v }), 'vToken');

	const factoryMethod3 = factory(child1, { vParam: 'vToken' }).resolve();
	t.deepEqual(factoryMethod3({ vParam: 'vValue1' }), { v: 'vValue1' });

	const child2 = computedValue(
		(v: string, v2: number) => ({ v, v2 }),
		'vToken',
		'v2Token'
	);

	const factoryMethod6 = factory(child2, { vParam: 'vToken' }).resolve({
		v2Token: 457,
	});
	t.deepEqual(factoryMethod6({ vParam: 'vValue3' }), {
		v: 'vValue3',
		v2: 457,
	});

	const factoryMethod7 = factory(
		child2.register({
			v2Token: 458,
		}),
		{ vParam: 'vToken' }
	)
		.register({
			v2Token: 459,
		})
		.resolve();
	t.deepEqual(factoryMethod7({ vParam: 'vValue4' }), {
		v: 'vValue4',
		v2: 459,
	});

	const factoryMethod8 = factory(
		child2.register({
			v2Token: 458,
		}),
		{
			vParam: 'vToken',
			v2Param: 'v2Token',
		}
	).resolve();
	t.deepEqual(factoryMethod8({ vParam: 'vValue4', v2Param: 22 }), {
		v: 'vValue4',
		v2: 22,
	});

	t.end();
});

tape('ofFactory. Dependency of child container', (t) => {
	const child = computedValue(({ p }: { p: string }) => p, 'childParam');

	const parent = computedValue(
		(v: string) => ({ parentValue: v }),
		'parentValue'
	).register('parentValue', child);

	const factoryMethod = factory(parent, 'childParam').resolve();

	t.deepEqual(factoryMethod({ p: 'valueOfChild' }), {
		parentValue: 'valueOfChild',
	});

	t.end();
});
