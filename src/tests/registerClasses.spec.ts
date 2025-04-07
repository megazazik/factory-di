import tape from 'tape';
import { Container, constant, fn, Class } from '..';

class NumberValue {
	constructor(deps: { numberValue: number }) {
		this.value = deps.numberValue;
	}
	private value: number;
	getValue() {
		return this.value;
	}
}

class StringValue {
	constructor(deps: { stringValue: string }) {
		this.value = deps.stringValue;
	}
	private value: string;
	getValue() {
		return this.value;
	}
}

class CombinedValue {
	constructor(deps: { number: NumberValue; string: StringValue }) {
		this.number = deps.number;
		this.string = deps.string;
	}
	private number: NumberValue;
	private string: StringValue;
	getValue() {
		return `${this.string.getValue()}: ${this.number.getValue()}`;
	}
}

tape('registerClasses. Basic functionality', (t) => {
	const container = fn(
		(deps: { n: NumberValue }) => `value: ${deps.n.getValue()}`
	);

	const result = container
		.registerClasses({ n: NumberValue })
		.registerClasses({ numberValue: constant(123) });
	t.equal(result.resolve(), 'value: 123');
	t.end();
});

tape('registerClasses. With constant container', (t) => {
	const container = fn(
		(deps: { n: NumberValue }) => `value: ${deps.n.getValue()}`
	);

	const result = container.registerClasses({
		n: constant(new NumberValue({ numberValue: 123 })),
	});
	t.equal(result.resolve(), 'value: 123');
	t.end();
});

tape('registerClasses. With function container', (t) => {
	const container = fn(
		(deps: { n: NumberValue }) => `value: ${deps.n.getValue()}`
	);

	const result = container.registerClasses({
		n: fn(() => new NumberValue({ numberValue: 123 })),
	});
	t.equal(result.resolve(), 'value: 123');
	t.end();
});

tape('registerClasses. Multiple dependencies', (t) => {
	const container = fn(
		(deps: { n: NumberValue; s: StringValue }) =>
			`${deps.s.getValue()}: ${deps.n.getValue()}`
	);

	const result = container
		.registerClasses({
			n: NumberValue,
			s: StringValue,
		})
		.registerClasses({
			numberValue: constant(123),
			stringValue: constant('value'),
		});

	t.equal(result.resolve(), 'value: 123');
	t.end();
});

tape('registerClasses. Class with own dependencies', (t) => {
	const container = fn((deps: { combined: CombinedValue }) =>
		deps.combined.getValue()
	);

	const result = container
		.registerClasses({
			combined: Class(CombinedValue, {
				number: 'number',
				string: 'string',
			}),
		})
		.registerClasses({
			number: Class(NumberValue, { numberValue: 'numberValue' }),
			string: Class(StringValue, { stringValue: 'stringValue' }),
		})
		.registerClasses({
			numberValue: constant(123),
			stringValue: constant('value'),
		});

	t.equal(result.resolve(), 'value: 123');
	t.end();
});
