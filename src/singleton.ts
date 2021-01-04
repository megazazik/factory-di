import { ContainerData, Dependencies, Key } from './containerData';
import { createContainer } from './createContainer';
import { InnerStorageKey } from './innerStorage';

export const SingletonManagerKey: unique symbol =
	typeof Symbol === 'function'
		? Symbol('SingletonManager')
		: ('__singletonManagerKey__' as any);

export type SingletonManager = {
	clear(key?: Key): void;
};

const SingletonStorages = new WeakMap<object, Map<object, any>>();

function getSingletons(containerKey: object) {
	if (!SingletonStorages.has(containerKey)) {
		SingletonStorages.set(containerKey, new Map());
	}
	return SingletonStorages.get(containerKey);
}

export function singleton<
	Type,
	Deps extends Dependencies,
	RegisteredDeps extends Record<Key, ContainerData<any, any, any>>
>(
	container: ContainerData<Type, Deps, RegisteredDeps>
): ContainerData<
	Type,
	Deps & { [SingletonManagerKey]: SingletonManager },
	RegisteredDeps & {
		[SingletonManagerKey]: ContainerData<SingletonManager, {}, {}>;
	}
> {
	const singletonKey = {};

	return createContainer({
		getValue: (resolve) => {
			const containerStorageKey = resolve(InnerStorageKey);
			const singletons = getSingletons(containerStorageKey);
			if (!singletons!.has(singletonKey)) {
				singletons!.set(singletonKey, container.getValue(resolve));
			}

			return singletons!.get(singletonKey);
		},
		registeredDeps: container.registeredDeps,
	}) as any;
}
