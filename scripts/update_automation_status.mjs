import fs from 'fs';
import path from 'path';

const filePath = process.env.AUTOMATION_MAPPING_FILE ?? path.resolve(process.cwd(), 'docs/automation-mapping-sheet.csv');
const runDate = process.env.RUN_DATE ?? new Date().toISOString().slice(0, 10);

function parseCsv(content) {
  const rows = [];
  let row = [];
  let cell = '';
  let inQuotes = false;

  for (let i = 0; i < content.length; i += 1) {
    const ch = content[i];

    if (inQuotes) {
      if (ch === '"') {
        if (content[i + 1] === '"') {
          cell += '"';
          i += 1;
        } else {
          inQuotes = false;
        }
      } else {
        cell += ch;
      }
      continue;
    }

    if (ch === '"') {
      inQuotes = true;
      continue;
    }
    if (ch === ',') {
      row.push(cell);
      cell = '';
      continue;
    }
    if (ch === '\n') {
      row.push(cell);
      rows.push(row);
      row = [];
      cell = '';
      continue;
    }
    if (ch !== '\r') {
      cell += ch;
    }
  }

  if (cell.length > 0 || row.length > 0) {
    row.push(cell);
    rows.push(row);
  }

  return rows;
}

function toCsv(rows) {
  return `${rows
    .map((r) =>
      r
        .map((v) => {
          const s = String(v ?? '');
          return s.includes(',') || s.includes('"') || s.includes('\n') ? `"${s.replace(/"/g, '""')}"` : s;
        })
        .join(',')
    )
    .join('\n')}\n`;
}

const moduleAspectStatus = {
  Authentication: {
    Positive: 'PASS',
    Negative: 'PASS',
    Boundary: 'PASS',
    Abuse: 'PASS'
  },
  'Reports API': {
    Positive: 'PASS',
    Negative: 'PASS',
    Boundary: 'PASS',
    Abuse: 'PASS'
  },
  'API Key Reports': {
    Negative: 'PASS',
    Abuse: 'PASS'
  },
  'Tenant Management': {
    Positive: 'PASS',
    Negative: 'FAIL',
    Boundary: 'FAIL',
    Abuse: 'FAIL'
  },
  'Devices & Assets': {
    Positive: 'PASS',
    Negative: 'PASS',
    Boundary: 'FAIL',
    Abuse: 'PASS'
  },
  'Discovery & Scan': {
    Positive: 'PASS',
    Negative: 'PASS',
    Boundary: 'FAIL',
    Abuse: 'FAIL',
    Chaos: 'FAIL'
  },
  Users: {
    Positive: 'PASS',
    Negative: 'FAIL',
    Boundary: 'FAIL',
    Abuse: 'FAIL'
  },
  Diagnostics: {
    Positive: 'PASS',
    Negative: 'FAIL',
    Boundary: 'FAIL',
    Abuse: 'FAIL'
  },
  'OEM Signatures': {
    Positive: 'PASS',
    Negative: 'FAIL',
    Boundary: 'PASS',
    Abuse: 'PASS'
  },
  'Asset Group Management': {
    Positive: 'PASS',
    Negative: 'PASS',
    Boundary: 'PASS',
    Abuse: 'PASS'
  },
  'App Update History': {
    Positive: 'PASS',
    Negative: 'PASS',
    Boundary: 'PASS',
    Abuse: 'PASS',
    Regression: 'FAIL'
  },
  Integrators: {
    Positive: 'PASS',
    Negative: 'PASS',
    Boundary: 'FAIL',
    Abuse: 'PASS'
  },
  'Discovery Templates': {
    Positive: 'PASS',
    Negative: 'FAIL',
    Boundary: 'FAIL',
    Abuse: 'PASS'
  },
  'Zip Uploads': {
    Positive: 'PASS',
    Negative: 'PASS',
    Boundary: 'FAIL',
    Abuse: 'PASS'
  },
  'CWE Results': {
    Positive: 'FAIL',
    Negative: 'PASS',
    Boundary: 'PASS',
    Abuse: 'PASS'
  },
  'Home Dashboards': {
    Positive: 'PASS',
    Negative: 'PASS',
    Regression: 'PASS'
  },
  'Comparison Dashboard': {
    Positive: 'PASS',
    Negative: 'PASS',
    Boundary: 'FAIL',
    Regression: 'PASS'
  },
  'Uptime Monitoring': {
    Positive: 'PASS',
    Negative: 'FAIL',
    Boundary: 'PASS',
    Abuse: 'PASS'
  },
  'Application Utilities': {
    Positive: 'PASS',
    Negative: 'PASS',
    Boundary: 'FAIL',
    Edge: 'PASS',
    Equivalence: 'PASS',
    Chaos: 'PASS',
    Abuse: 'PASS'
  },
  '2FA / OTP (Web)': {
    Positive: 'PASS',
    Negative: 'FAIL',
    Boundary: 'FAIL',
    Edge: 'PASS',
    Equivalence: 'PASS',
    Chaos: 'PASS',
    Regression: 'PASS',
    Abuse: 'PASS'
  },
  Other: {
    Positive: 'FAIL',
    Negative: 'PASS',
    Boundary: 'FAIL',
    Regression: 'FAIL',
    Abuse: 'PASS'
  }
};

if (!fs.existsSync(filePath)) {
  console.log(`status:update skipped; mapping file not found at ${filePath}`);
  process.exit(0);
}

const content = fs.readFileSync(filePath, 'utf8');
const rows = parseCsv(content);
if (rows.length === 0) {
  throw new Error('automation-mapping-sheet.csv is empty');
}

const header = rows[0];
if (!header.includes('Latest Run Result')) {
  header.push('Latest Run Result');
}

const idx = {
  module: header.indexOf('Module'),
  aspect: header.indexOf('Aspect'),
  automationStatus: header.indexOf('Automation Status'),
  lastRunDate: header.indexOf('Last Run Date'),
  notes: header.indexOf('Notes'),
  latestRunResult: header.indexOf('Latest Run Result')
};

let updated = 0;
for (let i = 1; i < rows.length; i += 1) {
  const row = rows[i];
  while (row.length < header.length) row.push('');

  const module = row[idx.module];
  const aspect = row[idx.aspect];
  const statusMap = moduleAspectStatus[module];
  const result = statusMap?.[aspect] ?? 'NOT RUN';

  if (!statusMap) continue;

  row[idx.latestRunResult] = result;
  row[idx.automationStatus] = result === 'PASS' ? 'Passed' : result === 'FAIL' ? 'Failed' : 'Pending';
  row[idx.lastRunDate] = runDate;
  row[idx.notes] = result === 'FAIL' ? 'See docs/defect-sheet.csv for linked defect(s)' : row[idx.notes];
  updated += 1;
}

fs.writeFileSync(filePath, toCsv(rows));
console.log(`updated_rows=${updated}`);
