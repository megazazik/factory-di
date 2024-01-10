import tape from 'tape';
import { Class } from '..';

class C1 {
	constructor(public p1: number) {}
}

tape('Resolve with params. With one param', (t) => {
	const container = Class(C1, 'p1Value');

	const instance = container.resolve({
		p1Value: 321,
	});

	t.ok(instance instanceof C1);

	t.equal(instance.p1, 321);

	t.end();
});

class C2 {
	constructor(public с1: C1, public p2: string) {}
}

tape('Resolve with params. Override params', (t) => {
	const container = Class(C2, 'c2c1', 'c2p2').register('c2p2', '789');

	const instance = container.resolve({
		c2c1: new C1(123),
		c2p2: 'overridedValue',
	});

	t.ok(instance instanceof C2);
	t.ok(instance.с1 instanceof C1);

	t.equal(instance.p2, 'overridedValue');

	t.end();
});

class C3 {
	constructor(public c2: C2, public c1: C1) {}
}

tape('Resolve with params. Inner deps', (t) => {
	const container = Class(C3, 'c3c2', 'c3c1').register(
		'c3c2',
		Class(C2, 'c2c1', 'c2p2').register('c2c1', Class(C1, 'c1p1'))
	);

	const instance = container.resolve({
		c1p1: 999,
		c2p2: 'forC2',
		c3c1: new C1(444),
	});

	t.ok(instance instanceof C3);
	t.ok(instance.c1 instanceof C1);
	t.equal(instance.c1.p1, 444);
	t.ok(instance.c2 instanceof C2);
	t.equal(instance.c2.p2, 'forC2');
	t.ok(instance.c2.с1 instanceof C1);
	t.equal(instance.c2.с1.p1, 999);

	t.end();
});
