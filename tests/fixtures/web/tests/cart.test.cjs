const { test } = require('node:test');
const assert = require('node:assert/strict');
const { totalCents } = require('../dist/cart.js');
test('three items cost 375 cents', () => assert.equal(totalCents(125, 3), 375));
test('empty cart costs zero', () => assert.equal(totalCents(125, 0), 0));
test('negative quantity rejected', () => assert.throws(() => totalCents(125, -1)));
