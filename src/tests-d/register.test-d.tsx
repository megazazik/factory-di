import { expectType, expectError } from 'tsd';
import { Container } from '..';

declare const cBool: Container<boolean, {}, {}>;
declare const cNum: Container<number, { b: boolean }, {}>;
declare const cStr: Container<string, { n: number }, {}>;

export function allDeps() {
	expectType<Container<boolean, {}, {}, {}>>(cBool);

	expectType<Container<number, { b: boolean }, {}, { b: boolean }>>(cNum);

	expectType<
		Container<
			string,
			{ n: number },
			{ n: typeof cNum },
			{ n: number } & { b: boolean }
		>
	>(cStr.register('n', cNum));

	expectType<
		Container<
			string,
			{ n: number },
			{ n: typeof cNum },
			{
				n: number;
			} & {
				b: boolean;
			}
		>
	>(cStr.register({ n: cNum }));

	expectType<
		Container<
			string,
			{ n: number },
			{ n: typeof cNum; b: typeof cBool },
			{
				n: number;
			} & {
				b: boolean;
			}
		>
	>(cStr.register('n', cNum).register({ b: cBool }));

	expectType<
		Container<
			string,
			{ n: number },
			{
				b: typeof cBool;
				n: Container<number, {}, {}>;
			},
			{
				n: number;
			}
		>
	>(cStr.register({ n: cNum }).register({ b: cBool, n: 123 }));

	expectType<
		Container<
			string,
			{ n: number },
			{
				b: typeof cBool;

				n: Container<number, {}, {}>;
			},
			{
				n: number;
			}
		>
	>(
		cStr
			.register({ n: cNum })
			.register({ b: cBool })
			.register('n', 123 as number)
	);
}

declare const cBool2: Container<boolean, { str: string }, {}>;

export function ofGrandChildrenDeps() {
	expectType<
		Container<
			boolean,
			{ str: string },
			{
				str: typeof cStr;
				n: typeof cNum;
				b: Container<boolean, {}, {}>;
			},
			{
				str: string;
			} & {
				n: number;
			} & { b: boolean }
		>
	>(
		cBool2
			.register({ str: cStr })
			.register({ n: cNum })
			.register({ b: cBool })
	);

	expectType<
		Container<
			boolean,
			{ str: string },
			{
				str: typeof cStr;
				n: typeof cNum;
				b: Container<boolean, {}, {}>;
			},
			{
				str: string;
			} & {
				n: number;
			} & { b: boolean }
		>
	>(cBool2.register('str', cStr).register('n', cNum).register('b', cBool));

	expectType<
		Container<
			boolean,
			{ str: string },
			{
				str: Container<
					string,
					{ n: number },
					{
						n: Container<
							number,
							{ b: boolean },
							{ b: Container<boolean, {}, {}> }
						>;
					}
				>;
			},
			{
				str: string;
			} & {
				n: number;
			} & { b: boolean }
		>
	>(
		cBool2.register({
			str: cStr.register({ n: cNum.register({ b: cBool }) }),
		})
	);

	expectType<
		Container<
			boolean,
			{ str: string },
			{
				str: Container<string, {}, {}>;
				n: Container<number, {}, {}>;
				b: Container<boolean, {}, {}>;
			},
			{ str: string }
		>
	>(
		cBool2
			.register('str', cStr)
			.register('n', cNum)
			.register('b', cBool)
			.register('n', 123 as number)
			.register('str', '123' as string)
	);
}

export function ofResolveErrors() {
	expectError(cBool2.register({ unknown: '32' }));
	expectError(cBool2.register({ str: 32 }));
	expectError(cBool2.register({ str: cNum }));
	expectError(cBool2.register({ unknown: cStr }));

	/** @todo поправить, чтобы здесь была ошибка */
	// expectError(cBool2.register({ str: cStr, unknown: 123 }));
}
