import { computedValue, constant } from '../../src';

export const strToken = Symbol();
export const numToken = Symbol();
export const childContainer = computedValue(
	(p: { str: string; num: number }) => Boolean(p),
	{
		num: numToken,
		str: strToken,
	}
).register({
	[strToken]: constant(''),
	[numToken]: 123,
});
