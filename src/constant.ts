import { Container, createContainer } from './createContainer';

export const constant = <T>(value: T) =>
	createContainer({
		registeredDeps: {},
		getValue: () => value,
	}) as Container<T, {}, {}>;
