import {
	Dependencies,
	HumanReadableType,
	Key,
	UnionToIntersection,
} from './types';

const depsKey = Symbol('deps');
const allDepsKey = Symbol('allDeps');
const registeredDepsKey = Symbol('registeredDeps');

export class Container<
	Type,
	Deps extends Dependencies,
	RegisteredDeps extends Record<Key, Container<any, any, any>>,
	AllDeps extends Dependencies = Deps &
		UnionToIntersection<
			RegisteredDeps[keyof RegisteredDeps][typeof allDepsKey]
		>
> {
	[depsKey]: Deps;
	[registeredDepsKey]: RegisteredDeps;
	[allDepsKey]: AllDeps;

	/** @todo удалить */
	_deps: Deps;
	_registeredDeps: RegisteredDeps;
	_allDeps: AllDeps;

	constructor(protected getValue: GetValue<Type, Deps>) {}

	resolve(): Type;
	resolve() {
		return null as Type;
	}

	register<NewDeps extends Partial<DepsToContainerData<AllDeps>>>(
		deps: NewDeps
	): Container<
		Type,
		Deps,
		HumanReadableType<
			Omit<RegisteredDeps, keyof NewDeps> &
				MapConstantsToContainers<NewDeps>
		>
	>;
	register<
		K extends keyof AllDeps,
		Child extends Container<AllDeps[K], any, any>
	>(
		key: K,
		child: Child
	): Container<
		Type,
		Deps,
		HumanReadableType<Omit<RegisteredDeps, K> & { [KK in K]: Child }>
	>;
	register<K extends keyof AllDeps, Value extends AllDeps[K]>(
		key: K,
		child: Value
	): Container<
		Type,
		Deps,
		HumanReadableType<
			Omit<RegisteredDeps, K> & {
				[KK in K]: Container<Value, {}, {}>;
			}
		>
	>;
	register() {
		return null as any;
	}
}

export type MapConstantsToContainers<T extends Record<Key, any>> = {
	[K in keyof T]: T[K] extends Container<any, any, any>
		? T[K]
		: Container<T[K], {}, {}>;
};

export type DepsToContainerData<Deps> = {
	[K in keyof Deps]: Container<Deps[K], any, any> | Deps[K];
};

export type GetValue<Type, Deps extends Dependencies> = (
	resolve: <K extends keyof Deps>(k: K) => Deps[K]
) => Type;

export function constant<T>(value: T) {
	return new Container<T, {}, {}>(() => value);
}
