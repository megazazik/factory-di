import tape from 'tape';
import { spy } from 'sinon';

import { ofClass } from '..';

tape('ofClass', (t) => {
	t.equal(typeof ofClass, 'function');

	t.end();
});
