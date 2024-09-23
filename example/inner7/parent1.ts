import { computedValue } from '../../src';
import { childContainer as ch1 } from './child1';
import { childContainer as ch2 } from './child2';
import { childContainer as ch3 } from './child3';
import { childContainer as ch4 } from './child4';
import { childContainer as ch5 } from './child5';
import { childContainer as ch6 } from './child6';
import { childContainer as ch7 } from './child7';

export const parentContainer = computedValue(
	(p: {
		ch1: boolean;
		ch2: boolean;
		ch3: boolean;
		ch4: boolean;
		ch5: boolean;
		ch6: boolean;
		ch7: boolean;
	}) => Boolean(p),
	{
		ch1,
		ch2,
		ch3,
		ch4,
		ch5,
		ch6,
		ch7,
	}
);
