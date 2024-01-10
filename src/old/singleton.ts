import { ContainerData, Dependencies, Key } from './containerData';
import { createContainer } from './createContainer';
import { InnerStorageKey } from './innerStorage';
import { factory } from './factory';

const SingletonStorages = new WeakMap<object, Map<object, any>>();

function getSingletons(containerKey: object) {
	if (!SingletonStorages.has(containerKey)) {
		SingletonStorages.set(containerKey, new Map());
	}
	return SingletonStorages.get(containerKey);
}

export const SingletonManagerKey: unique symbol =
	typeof Symbol === 'function'
		? Symbol('SingletonManager')
		: ('__singletonManagerKey__' as any);

export type SingletonManager = {
	clear(): void;
};

const singletonManagerContainer = factory(
	(resolve): SingletonManager => {
		return {
			clear: () => {
				getSingletons(resolve(InnerStorageKey))!.clear();
			},
		};
	}
);

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
			const singletons = getSingletons(resolve(InnerStorageKey));
			if (!singletons!.has(singletonKey)) {
				singletons!.set(singletonKey, container.getValue(resolve));
			}

			return singletons!.get(singletonKey);
		},
		registeredDeps: container.registeredDeps,
	}).register(SingletonManagerKey, singletonManagerContainer) as any;
}
