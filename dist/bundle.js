'use strict';

var foo = 'hello world!';


class Foo {
    constructor() {
        console.log('Foo');
    }
}

function main() {
    console.log(foo);
    Foo();
}

function bar() {
    console.log('bar');
}


class Main {
    constructor() {
        console.log('Main');
    }
}

exports.Main = Main;
exports.bar = bar;
exports.main = main;
