import { constructorSymbol } from './innerMethods';
import {
	Container,
	DepsFromParamsList,
	HumanReadableType,
	Key,
	KeysTuple,
	NumberKeysOnly,
	getAllKeys,
} from './container';

export type OfClass = {
	<T>(c: { new (): T }): Container<T, {}, {}>;

	<Params extends object, T, const KeysMap extends DependenciesMap<Params>>(
		c: { new (args: Params): T },
		keys: KeysMap
	): KeysMap extends Key // на случай, если передали токен, который соответствует типу первого параметра
		? Container<T, { [KK in KeysMap]: Params }, {}>
		: Container<
				T,
				{
					[K in keyof Params as KeysMap[K] extends Key
						? KeysMap[K]
						: K]: Params[K];
				},
				{
					[K in keyof KeysMap as KeysMap[K] extends Container<
						any,
						any,
						any
					>
						? K
						: never]: KeysMap[K] extends Container<any, any, any>
						? KeysMap[K]
						: never;
				}
		  >;

	<Params extends [...any[]], T, Keys extends KeysTuple<Params>>(
		c: { new (...args: Params): T },
		...keys: Keys
	): Container<
		T,
		HumanReadableType<DepsFromParamsList<NumberKeysOnly<Keys>, Params>>,
		{}
	>;
};

type DependenciesMap<Params extends object> = {
	[K in keyof Params]: Key | Container<Params[K], any, any>;
};

export const Class: OfClass = (Constructor: any, ...argNames: string[]) => {
	if (typeof argNames[0] === 'object') {
		const registeredDeps = {} as any;
		Object.entries(argNames[0]).forEach(([key, value]) => {
			if (typeof value === 'object') {
				registeredDeps[key] = value;
			}
		});

		return Container[constructorSymbol](
			(resolve: any) =>
				new Constructor(
					getAllKeys(argNames[0]).reduce((prev, key) => {
						const value = (argNames[0] as any)[key];
						return Object.assign(prev, {
							[key]:
								resolve(typeof value === 'object' ? key : value)
									?.value ?? undefined,
						});
					}, {})
				),
			registeredDeps
		);
	}

	return Container[constructorSymbol](
		(resolve) =>
			new Constructor(
				...argNames.map((k) => resolve(k)?.value ?? undefined)
			),
		{}
	);
};
