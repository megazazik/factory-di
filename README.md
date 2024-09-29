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
-   [Dynamic imports](#dynamic-imports)

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

// you can not create Foo via fooContainer before its dependency 'database' is registered
// fooContainer.resolve(); // this line would cause TS error

// registers all required dependencies
const containerWithDatabase = fooContainer
	// registers database
	.register('database', databaseContainer)
	// you should register also all dependencies of 'database'
	// or a call of "resolve" would cause TS error too
	.register({
		dbHost: '<your_host>',
		dbLogin: '<your_login>',
		dbPassword: '<your_password>',
	});

// now you can create Foo
const fooInstance = containerWithDatabase.resolve();
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

Before you create an instance you should register all declared dependencies. Or you can pass required dependencies to the `resolve` methos.

You can register dependencies via the `register` method. It receives a dependency token and a dependency container.

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

Each call of the `register` method returns a new inpedendent container. Containers can have many levels of nesting.

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

If some dependency is registered via a parent container and via any child container then the parent dependency value is used for parent and children containers.

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

If a dependency is registered in some container then this dependency is applied only for this container and its children containers. The dependency won't be used for parents of the container.

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
	.register('param1Token', 'strValue')
	.register('param2Token', 123)
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
	/**
	 * inside Class function you should always use constant function to register static values (not child containers)
	 */
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
	.register('param1Token', 'strValue')
	.register('param2Token', 123)
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
		/**
		 * inside computedValue function you should always use constant function to register static values (not child containers)
		 */
		strParam: constant('strValue'),
		numParam: constant(123),
	}
);
```

## constant

The `constant` function can be used to create a container for some immutable value. The common case - to pass a constant container as a dependency directly to `Class` or `computedValue` method.

```typescript
function constant(value: any): Container;
```

Example.

```typescript
const myConstantContainer = constant(99);

computedValue((params: { num: number }) => new MyClass(params), {
	num: constant(99),
}).resolve();
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

// so before using carFactory you should pass these two deps
const toyotaCamryFactory = carFactoryContainer.resolve({
	carManufacturer: 'toyota',
	carModel: 'camry',
});

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

// so before using carFactory you should pass carManufacturer
const toyotaFactory = carFactoryContainer.resolve({
	carManufacturer: 'toyota',
});

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

If some containers need the same dependency then by default they receive different instances of this dependency.

```typescript
class Logger {}

class Module1 {
	constructor(public logger: Logger) {}
}

class Module2 {
	constructor(public logger: Logger) {}
}

class App {
	constructor(public modules: { module1: Module1; module2: Module2 }) {}
}

const app = Class(App, {
	module1: Class(Module1, 'logger'),
	module2: Class(Module2, 'logger'),
})
	.register('logger', Class(Logger))
	.resolve();

a.modules.module1.logger === a.modules.module2.logger; // false
```

If you need some dependency to be a singleton you can call the `singleton` method and pass a key of any dependency as an argument.

```typescript
const app = Class(App, {
	module1: Class(Module1, 'logger'),
	module2: Class(Module2, 'logger'),
})
	.register('logger', Class(Logger))
	.singleton('logger')
	.resolve();

a.modules.module1.logger === a.modules.module2.logger; // true
```

There are some factors of the `singleton` method behavior.

-   if you make a dependency to be a singleton it affects only the current container and its children
-   two different containers registered with the same token create independent instances even if you mark this token as singleton
-   if you register some dependency container twice it is considered as two independent containers and they create independent instances even if you mark them as singleton
-   each call of the `resolve` method has its own set of singletons. During each call all singletons receive new instances
-   if you use the `factory` function to create several instances then each call of the factory reinitializes singletons of all children containers of the factory. If you need some dependency to be a singleton inside all instances created by the factory you should register this dependency and mark it as singleton via the container of the factory or via some parent container

## Dynamic imports

You can use the `awaited` function when you need load some code dynamically.
`awaited` creates a container for an async function which returns the value of passed to `awaiter` container.

```typescript
// ./largeModule.ts
import { Class } from 'factory-di';

export class LargeModule {
	/** ...a lot of code...  */
}

// declare container as usually
export const LargeModuleContainer = Class(LargeModule);

// ./app.ts
import { awaited, Class } from 'factory-di';
import type { LargeModule } from './largeModule';

class App {
	largeModule: LargeModule | null = null;

	// declare a function which loads our dynamic dependency
	constructor(public loadLargeModule: () => Promise<LargeModule>) {}

	async loadModule() {
		// load dynamic dependency and use it
		this.largeModule = await this.loadLargeModule();
	}
}

const app = Class(App, 'largeModule')
	.register(
		'largeModule',
		// pass to awaited an async function which returns the dependency container
		awaited(
			async () => (await import('./largeModule')).LargeModuleContainer
		)
	)
	.resolve();

await app.loadModule();
```
