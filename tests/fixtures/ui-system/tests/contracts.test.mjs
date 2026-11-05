import { test } from 'node:test';
import assert from 'node:assert/strict';
import { priceLabel } from '../public/generated/format.js';
test('shared formatter preserves integer cents', () => assert.equal(priceLabel({ title: 'Sample', unitCents: 125 }), 'Sample: 1.25 USD'));
