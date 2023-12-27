import { Dependencies, Key } from './types';

export class Container<
	Type,
	Deps extends Dependencies,
	RegisteredDeps extends Record<Key, Container<any, any, any>>
> {
	registeredDeps: RegisteredDeps;
	private getValue: GetValue<Type, Deps>;

	resolve(): Type;
	resolve() {
		return null as Type;
	}
}

export type GetValue<Type, Deps extends Dependencies> = (
	resolve: <K extends keyof Deps>(k: K) => Deps[K]
) => Type;

export function constant<T>(value: T) {
	return new Container<T, {}, {}>();
}
