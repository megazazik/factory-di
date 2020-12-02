import { expectType, expectError } from 'tsd';
import { ofClass, OfClass } from '..';

export function originContextObject() {
	expectType<OfClass>(ofClass);
}

export function contextStringSelectWrongField() {
	expectError(ofClass());
}
