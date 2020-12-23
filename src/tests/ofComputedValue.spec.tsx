import tape from 'tape';
import { ofComputedValue, ofConstant } from '..';

tape('ofComputedValue. Without params', (t) => {
	const container = ofComputedValue(() => 'my_string');

	t.equal(container.resolve(), 'my_string');

	t.end();
});

tape('ofComputedValue. With params', (t) => {
	const container = ofComputedValue(
		(pDep1: number) => ({
			value: pDep1,
		}),
		'dep1'
	).register('dep1', ofConstant(864));

	t.deepEqual(container.resolve(), { value: 864 });

	const container2 = ofComputedValue(
		(pDep1: number, pDep2: string) => ({
			value: pDep1,
			str: pDep2,
		}),
		'dep1',
		'dep2'
	)
		.register('dep1', ofConstant(864))
		.register('dep2', ofConstant('str2'));

	t.deepEqual(container2.resolve(), { value: 864, str: 'str2' });

	t.end();
});

tape('ofComputedValue. Nested', (t) => {
	const container = ofComputedValue(
		(
			pdep1: number,
			pnested1: { nestedValue: string },
			pnested2: boolean
		) => ({
			value: pdep1,
			n1: pnested1,
			n2: pnested2,
		}),
		'dep1',
		'nested1',
		'nested2'
	)
		.register('dep1', ofConstant(154))
		.register(
			'nested1',
			ofComputedValue(
				(pnStr: string) => ({
					nestedValue: pnStr,
				}),
				'nStr'
			).register('nStr', ofConstant('nStrValue'))
		)
		.register(
			'nested2',
			ofComputedValue((pn2: boolean) => pn2, 'n2')
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

tape('ofComputedValue. With params. Object', (t) => {
	const container = ofComputedValue(
		({ pDep1 }: { pDep1: number }) => ({
			value: pDep1,
		}),
		{ pDep1: 'dep1' }
	).register('dep1', ofConstant(864));

	t.deepEqual(container.resolve(), { value: 864 });

	const container2 = ofComputedValue(
		({ pDep1, pDep2 }: { pDep1: number; pDep2: string }) => ({
			value: pDep1,
			str: pDep2,
		}),
		{
			pDep1: 'dep1',
			pDep2: 'dep2',
		}
	)
		.register('dep1', ofConstant(864))
		.register('dep2', ofConstant('str2'));

	t.deepEqual(container2.resolve(), { value: 864, str: 'str2' });

	t.end();
});

tape('ofComputedValue. Nested. Object', (t) => {
	const container = ofComputedValue(
		({
			pdep1,
			pnested1,
			pnested2,
		}: {
			pdep1: number;
			pnested1: { nestedValue: string };
			pnested2: boolean;
		}) => ({
			value: pdep1,
			n1: pnested1,
			n2: pnested2,
		}),
		{
			pdep1: 'dep1',
			pnested1: 'nested1',
			pnested2: 'nested2',
		}
	)
		.register('dep1', ofConstant(154))
		.register(
			'nested1',
			ofComputedValue(
				({ pnStr }: { pnStr: string }) => ({
					nestedValue: pnStr,
				}),
				{ pnStr: 'nStr' }
			).register('nStr', ofConstant('nStrValue'))
		)
		.register(
			'nested2',
			ofComputedValue(({ pn2 }: { pn2: boolean }) => pn2, { pn2: 'n2' })
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
