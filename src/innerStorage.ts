export const InnerStorageKey: unique symbol =
	typeof Symbol === 'function'
		? Symbol('InnerStorage')
		: ('__innerStorageKey__' as any);
