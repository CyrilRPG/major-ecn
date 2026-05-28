const fs = require('fs');
const path = require('path');

const data = JSON.parse(fs.readFileSync(path.join(__dirname, 'pneumo-parsed.json'), 'utf8'));

const SERIE_MAP = {
  'evcf_2009': 'f41431bd-f4ea-4da1-ace0-ab9ef4bf65d0',
  'evcf_2011': '1e2f2932-c921-4dd4-a73d-d86d21939ec3',
  'evcf_2012': 'a23cceeb-e280-44e2-93cf-82146c2b17d0',
  'evcf_2015': '76f7ca07-4d18-414f-9f10-75cd798accef',
  'evcf_2016': '83170798-cd50-414a-8f5b-1de8b1048fcf',
  'evcf_2017': '61983f7f-920b-439d-afd9-39ba5c3c4f60',
  'evcf_2019': '536faa1c-4cb7-438b-aefd-d2f63a2c2018',
  'evcp_2010': '1304271d-382a-4bd1-82c5-44bbb0e4d527',
  'evcp_2011': '85409cc5-4c70-4d00-9b9f-46f1c18d96fd',
  'evcp_2013': '577e4d51-5f8b-4fe8-bbcf-b9f37c1432e9',
  'evcp_2015': 'dede4d48-bd89-4312-8642-340a7f8c3662',
  'evcp_2017': '9e5bbca1-1cc6-41e3-8455-b94c8fb634d0',
};

function escSql(s) {
  return s.replace(/'/g, "''");
}

// Build SQL values
const allValues = [];

for (const annale of data) {
  const key = annale.type + '_' + annale.year;
  const serieId = SERIE_MAP[key];
  if (!serieId) {
    console.error('No serie for', key);
    continue;
  }

  // For EVCP, insert vignette as question 0
  if (annale.vignette) {
    allValues.push(`('${serieId}', E'${escSql(annale.vignette)}', 0)`);
  }

  for (const q of annale.questions) {
    const idx = annale.vignette ? q.order_index + 1 : q.order_index;
    allValues.push(`('${serieId}', E'${escSql(q.enonce)}', ${idx})`);
  }
}

// Generate SQL in batches of 25
const batchSize = 25;
for (let i = 0; i < allValues.length; i += batchSize) {
  const batch = allValues.slice(i, i + batchSize);
  const batchNum = Math.floor(i / batchSize);
  const sql = `INSERT INTO qcm_questions (serie_id, enonce, order_index) VALUES\n${batch.join(',\n')};`;
  const outFile = path.join(__dirname, `pneumo-batch-${batchNum}.sql`);
  fs.writeFileSync(outFile, sql, 'utf8');
  console.log(`Batch ${batchNum}: ${batch.length} rows -> ${outFile}`);
}

console.log(`\nTotal: ${allValues.length} questions in ${Math.ceil(allValues.length / batchSize)} batches`);
