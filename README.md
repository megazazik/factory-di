# factory-di

[![npm version](https://badge.fury.io/js/factory-di.svg)](https://badge.fury.io/js/factory-di)

## TODO Добавить описание

This library is a wrapper of the original `react-redux` library and use it inside. `react-redux-partial` has beed created for 2 reasons:

-   improve performance of an application when large amount of connected components are used
-   write connected react-components which are independent of a shape of redux store

## Performance improvement

Consider, you have a redux store of this interface:

```typescript
interface PageState {
	loginForm: LoginFormType;
	items: SomeItemsType;
}
```

And you have a few dozens of components connected to the `items` field of the store. Then each action which changes `loginForm` will cause call of all selectors of components connected to the`items`. It can be slowly.

Using `react-redux-partial` you can easy connect components to the `items` field such way the corresponding selectors are called when only the `items` fields is changed.

## Independent connected components

Using `react-redux-partial` you can create a connected to a store component which can work with a state of some interface. For example:

```typescript
interface LoginFormType {
	login: string;
	password: string;
}
```

And then you can reuse this component on any page where a redux state has the login form data in any field.

<!-- ## Simple example -->

## API

### createConnects

`createConnects` function returns a set of methods to connect component to a part of a redux store.

```typescript
import { createConnects } from 'react-redux-partial';

type LoginFormType = {
	login: string;
	password: string;
};

const { connect } = createConnects<LofinFormType>();
```

`createConnects` returns an object with fields:

-   context
-   useDispatch
-   useSelector
-   useStore
-   connect
-   Provider
-   withProvider

#### context

`createConnects` returns a new `context` object. It can be use directly or as a parameter of original `Provider` and `connect` from `react-redux`. All other methods returned by `createConnects` work only with this context.

#### useDispatch, useSelector, useStore, connect

These functions work as original `useDispatch`, `useSelector`, `useStore`, `connect` functions from `react-redux` but only with a `context` returned by the same `createConnects` call.

#### Provider

The `Provider` component adds a store to react context. To get the store from context you can use the `context` returned by `createConnects` or any of methods `useDispatch`, `useSelector`, `useStore`, `connect`.

##### Pass a store

You can use `Provider` as you usually use the `react-redux` provider.

```tsx
import { render } from 'react';
import { createConnects } from 'react-redux-partial';
import { createStore } from 'redux';
import SomeComponent from './SomeComponent';

type LoginFormType = {
	login: string;
	password: string;
};

const store = createStore(/* arguments */);

const { Provider, connect } = createConnects<LofinFormType>();

const ConnectedComponent = connect(/* arguments */)(SomeComponent);

render(
	<Provider store={store}>
		<ConnectedComponent />
	</Provider>,
	element
);
```

##### Pass a parent context

Also you can create some `ConnectedComponent` and use it with stores which contain a state of different types.

Component.tsx

```tsx
export type LoginFormType = {
	login: string;
	password: string;
};

const { Provider, connect } = createConnects<LofinFormType>();

export const ConnectedComponent = connect(/* arguments */)(SomeComponent);
export { Provider };
```

You can pass to the Provider a parent context and a field where is a state of type `LoginFormType`.

```tsx
import { render } from 'react';
import { createConnects } from 'react-redux-partial';
import { createStore } from 'redux';
import ConnectedComponent, {
	LoginFormType,
	Provider as ConnectedComponentProvider,
} from './Component';

type PageStateLoginFormType = {
	loginForm: LoginFormType;
};

const store = createStore(/* arguments */);

const { Provider, context } = createConnects<PageStateLoginFormType>();

render(
	<Provider store={store}>
		<ConnectedComponentProvider context={context} fields="loginForm">
			<ConnectedComponent />
		</ConnectedComponentProvider>
	</Provider>,
	element
);
```

Selectors which are passed to `connect` will be invoked only if the `loginForm` field is changed. This can improve a page performance.

Also you can pass a `select` props if you want to transform parent state to chils state. For example:

```tsx
import ConnectedComponent, {
	LoginFormType,
	Provider as ConnectedComponentProvider,
} from './Component';

type PageStateLoginFormType = {
	loginForm: {
		email: string;
		pass: string;
	};
	/** some other fields */
};

function selector(state: { email: string; pass: string }): LoginFormType {
	return {
		login: state.email,
		password: state.pass,
	};
}

render(
	<Provider store={store}>
		<ConnectedComponentProvider
			context={context}
			fields="loginForm"
			select={selector}
		>
			<ConnectedComponent />
		</ConnectedComponentProvider>
	</Provider>,
	element
);
```

Or you can pass an object instead of a string to `fields` prop.

```tsx
import ConnectedComponent, {
	LoginFormType,
	Provider as ConnectedComponentProvider,
} from './Component';

type PageStateLoginFormType = {
	user: {
		email: string;
		phone: string;
	};
	pass: string;
	orders: any[];
};

function selector(state: {
	user: {
		email: string;
	};
	pass: string;
}): LoginFormType {
	return {
		login: state.user.email,
		password: state.pass,
	};
}

render(
	<Provider store={store}>
		<ConnectedComponentProvider
			context={context}
			fields={{
				user: { email: true },
				pass: true,
			}}
			select={selector}
		>
			<ConnectedComponent />
		</ConnectedComponentProvider>
	</Provider>,
	element
);
```

For each prop you want to pass to a child provider you should specify `true`. Also you can use `select` prop to transform parent state.

### Use custom partial provider instead of original

I some cases you may have to use a original `react-redux` provider in a page root. If you have some components which are connected with methods returned by `createConnects`, then you should use a `Provider` component from `react-redux-partial` instead of original. It has the same behavior but turns on performance optimization.

### Override original react-redux context

If you want to use some component connected by original `connect` you can you use `OverrideStoreProvider` to connect it to a partial store. It can improve performance.

With partial root provider.

```tsx
import { createConnects, OverrideStoreProvider } from 'react-redux-partial';

const { Provider, context } = createConnects();
const store = createStore();

<Provider store={store}>
	...
	<OverrideStoreProvider context={context} fields="someField">
		<ConnectedComponent />
	</OverrideStoreProvider>
	...
</Provider>;
```

With original root provider.

```tsx
import { Provider } from 'react-redux';
import { OverrideStoreProvider } from 'react-redux-partial';

const store = createStore();

<Provider store={store}>
	...
	<OverrideStoreProvider fields="someField">
		<ConnectedComponent />
	</OverrideStoreProvider>
	...
</Provider>;
```
