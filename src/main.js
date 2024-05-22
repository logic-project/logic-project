import foo, {Foo} from './foo.js';

export function main() {
    console.log(foo);
    Foo();
}

export function bar() {
    console.log('bar');
}


export class Main {
    constructor() {
        console.log('Main');
    }
}