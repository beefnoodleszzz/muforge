'use strict';
const { it } = require('node:test');
const assert = require('node:assert/strict');
const { normalizeMaterialHubToken } = require('../src/services/jimengMaterialHubService');

it('normalizeMaterialHubToken strips Bearer and zero-width chars', () => {
    const t = normalizeMaterialHubToken('Bearer sk-test\u200bkey\u200b');
    assert.equal(t, 'sk-testkey');
  });
