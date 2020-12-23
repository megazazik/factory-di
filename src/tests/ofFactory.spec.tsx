import tape from 'tape';
import { ofFactory, ofConstant, FactoryResolve } from '..';

tape('ofFactory. Without params', (t) => {
	const container = ofFactory(() => 'my_string');

	t.equal(container.resolve(), 'my_string');

	t.end();
});

tape('ofFactory. With params', (t) => {
	const container = ofFactory(
		(resolve: FactoryResolve<{ dep1: number }>) => ({
			value: resolve('dep1'),
		})
	).register('dep1', ofConstant(864));

	t.deepEqual(container.resolve(), { value: 864 });

	const container2 = ofFactory(
		(resolve: FactoryResolve<{ dep1: number; dep2: string }>) => ({
			value: resolve('dep1'),
			str: resolve('dep2'),
		})
	)
		.register('dep1', ofConstant(864))
		.register('dep2', ofConstant('str2'));

	t.deepEqual(container2.resolve(), { value: 864, str: 'str2' });

	t.end();
});

tape('ofFactory. Nested', (t) => {
	const container = ofFactory(
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
		.register('dep1', ofConstant(154))
		.register(
			'nested1',
			ofFactory((resolve: FactoryResolve<{ nStr: string }>) => ({
				nestedValue: resolve('nStr'),
			})).register('nStr', ofConstant('nStrValue'))
		)

		.register(
			'nested2',
			ofFactory((resolve: FactoryResolve<{ n2: boolean }>) =>
				resolve('n2')
			)
		)
		.register('n2', ofConstant(true));

	t.deepEqual(container.resolve(), {
		value: 154,
		n1: { nestedValue: 'nStrValue' },
		n2: true,
	});

	t.deepEqual(container.resolve('nested1'), { nestedValue: 'nStrValue' });
	t.equal(container.resolve('nStr'), 'nStrValue');
	t.equal(container.resolve('dep1'), 154);
	t.equal(container.resolve('n2'), true);

	t.end();
});
