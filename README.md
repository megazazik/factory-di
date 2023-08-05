# factory-di

[![npm version](https://badge.fury.io/js/factory-di.svg)](https://badge.fury.io/js/factory-di)

This library contains function to create some kind of Dependency Injection Containres. These containers do not use any global scope or metadata.

-   [Advantages](#advantages)
-   [Simple example](#simple-example)
-   [Containers](#containers)
-   [Class](#class)
-   [computedValue](#computedvalue)
-   [constant](#constant)
-   [factory](#factory)
-   [singleton](#singleton)

## Advantages

-   strict type checking that all required dependencies are registered
-   lightweight
-   no global containers
-   no decorators

## Simple example

_foo.ts_:

```typescript
import { Class } from 'factory-di';

interface Database {
	// ...
}

class Foo {
	constructor(private database: Database) {}
}

// creates container which can create Foo instances
// and declare that database parameter of interface Database should be registered via token 'database'
export default Class(Foo, 'database');
```

_database.ts_:

```typescript
import { Class } from 'factory-di';

class Database {
	constructor(
		private host: string,
		private login: string,
		private password: string
	) {}
}

// creates container which can create Database instances and declare tokens for all parameters
export default Class(Database, 'dbHost', 'dbLogin', 'dbPassword');
```

_index.ts_:

```typescript
import { singleton, constant } from 'factory-di';
import fooContainer from './foo';
import databaseContainer from './database';

// you can not create Foo via fooContainer here because its dependency 'database' is not registered yet
// this line would cause TS error
// fooContainer.resolve();

// creates a new container (each call of register function create a new independent containers)
const containerWithDatabase = fooContainer
	// registers database as a singleton
	.register('database', singleton(databaseContainer))
	// you must register also all dependencies of 'database'
	// or a call of resolve would cause TS error too
	// you can register static values via 'constant' function
	.register('dbHost', constant('<your_host>'))
	.register('dbLogin', constant('<your_login>'))
	.register('dbPassword', constant('<your_password>'));

// now you can create Foo
const fooInstance = containerWithDatabase.resolve();

// or you can create Database
const database = containerWithDatabase.resolve('database');
```

## Containers

Containers are objects which can create some values. They are similar to factories. They do not use the global scope as regular Dependency Injection Containers.

Each container has a main value. It can be created via a `resolve` call without parameters.

```typescript
class Foo {}

const fooInstance = Class(Foo).resolve();
```

A container can have any list of dependencies. You should declare all dependencies when you create a container.

```typescript
class Bar {
	constructor(public foo: Foo) {}
}

// create a container and declare Foo dependency for the only argument of Bar constructor
const container = Class(Bar, 'Foo');
```

Each dependency has a token. You can use a string or a symbol as a dependency token.

Before you can call the `resolve` method you must registed all declared dependencies. You can do it via the `register` method. It receives a dependency token and a dependency container.

```typescript
class Bar {
	constructor(public foo: Foo) {}
}

const container = Class(Bar, 'Foo')
	// registers Foo dependency with a new container
	.register('Foo', Class(Foo));

const barInstance = container.resolve();
```

Multiple dependencies registrations can be union to a single 'register' method call.

```typescript
class Bar {
	constructor(public dep1: string, public dep2: number) {}
}

const container = Class(SomeClass, 'dep1', 'dep2')
	// registers all dependencies via object
	.register({
		dep1: constant('myStringValue'),
		dep2: constant(123),
	});
```

If you want to register a simple value as a dependency via the `register` method you can omit the `constant` function call. This example is equal to the previous.

```typescript
const container = Class(SomeClass, 'dep1', 'dep2')
	// registers all dependencies via object
	.register({
		dep1: 'myStringValue',
		dep2: 123,
	});
```

If a container has unregistered dependencies you can pass them directly to the `resolve` meethod to create a main value of the container.

```typescript
const instance = Class(SomeClass, 'dep1', 'dep2').resolve({
	dep1: 'myStringValue',
	dep2: 123,
});
```

Also you can create any declared dependency. To do that you need to pass a token of the dependency.

```typescript
const fooInstance = container.resolve('Foo');
```

Each call of the `register` method returns a new inpedendent container.

Containers can have many levels of nesting. You can use the `resolve` function to create values from any level of nesting.

Dependencies can be registered via a root container or via any nested container.

```typescript
class Foo {}

class Bar {
	constructor(public foo: Foo) {}
}

class Root {
	constructor(public bar: Bar) {}
}

const root1 = Class(Root, 'bar')
	.register('bar', Class(Bar, 'foo'))
	.register('foo', Class(Foo)) // register foo via the Root container
	.resolve();

const root2 = Class(Root, 'bar')
	.register(
		'bar',
		Class(Bar, 'foo').register('foo', Class(Foo)) // register foo via the Bar container
	)
	.resolve();
```

If some dependency is registered twice in different child containers then each child container receives its own dependency value.

```typescript
class Foo1 {
	constructor(public str: string) {}
}

class Foo2 {
	constructor(public str: string) {}
}

class Root {
	constructor(public foo1: Foo1, public foo2: Foo2) {}
}

const root = Class(Root, 'foo1', 'foo2')
	// register 'strValue1' via foo1
	.register('foo1', Class(Foo, 'str').register('str', constant('strValue1')))
	// register 'strValue2' via foo2
	.register('foo2', Class(Foo, 'str').register('str', constant('strValue2')))
	.resolve();

// each child instance has its own string value
root.foo1.str; // 'strValue1'
root.foo2.str; // 'strValue2'
```

If some dependency is registered via a parent container and via a any child container then the parent dependency value is used for parent and children containers.

```typescript
class Foo1 {
	constructor(public str: string) {}
}

class Root {
	constructor(public foo1: Foo1) {}
}

const root = Class(Root, 'foo1', 'foo2')
	// register 'strValue1' via foo1
	.register('foo1', Class(Foo, 'str').register('str', constant('strValue1')))
	// register 'strValueRoot'
	.register('str', constant('strValueRoot'))
	.resolve();

root.foo1.str; // 'strValueRoot'
```

## Class

The `Class` function can be used to create containers which create some class instances.

There are two form of the `Class` function.

### Each constructor dependency as a separate argument

The first form can be used for constructors which receive each dependency as a separate argument.
The simplified type of the first form.

```typescript
function Class(
	// the first argument is a class constructor
	Constructor: { new (...args: any[]): any },
	// other arguments - list of tokens for each argument of the constructor
	...tokens: Array<string | symbol>
): Container;
```

Example.

```typescript
class MyClass {
	constructor(public param1: string, public param2: number) {}
}

const myClassContainer = Class(MyClass, 'param1Token', 'param2Token');

const myClassInstance = myClassContainer
	.register('param1Token', constant('strValue'))
	.register('param2Token', constant(123))
	.resolve();
```

### Object with constructor dependencies

The second form can be used for constructors which receive an object with dependencies as the only argument.
The simplified type of the second form.

```typescript
function Class(
	// the first argument is a class constructor
	Constructor: { new (params: Record<string, any>): any },
	// map of tokens where
	//   keys - keys of the constructor argument
	//   values - tokens for the corresponding argument
	tokensMap: Record<string, string | symbol>
): Container;
```

Example.

```typescript
interface MyClassParams {
	strParam: string;
	numParam: number;
}

class MyClass {
	constructor(public params: MyClassParams) {}
}

const myClassContainer = Class(MyClass, {
	strParam: 'param1Token',
	numParam: 'param2Token',
});

const myClassInstance = myClassContainer
	.register('param1Token', constant('strValue'))
	.register('param2Token', constant(123))
	.resolve();

myClassInstance.params.strParam; // 'strValue'
myClassInstance.params.numParam; // 123
```

Also dependencies can be registered inside the `Class` function call. Then field names of the class first parameter will be used as tokens.

```typescript
interface MyClassParams {
	strParam: string;
	numParam: number;
}

class MyClass {
	constructor(public params: MyClassParams) {}
}

/**
 * container has 2 unregistered dependencies with tokens
 *  - param1Token
 *  - param2Token
 */
const container1 = Class(MyClass, {
	strParam: 'param1Token',
	numParam: 'param2Token',
});

/**
 * container has 2 registered dependencies with tokens
 *  - strParam
 *  - numParam
 */
const container2 = Class(MyClass, {
	strParam: constant('strValue'),
	numParam: constant(123),
});
```

## computedValue

The `computedValue` function can be used to create containers for any computed values.

There are two form of the `computedValue` function.

### Each computedValue dependency as a separate argument

The first form can be used for functions which receive each dependency as a separate argument.
The simplified type of the first form.

```typescript
function computedValue(
	// the first argument is a function which creates some value
	create: (...args: any[]): any,
	// other arguments - list of tokens for each argument of the create function
	...tokens: Array<string | symbol>
): Container;
```

Example.

```typescript
const myContainer = computedValue(
	// function can return any value
	(param1: string, param2: number) => new MyClass(param1, param2),
	'param1Token',
	'param2Token'
);

const myValue = myContainer
	.register('param1Token', constant('strValue'))
	.register('param2Token', constant(123))
	.resolve();
```

### Object with computedValue dependencies

The second form can be used for functions which receive an object with dependencies as the only argument.
The simplified type of the second form.

```typescript
function computedValue(
	// the first argument is a function which creates some value
	create: (params: Record<string, any>): any,
	// map of tokens where
	//   keys - keys of the create function argument
	//   values - tokens for the corresponding argument
	tokensMap: Record<string, string | symbol>
): Container;
```

Example.

```typescript
interface MyFactoryMethodParams {
	strParam: string;
	numParam: number;
}

const myContainer = computedValue(
	// function can return any value
	(params: MyFactoryMethodParams) => new MyClass(params),
	{
		strParam: 'param1Token',
		numParam: 'param2Token',
	}
);

const myValue = myContainer
	.register('param1Token', constant('strValue'))
	.register('param2Token', constant(123))
	.resolve();

myValue.params.strParam; // 'strValue'
myValue.params.numParam; // 123
```

Also dependencies can be registered inside the `computedValue` function call. Then field names of the factory method first parameter will be used as tokens.

```typescript
interface MyFactoryMethodParams {
	strParam: string;
	numParam: number;
}

/**
 * container has 2 unregistered dependencies with tokens
 *  - param1Token
 *  - param2Token
 */
const container1 = computedValue(
	(params: MyFactoryMethodParams) => new MyClass(params),
	{
		strParam: 'param1Token',
		numParam: 'param2Token',
	}
);

/**
 * container has 2 registered dependencies with tokens
 *  - strParam
 *  - numParam
 */
const container2 = computedValue(
	(params: MyFactoryMethodParams) => new MyClass(params),
	{
		strParam: constant('strValue'),
		numParam: constant(123),
	}
);
```

## constant

The `constant` function can be used to create a container for some immutable value. The common case - to pass a constant container as a dependency of some other container.

```typescript
function constant(value: any): Container;
```

Example.

```typescript
const myConstantContainer = constant(99);

computedValue((num: number) => new MyClass(num), 'numValue')
	.register('numValue', myConstantContainer)
	.resolve();
```

## factory

The `factory` function can be used to create Factory method or some Factories. It is useful when you need to create multiple instances of some dependency in runtime dynamically.

There are two ways to use the `factory` function - via `create` method or with a child container.

### create method

```typescript
type Resolve = (token: string | symbol) => any;

function factory(
	// the only argument is a function which returns a value (usually a factory or a factory method)
	create: (resolve: Resolve): any,
): Container;
```

The `create` function (the only argument of `factory`) receives the `resolve` method. The `resolve` method receives a dependency token and returns its value.

Example.

```typescript
import { FactoryResolve, factory } from 'factory-di';
import { repositoryContainer } from './repository';
import { MyClass } from './myClass';

const myFactoryMethod = factory(
	// via FactoryResolve type you can declare needed dependencies
	(resolve: FactoryResolve<{ repository: Repository }>) => {
		// the factory method receives an id and return an instance
		return (id: string) =>
			new MyClass({
				repository: resolve('repository'),
				id,
			});
	}
)
	// register the only dependency
	.register('repository', repositoryContainer)
	.resolve();

const myClassInstance1 = myFactoryMethod('id1');
const myClassInstance2 = myFactoryMethod('id2');
```

### with child container

In this example ShoppingCart needs to create multiple instances of ShoppingItem in runtime.

```typescript
import { factory, Class } from 'factory-di';

class ShoppingItem {
	constructor(
		public productId: number,
		public amount: number,
	){}
}

class ShoppingCart {
	items: ShoppingItem[];


	constructor(
		// ShoppingCart needs a factory method for ShoppingItem
		private itemFactory: (productId: number, amount: number) => ShoppingItem;
	) {}

	addItem(productId: number, amount: number): ShoppingItem {
		// we need to create items in runtime
		const newItem = this.itemFactory(productId, amount)
		this.items.push(newItem);

		return newItem;
	}
}

// this container can create ShoppingItem
const itemContainer = Class(ShoppingItem, 'shoppingItemProductId', 'shoppingItemAmount');

// this container can create function  (productId, amount) => ShoppingItem
const itemFactoryContainer = factory(itemContainer, 'shoppingItemProductId', 'shoppingItemAmount');

const cartContainer = Class(ShoppingCart, 'shoppingItemFactory')
	.register(
		'shoppingItemFactory',
		itemFactoryContainer,
	);

// creates a cart
const cart = cartContainer.resolve();

cart.addItem(321, 5); // ShoppingItem { productId: 321, amount: 5 }
```

The first argument of `factory` is a child container.
The next arguments describe parameters of a new facrory method.
The way to describe parameters of factory method is similar to describing tokens of `computedValue` or `Class`.

#### without parameters

```typescript
class Car {
	constructor(public manufacturer: string, public model: string) {}
}

// carContainer creates cars and requires two dependencies
const carContainer = Class(Car, 'carManufacturer', 'carModel');

// this container creates function: () => Car
// and requires the same two dependencies - 'carManufacturer' and 'carModel'
const carFactoryContainer = factory(carContainer);

// so before using carFactory you should register these two deps
const toyotaCamryFactory = carFactoryContainer
	.register({
		carManufacturer: 'toyota',
		carModel: 'camry',
	})
	.resolve();

// now you can use toyotaCamryFactory to create cars
toyotaCamryFactory(); // Car { manufacturer: 'toyota', model: 'camry'}
```

#### list of parameters

```typescript
// by passing 'carModel' we define that factory method has one parameter
// and its value will be passed as 'carModel' dependency to carContainer
// carFactoryContainer creates function: (model) => Car
// and requires the only dependency - 'carManufacturer'.
const carFactoryContainer = factory(carContainer, 'carModel');

// so before using carFactory you should register carManufacturer
const toyotaFactory = carFactoryContainer
	.register({
		carManufacturer: 'toyota',
	})
	.resolve();

toyotaFactory('camry'); // Car { manufacturer: 'toyota', model: 'camry'}
toyotaFactory('corolla'); // Car { manufacturer: 'toyota', model: 'corolla'}
```

```typescript
// this container creates function: (manufacturer, model) => Car
const carFactoryContainer = factory(
	carContainer,
	'carManufacturer',
	'carModel'
);
const carFactory = carFactoryContainer.resolve();

carFactory('toyota', 'corolla'); // Car { manufacturer: 'toyota', model: 'corolla'}
carFactory('ford', 'mondeo'); // Car { manufacturer: 'ford', model: 'mondeo'}
```

#### parameters as fields of object

```typescript
// by passing "{model: 'carModel'}" we define that factory method has one parameter
// and its field 'model' will be passed as 'carModel' dependency to carContainer
// carFactoryContainer creates function: ({ model }) => Car
// and requires the only dependency - 'carManufacturer'.
const carFactoryContainer = factory(carContainer, { model: 'carModel' });

// so before using carFactory you should register carManufacturer
const toyotaFactory = carFactoryContainer
	.register({
		carManufacturer: 'toyota',
	})
	.resolve();

toyotaFactory({ model: 'camry' }); // Car { manufacturer: 'toyota', model: 'camry'}
toyotaFactory({ model: 'corolla' }); // Car { manufacturer: 'toyota', model: 'corolla'}
```

```typescript
// this container creates function: ({ manufacturer, model }) => Car
const carFactoryContainer = factory(carContainer, {
	manufacturer: 'carManufacturer',
	model: 'carModel',
});
const carFactory = carFactoryContainer.resolve();

carFactory({ manufacturer: 'toyota', model: 'corolla' }); // Car { manufacturer: 'toyota', model: 'corolla'}
carFactory({ manufacturer: 'ford', model: 'mondeo' }); // Car { manufacturer: 'ford', model: 'mondeo'}
```

## singleton

If you need some dependency to be singleton you can wrap any dependency container with the `singleton` function.

```typescript
import { Class, singleton } from 'factory-di';

class Foo {}

class Bar {
	constructor(public foo: Foo) {}
}

const container = Class(Bar, 'Foo').register(
	Bar,
	// wrap Foo container with singleton
	singleton(Class(Foo))
);

// now each Bar instance reveices the same Foo instance
const barInstance1 = container.resolve();
const barInstance2 = container.resolve();
```

Each call of `singleton` creates an independent instance container. If you register some dependency via two nested containers with two calls of `singleton`. Then these two nested containers will receive 2 different instances.

If you need nested containers receive the same singleton instance you should once wrap some container with `singleton` and pass the wrapped container as a dependency to other containers. Or you should register a singleton once via a root container.

### Clear singletons

To clear singleton instances you can get a Singleton Manager instance. You can get it via `SingletonManagerKey`.

```typescript
import { SingletonManagerKey } from 'factory-di';

const singletonManager = rootContainer.resolve(SingletonManagerKey);
```

A Singleton Manager instance has the only method 'clear' which delete all singleton instances created inside this container and inside all nested containers.
