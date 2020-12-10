import tape from 'tape';
import { spy } from 'sinon';

import { ofClass } from '..';

tape('ofClass', (t) => {
	class C0 {}

	const container = ofClass(C0);

	t.ok(container.resolve() instanceof C0);

	t.end();
});
