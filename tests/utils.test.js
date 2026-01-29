const test = require('node:test');
const assert = require('node:assert/strict');
const { readFile } = require('node:fs/promises');
const path = require('node:path');

const utilsPath = path.resolve('dist/nodes/AmazonCreatorsApi/utils.js');
const { normalizeList, buildPriceSummary, parseRetryAfter } = require(utilsPath);

const fixturesDir = path.resolve('tests/fixtures');

function readJson(filename) {
  return readFile(path.join(fixturesDir, filename), 'utf8').then((data) => JSON.parse(data));
}

test('normalizeList trims and splits', () => {
  assert.deepEqual(normalizeList('a, b ,c'), ['a', 'b', 'c']);
  assert.deepEqual(normalizeList([' a ', 'b', '']), ['a', 'b']);
});

test('buildPriceSummary returns min/max/offerCount', async () => {
  const fixture = await readJson('searchItems.json');
  const listings = fixture.searchResult.items[0].offersV2.listings;
  const summary = buildPriceSummary(listings);
  assert.equal(summary.offerCount, 1);
  assert.equal(summary.lowestPrice, 49.99);
  assert.equal(summary.highestPrice, 49.99);
});

test('parseRetryAfter supports seconds and date', () => {
  assert.equal(parseRetryAfter('5'), 5000);
  const future = new Date(Date.now() + 2000).toUTCString();
  const delay = parseRetryAfter(future);
  assert.ok(delay >= 0 && delay <= 5000);
});
