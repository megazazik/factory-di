import tape from 'tape';
import { Class } from '..';

class C1 {
	constructor(public p1: number) {}
}

class C2 {
	constructor(public c1: C1, public p2: string) {}
}

const containerC1 = Class(C1, 'c1Dep1');

const containerC2 = Class(C2, 'c2Dep1', 'c2Dep2');

tape('ofConstant1', (t) => {
	const result = containerC2
		.register('c2Dep1', containerC1)
		.register('c1Dep1', 123)
		.register('c2Dep2', 'strvalue')
		.resolve();

	t.equal(result.p2, 'strvalue');
	t.equal(result.c1.p1, 123);

	t.end();
});

tape('ofConstant2', (t) => {
	const result = containerC2
		.register('c2Dep1', containerC1.register('c1Dep1', 123))
		.register('c2Dep2', 'strvalue')
		.resolve();

	t.equal(result.p2, 'strvalue');
	t.equal(result.c1.p1, 123);

	t.end();
});

tape('ofConstant3', (t) => {
	const result = containerC2
		.register('c2Dep1', containerC1)
		.register({
			c1Dep1: 123,
			c2Dep2: 'strvalue',
		})
		.resolve();

	t.equal(result.p2, 'strvalue');
	t.equal(result.c1.p1, 123);

	t.end();
});

tape('ofConstant4', (t) => {
	const result = containerC2
		.register('c2Dep1', containerC1.register({ c1Dep1: 123 }))
		.register({ c2Dep2: 'strvalue' })
		.resolve();

	t.equal(result.p2, 'strvalue');
	t.equal(result.c1.p1, 123);

	t.end();
});
