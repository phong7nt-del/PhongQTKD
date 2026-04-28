import fs from 'fs';
async function fetchCSV() {
  const url = `https://docs.google.com/spreadsheets/d/1rBDulqRygG5ss_4OgASCZ82W88CrF3GsI1Ysj6EUA2w/gviz/tq?tqx=out:csv&headers=0&sheet=CBCNV`;
  const res = await fetch(url);
  const text = await res.text();
  console.log(text.split('\n').slice(0, 10).join('\n'));
}
fetchCSV();
