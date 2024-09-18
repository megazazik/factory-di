import { Dependencies, Key, Container } from './container';
import { constructorSymbol, createValueSymbol } from './innerMethods';

export interface AwaitedContainer {
	// promise(container)
	<
		T,
		D extends Dependencies,
		RD extends Record<Key, Container<any, any, any>>
	>(
		waitContainer: () => Promise<Container<T, D, RD>>
	): Container<() => Promise<T>, D, RD>;
}

export const awaited: AwaitedContainer = (waitContainer) => {
	return Container[constructorSymbol](
		(parentResolve, singltonTokens) => async () => {
			const container = await waitContainer();
			return container[createValueSymbol](parentResolve, singltonTokens);
		},
		{}
	) as any;
};
