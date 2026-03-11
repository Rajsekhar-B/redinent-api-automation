import fs from 'fs';

const base = '/Users/raj/Documents/redinent-nextgen.nosync/redinent-api-automation/docs';
const src = `${base}/traceability-matrix-actionable.csv`;
const manualOut = `${base}/manual-execution-sheet.csv`;
const autoOut = `${base}/automation-mapping-sheet.csv`;

function parseCsv(text) {
  const rows = [];
  let row = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    const next = text[i + 1];
    if (inQuotes) {
      if (ch === '"' && next === '"') {
        cur += '"';
        i += 1;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        cur += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ',') {
      row.push(cur);
      cur = '';
    } else if (ch === '\n') {
      row.push(cur);
      rows.push(row);
      row = [];
      cur = '';
    } else if (ch !== '\r') {
      cur += ch;
    }
  }
  if (cur.length || row.length) {
    row.push(cur);
    rows.push(row);
  }
  return rows;
}

function esc(v) {
  const s = String(v ?? '');
  if (s.includes(',') || s.includes('"') || s.includes('\n')) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function prefix(caseId) {
  return caseId.split('-')[0];
}

function deriveMethod(endpoint) {
  const m = endpoint.match(/\b(GET|POST|PUT|PATCH|DELETE)\b/i);
  return m ? m[1].toUpperCase() : 'MIXED';
}

function inputLocation(method, endpoint) {
  if (endpoint.includes('Cross-endpoint') || endpoint === '*') return 'Body + Query + Header + Path (as applicable)';
  if (method === 'GET') return 'Query (and Path where applicable)';
  if (method === 'POST' || method === 'PUT' || method === 'PATCH') return 'Body JSON + Header (auth/correlation)';
  if (method === 'DELETE') return 'Path/Query + Header';
  return 'Depends on endpoint contract';
}

function testDataTemplate(pref, endpoint) {
  const common = 'Correlation header: x-correlation-id=<unique>; Auth from .env';
  const map = {
    GEN: `Valid + invalid partitions, boundary values, malformed payloads, injection strings. ${common}`,
    AUTH: 'Valid: c.rajsekhar@redinent.com / Redinent@2025#; Invalid password; invalid email format; missing fields.',
    OTP: 'Valid OTP, invalid OTP, expired OTP, resend flow timing windows.',
    RBAC: 'Role datasets: sa, se, disabled user, cross-tenant user/object ids.',
    RPT: 'location=Bangalore; latitude=12.9716; longitude=77.5946; device_type=camera; plus invalid/missing variants.',
    APIKEY: 'api_key=<VALID_API_KEY>; api_key=invalid-api-key; uid/cve_id/cwe_id/ip valid and invalid sets.',
    DSC: 'Valid scan targets, invalid IPs, duplicate requests, parallel control actions.',
    DEV: 'Valid device payloads, duplicate IPs, boundary strings, import CSV valid/invalid samples.',
    USR: 'Valid user create/update payloads, duplicate email set, role boundary set.',
    TEN: 'Valid tenant config set, invalid URLs, key rotation datasets.',
    DIA: 'Valid diagnostic target set, invalid target set, stop/status edge conditions.',
    OEM: 'Valid signature rows, duplicate signature rows, malformed CSV rows.',
    ZIP: 'Valid zip, corrupt zip, zip-slip payload, oversize payload.',
    EXP: 'Valid export parameters, invalid filenames, early polling before generation.',
    UPM: 'Valid date ranges, invalid ranges, empty data windows.',
    CON: 'Consumer contract request/response examples and schema variant sets.',
    CHA: 'Baseline load profile, burst/spike profile, failure injection profile.',
    OBS: 'Request/response IDs, audit event payload checks, sensitive data masking checks.'
  };
  return map[pref] ?? `Endpoint-specific valid/invalid data partitions for ${endpoint}.`;
}

function technique(type, pref) {
  const t = type.toLowerCase();
  if (t.includes('positive') && t.includes('negative') && t.includes('edge') && t.includes('break')) {
    return 'Hybrid: Equivalence Partitioning + Boundary Value Analysis + Negative + Abuse/Chaos';
  }
  if (t.includes('positive') && !t.includes('negative')) return 'Equivalence Partitioning (valid partitions)';
  if (t.includes('negative') && !t.includes('edge')) return 'Equivalence Partitioning (invalid partitions)';
  if (t.includes('edge')) return 'Boundary Value Analysis + Robustness';
  if (t.includes('break')) return 'Security Abuse/Chaos Engineering';
  if (pref === 'CHA') return 'Load/Stress/Soak/Spike + Fault Injection';
  return 'Equivalence Partitioning + Boundary Value Analysis';
}

function severity(priority) {
  if (priority.includes('P0')) return 'Critical';
  if (priority.includes('P1')) return 'High';
  return 'Medium';
}

function ownerFromModule(module, existingOwner) {
  if (existingOwner) return existingOwner;
  if (module.includes('Security') || module.includes('RBAC')) return 'QE Security';
  if (module.includes('Contract')) return 'QE Contract Team';
  if (module.includes('Performance') || module.includes('Resilience')) return 'QE Perf Team';
  return 'QE API Team';
}

function suite(pref) {
  const map = {
    GEN: 'tests/core', AUTH: 'tests/smoke + tests/security', OTP: 'tests/integration', RBAC: 'tests/security',
    RPT: 'tests/regression + tests/security', APIKEY: 'tests/security + tests/regression', DSC: 'tests/integration',
    DEV: 'tests/regression + tests/integration', USR: 'tests/regression + tests/security', TEN: 'tests/integration + tests/security',
    DIA: 'tests/integration', OEM: 'tests/integration', ZIP: 'tests/security + tests/integration', EXP: 'tests/integration',
    UPM: 'tests/regression', CON: 'tests/contracts', CHA: 'performance + resilience suite', OBS: 'tests/observability'
  };
  return map[pref] ?? 'tests/regression';
}

function tags(pref) {
  const map = {
    GEN: '@core @regression', AUTH: '@auth @smoke @security', OTP: '@2fa @integration', RBAC: '@rbac @security',
    RPT: '@reports @regression', APIKEY: '@apikey @security', DSC: '@scan @integration', DEV: '@assets @integration',
    USR: '@users @security', TEN: '@tenant @security', DIA: '@diagnostics @integration', OEM: '@signature @integration',
    ZIP: '@file @security', EXP: '@export @integration', UPM: '@dashboard @regression', CON: '@contract', CHA: '@perf @resilience', OBS: '@audit @observability'
  };
  return map[pref] ?? '@regression';
}

const rows = parseCsv(fs.readFileSync(src, 'utf8'));
const header = rows[0];
const idx = Object.fromEntries(header.map((h, i) => [h, i]));

const manualHeader = [
  'Test Case ID','Module','Category','Endpoint','Method','Where To Enter Data','Test Data','Test Design Technique',
  'Scenario','Description','Test Steps','Expected Result','Priority','Severity','Execution Status','Owner','Sprint','Defect ID','Evidence Link','Comments'
];

const autoHeader = [
  'Test Case ID','Module','Endpoint','Automation Candidate','Automation Priority','Target Suite','Tag(s)','Test Design Technique','Scenario',
  'Data Strategy','Preconditions','Reusable Components','Dependencies','CI Gate','Implementation Status','Automation Owner','Planned Sprint','Notes'
];

const manualRows = [manualHeader];
const autoRows = [autoHeader];

for (let i = 1; i < rows.length; i += 1) {
  const r = rows[i];
  const module = r[idx['Module']];
  const endpoint = r[idx['Endpoint']];
  const caseId = r[idx['Case ID']];
  const type = r[idx['Type']];
  const priority = r[idx['Priority']];
  const status = r[idx['Automation Status']];
  const owner = ownerFromModule(module, r[idx['Owner']]);
  const sprint = r[idx['Sprint']];
  const scenario = r[idx['Scenario']];
  const description = r[idx['Description']];
  const steps = r[idx['Test Steps']];
  const expected = r[idx['Expected Result']];

  const pref = prefix(caseId);
  const method = deriveMethod(endpoint);
  const dataLoc = inputLocation(method, endpoint);
  const data = testDataTemplate(pref, endpoint);
  const design = technique(type, pref);
  const sev = severity(priority);

  manualRows.push([
    caseId, module, type, endpoint, method, dataLoc, data, design,
    scenario, description, steps, expected, priority, sev, 'Not Started', owner, sprint, '', '', ''
  ]);

  autoRows.push([
    caseId, module, endpoint, 'Yes', priority, suite(pref), tags(pref), design, scenario,
    'Parameterized datasets: valid/invalid/boundary + environment-driven secrets',
    'Environment reachable; required auth/api_key configured where applicable',
    'Request helper, fixtures, clients, validators, assertions',
    'API availability, test data state, secrets, CI runner network',
    priority.includes('P0') ? 'PR Gate + Nightly' : 'Nightly',
    status, owner, sprint,
    'Map to requirement/risk IDs in annotations during implementation'
  ]);
}

fs.writeFileSync(manualOut, manualRows.map((x) => x.map(esc).join(',')).join('\n') + '\n');
fs.writeFileSync(autoOut, autoRows.map((x) => x.map(esc).join(',')).join('\n') + '\n');

console.log(`manual rows: ${manualRows.length - 1}`);
console.log(`automation rows: ${autoRows.length - 1}`);
