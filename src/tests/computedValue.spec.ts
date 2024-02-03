import tape from 'tape';
import { computedValue, constant } from '..';

tape('ofComputedValue. Without params', (t) => {
	const container = computedValue(() => 'my_string');

	t.equal(container.resolve(), 'my_string');

	t.end();
});

tape('ofComputedValue. With params', (t) => {
	const container = computedValue(
		(pDep1: number) => ({
			value: pDep1,
		}),
		'dep1'
	).register('dep1', constant(864));

	t.deepEqual(container.resolve(), { value: 864 });

	const container2 = computedValue(
		(pDep1: number, pDep2: string) => ({
			value: pDep1,
			str: pDep2,
		}),
		'dep1',
		'dep2'
	)
		.register('dep1', constant(864))
		.register('dep2', constant('str2'));

	t.deepEqual(container2.resolve(), { value: 864, str: 'str2' });

	t.end();
});

tape('ofComputedValue. Nested', (t) => {
	const container = computedValue(
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
		.register('dep1', constant(154))
		.register(
			'nested1',
			computedValue(
				(pnStr: string) => ({
					nestedValue: pnStr,
				}),
				'nStr'
			).register('nStr', constant('nStrValue'))
		)
		.register(
			'nested2',
			computedValue((pn2: boolean) => pn2, 'n2')
		)
		.register('n2', constant(true));

	t.deepEqual(container.resolve(), {
		value: 154,
		n1: { nestedValue: 'nStrValue' },
		n2: true,
	});

	t.end();
});

tape('ofComputedValue. With params. Object', (t) => {
	const container = computedValue(
		({ pDep1 }: { pDep1: number }) => ({
			value: pDep1,
		}),
		{ pDep1: 'dep1' }
	).register('dep1', constant(864));

	t.deepEqual(container.resolve(), { value: 864 });

	const container2 = computedValue(
		({ pDep1, pDep2 }: { pDep1: number; pDep2: string }) => ({
			value: pDep1,
			str: pDep2,
		}),
		{
			pDep1: 'dep1',
			pDep2: 'dep2',
		}
	)
		.register('dep1', constant(864))
		.register('dep2', constant('str2'));

	t.deepEqual(container2.resolve(), { value: 864, str: 'str2' });

	t.end();
});

tape('ofComputedValue. Nested. Object', (t) => {
	const container = computedValue(
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
		.register('dep1', constant(154))
		.register(
			'nested1',
			computedValue(
				({ pnStr }: { pnStr: string }) => ({
					nestedValue: pnStr,
				}),
				{ pnStr: 'nStr' }
			).register('nStr', constant('nStrValue'))
		)
		.register(
			'nested2',
			computedValue(({ pn2 }: { pn2: boolean }) => pn2, { pn2: 'n2' })
		)
		.register('n2', constant(true));

	t.deepEqual(container.resolve(), {
		value: 154,
		n1: { nestedValue: 'nStrValue' },
		n2: true,
	});

	t.end();
});

tape('ofComputedValue. Nested. Object. No tokens', (t) => {
	const container = computedValue(
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
			pdep1: constant(154),
			pnested1: 'nested1',
			pnested2: computedValue(({ pn2 }: { pn2: boolean }) => pn2, {
				pn2: 'n2',
			}),
		}
	)
		.register(
			'nested1',
			computedValue(
				({ pnStr }: { pnStr: string }) => ({
					nestedValue: pnStr,
				}),
				{ pnStr: constant('nStrValue') }
			)
		)
		.register('n2', true);

	t.deepEqual(container.resolve(), {
		value: 154,
		n1: { nestedValue: 'nStrValue' },
		n2: true,
	});

	t.end();
});
