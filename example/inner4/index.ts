import { computedValue } from '../../src';
import { parentContainer as p1 } from './parent1';
import { parentContainer as p2 } from './parent2';
import { parentContainer as p3 } from './parent3';
import { parentContainer as p4 } from './parent4';
import { parentContainer as p5 } from './parent5';
import { parentContainer as p6 } from './parent6';
import { parentContainer as p7 } from './parent7';

export const appContainer = computedValue(
	(p: {
		p1: boolean;
		p2: boolean;
		p3: boolean;
		p4: boolean;
		p5: boolean;
		p6: boolean;
		p7: boolean;
	}) => Boolean(p),
	{
		p1,
		p2,
		p3,
		p4,
		p5,
		p6,
		p7: 'p7',
	}
).register({
	p7,
});
