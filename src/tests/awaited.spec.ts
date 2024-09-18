import tape from 'tape';
import { awaited, constant, FactoryResolve, computedValue, factory } from '..';

tape('awaited. Without params', async (t) => {
	const container = awaited(async () => constant('my_string'));

	const waitValue = container.resolve();

	t.equal(await waitValue(), 'my_string');

	t.end();
});

tape('ofFactory. With deps. Via resolve', async (t) => {
	const child = computedValue((v: string) => ({ value: v }), 'strValue');
	const awaitedChild = awaited(async () => child);

	t.deepEqual(await awaitedChild.resolve({ strValue: '123' })(), {
		value: '123',
	});

	t.end();
});

tape('ofFactory. With deps. Via child', async (t) => {
	const child = computedValue(
		(v: string) => ({ value: v }),
		'strValue'
	).register('strValue', '345');
	const awaitedChild = awaited(async () => child);

	t.deepEqual(await awaitedChild.resolve()(), {
		value: '345',
	});

	t.end();
});

tape('ofFactory. With deps. Via awaited', async (t) => {
	const child = computedValue((v: string) => ({ value: v }), 'strValue');
	const awaitedChild = awaited(async () => child).register('strValue', '321');

	t.deepEqual(await awaitedChild.resolve()(), {
		value: '321',
	});

	t.end();
});

tape('ofFactory. With deps. Mixed', async (t) => {
	const child = computedValue(
		(v1: string, v2: number, v3: boolean) => ({ v1, v2, v3 }),
		'dV1',
		'dV2',
		'dV3'
	).register('dV1', 'str');
	const awaitedChild = awaited(async () => child).register('dV2', 100);

	t.deepEqual(await awaitedChild.resolve({ dV3: false })(), {
		v1: 'str',
		v2: 100,
		v3: false,
	});

	t.end();
});
