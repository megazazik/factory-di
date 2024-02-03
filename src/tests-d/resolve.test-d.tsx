import { expectType, expectError, expectAssignable } from 'tsd';
import { computedValue, Resolve } from '..';

declare const v: any;

export function ofResolveTypeWithoutRequired() {
	expectAssignable<() => boolean>(v as Resolve<boolean, {}, never>);
	expectType<{
		(): boolean;
		(d: Partial<{}> & object): boolean;
	}>(v as Resolve<boolean, {}, never>);

	expectType<boolean>((v as Resolve<boolean, {}, never>)());

	expectType<{
		(): boolean;
		(d: { dep1?: number; dep2?: string } & object): boolean;
	}>(v as Resolve<boolean, { dep1: number; dep2: string }, never>);

	expectType<boolean>(
		(v as Resolve<boolean, { dep1: number; dep2: string }, never>)()
	);

	expectType<boolean>(
		(v as Resolve<boolean, { dep1: number; dep2: string }, never>)({})
	);

	expectType<boolean>(
		(v as Resolve<boolean, { dep1: number; dep2: string }, never>)({
			dep1: 123,
			dep2: 'sdfsf',
		})
	);
}

export function ofResolveTypeWithRequired() {
	expectType<(params: { dep1: number; dep2?: string }) => boolean>(
		v as Resolve<boolean, { dep1: number; dep2: string }, 'dep1'>
	);

	expectType<(params: { dep1?: number; dep2: string }) => boolean>(
		v as Resolve<boolean, { dep1: number; dep2: string }, 'dep2'>
	);

	expectType<(params: { dep1: number; dep2: string }) => boolean>(
		v as Resolve<boolean, { dep1: number; dep2: string }, 'dep1' | 'dep2'>
	);
}

export function ofResolveTypeErrors() {
	expectError<boolean>((v as Resolve<boolean, {}, never>)('key'));

	expectError(
		(v as Resolve<boolean, { dep1: number; dep2: string }, never>)(
			'dep2',
			'sdf'
		)
	);

	expectError(
		(v as Resolve<boolean, { dep1: number; dep2: string }, never>)(
			'unknown'
		)
	);

	expectError(
		(v as Resolve<boolean, { dep1: number; dep2: string }, never>)({
			unknown: 123,
		})
	);
}

export function ofContainerResolve() {
	expectType<Resolve<boolean, {}, never>>(computedValue(() => true).resolve);

	expectType<Resolve<boolean, { num: number; str: string }, never>>(
		computedValue((n: number, s: string) => true, 'num', 'str').register({
			num: 123,
			str: 'dgs',
		}).resolve
	);

	expectType<Resolve<boolean, { num: number; str: string }, 'str'>>(
		computedValue((n: number, s: string) => true, 'num', 'str').register(
			'num',
			123
		).resolve
	);

	expectType<Resolve<boolean, { num: number; str: string }, 'num' | 'str'>>(
		computedValue((n: number, s: string) => true, 'num', 'str').resolve
	);

	expectType<Resolve<boolean, { num: number } & { str: string }, never>>(
		computedValue((n: number) => true, 'num')
			.register(
				'num',
				computedValue((s: string) => s.length, 'str')
			)
			.register('str', 'val').resolve
	);

	expectType<Resolve<boolean, { num: number } & { str: string }, never>>(
		computedValue((n: number) => true, 'num').register(
			'num',
			computedValue((s: string) => s.length, 'str').register('str', 'val')
		).resolve
	);

	expectType<Resolve<boolean, { num: number } & { str: string }, 'str'>>(
		computedValue((n: number) => true, 'num').register(
			'num',
			computedValue((s: string) => s.length, 'str')
		).resolve
	);

	expectType<
		Resolve<
			boolean,
			{ num: number } & { str: string } & { bool: boolean },
			'bool'
		>
	>(
		computedValue((n: number) => true, 'num').register(
			'num',
			computedValue((s: string) => s.length, 'str').register(
				'str',
				computedValue((b: boolean) => 'sdd', 'bool')
			)
		).resolve
	);

	expectType<
		Resolve<
			boolean,
			{ num: number } & { str: string } & { bool: boolean },
			never
		>
	>(
		computedValue((n: number) => true, 'num')
			.register(
				'num',
				computedValue((s: string) => s.length, 'str').register(
					'str',
					computedValue((b: boolean) => 'sdd', 'bool')
				)
			)
			.register({ bool: true }).resolve
	);
}

export function ofContainerResolveManyChildren() {
	expectType<
		Resolve<
			boolean,
			{ num: number; str: string; num2: number; str2: string },
			'num2' | 'str2'
		>
	>(
		computedValue((n: number, s: string) => true, 'num', 'str').register({
			num: computedValue((n: number) => n, 'num2'),
			str: computedValue((s: string) => s, 'str2'),
		}).resolve
	);

	expectType<
		Resolve<
			boolean,
			{ num: number; str: string } & { num2: number } & { str2: string },
			never
		>
	>(
		computedValue((n: number, s: string) => true, 'num', 'str').register({
			num: computedValue((n: number) => n, 'num2').register('num2', 123),
			str: computedValue((s: string) => s, 'str2').register(
				'str2',
				'sdf'
			),
		}).resolve
	);

	expectType<
		Resolve<
			boolean,
			{ num: number; str: string } & { num2: number } & { str2: string },
			never
		>
	>(
		computedValue((n: number, s: string) => true, 'num', 'str')
			.register({
				num: computedValue((n: number) => n, 'num2'),
				str: computedValue((s: string) => s, 'str2'),
			})
			.register('num2', 123)
			.register('str2', 'sdf').resolve
	);

	expectType<
		Resolve<boolean, { num: number; str: string } & { num2: number }, never>
	>(
		computedValue((n: number, s: string) => true, 'num', 'str')
			.register({
				num: computedValue((n: number) => n, 'num2'),
				str: computedValue((s: number) => String(s), 'num2'),
			})
			.register('num2', 123).resolve
	);

	expectType<
		Resolve<
			boolean,
			{ num: number; str: string } & { num2: number },
			'num2'
		>
	>(
		computedValue((n: number, s: string) => true, 'num', 'str').register({
			num: computedValue((n: number) => n, 'num2'),
			str: computedValue((s: number) => String(s), 'num2'),
		}).resolve
	);

	expectType<
		Resolve<
			boolean,
			{ num: number; str: string } & { num2: number },
			'num2'
		>
	>(
		computedValue((n: number, s: string) => true, 'num', 'str').register({
			num: computedValue((n: number) => n, 'num2').register('num2', 123),
			str: computedValue((s: number) => String(s), 'num2'),
		}).resolve
	);

	expectType<
		Resolve<boolean, { num: number; str: string } & { num2: number }, never>
	>(
		computedValue((n: number, s: string) => true, 'num', 'str').register({
			num: computedValue((n: number) => n, 'num2').register('num2', 123),
			str: computedValue((s: number) => String(s), 'num2').register(
				'num2',
				123
			),
		}).resolve
	);

	expectType<
		Resolve<boolean, { num: number; str: string } & { p2: never }, 'p2'>
	>(
		computedValue((n: number, s: string) => true, 'num', 'str').register({
			num: computedValue((n: number) => n, 'p2'),
			str: computedValue((s: string) => s, 'p2'),
		}).resolve
	);

	expectType<
		Resolve<boolean, { num: number; str: string } & { p2: never }, 'p2'>
	>(
		computedValue((n: number, s: string) => true, 'num', 'str').register({
			num: computedValue((n: number) => n, 'p2').register('p2', 123),
			str: computedValue((s: string) => s, 'p2'),
		}).resolve
	);

	expectType<
		Resolve<
			boolean,
			{ num: number; str: string } & { p2: number } & { p2: string },
			never
		>
	>(
		computedValue((n: number, s: string) => true, 'num', 'str').register({
			num: computedValue((n: number) => n, 'p2').register('p2', 123),
			str: computedValue((s: string) => s, 'p2').register('p2', 'sdfsdf'),
		}).resolve
	);

	expectType<Resolve<boolean, { num: number } & { p2: number }, 'p2'>>(
		computedValue((n: number) => true, 'num').register({
			num: computedValue((n: number) => n, 'p2'),
		}).resolve
	);

	expectType<Resolve<boolean, { num: number }, never>>(
		computedValue((n: number) => true, 'num')
			.register({
				num: computedValue((n: number) => n, 'p2'),
			})
			.register('num', 123).resolve
	);

	expectType<
		Resolve<
			boolean,
			{ num: number } & { num2: number } & { num3: number },
			never
		>
	>(
		computedValue((n: number) => true, 'num')
			.register({
				num: computedValue((n: number) => n, 'num2').register({
					num2: computedValue((n: number) => n, 'num3'),
				}),
			})
			.register('num2', 123).resolve
	);
}
