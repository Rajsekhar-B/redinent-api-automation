import fs from 'fs';

const input = '/Users/raj/Documents/redinent-nextgen.nosync/redinent-api-automation/docs/traceability-matrix.csv';
const output = '/Users/raj/Documents/redinent-nextgen.nosync/redinent-api-automation/docs/traceability-matrix-actionable.csv';

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

  if (cur.length > 0 || row.length > 0) {
    row.push(cur);
    rows.push(row);
  }

  return rows;
}

function esc(val) {
  const s = String(val ?? '');
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
}

function get(prefix, idNum, endpoint) {
  const n = Number(idNum);

  if (prefix === 'GEN') {
    const topics = [
      'happy-path response validation',
      'missing authentication',
      'invalid authentication token',
      'unsupported HTTP method',
      'missing content-type header',
      'invalid content-type header',
      'malformed JSON payload',
      'required field omission',
      'null and empty value handling',
      'boundary length min/max',
      'unicode and special character handling',
      'large request payload behavior',
      'invalid enum and type handling',
      'date-time format validation',
      'sql injection hardening',
      'xss payload reflection check',
      'header injection hardening',
      'query duplication conflict handling',
      'numeric overflow and negative values',
      'float precision behavior',
      'request replay handling',
      'concurrent conflicting request handling',
      'timeout and rollback behavior',
      'rate-limit and throttling behavior',
      'sensitive field masking in response',
      'correlation-id propagation',
      'error contract consistency',
      'schema backward compatibility',
      'audit log generation',
      'observability evidence completeness'
    ];
    const topic = topics[n - 1] ?? 'cross-cutting api validation';
    return {
      scenario: `Cross-cutting validation for ${topic}`,
      description: `Validate that endpoint ${endpoint} follows enterprise API standards for ${topic}.`,
      steps: `1. Call ${endpoint} with data crafted for ${topic}. 2. Capture HTTP status, response body, headers, and logs. 3. Verify behavior against API standards and error contract.` ,
      expected: `Endpoint behavior is deterministic and secure for ${topic}; response contract and status handling are compliant.`
    };
  }

  if (prefix === 'AUTH') {
    const scenarios = {
      1: ['Valid local login', 'Submit valid email/password to sign-in API and verify success response.', '1. Send POST /api/users/sign_in with valid user credentials. 2. Assert success flag and user object. 3. Capture token/session artifacts.', 'HTTP 200 with success=true and expected user metadata.'],
      2: ['Invalid password rejection', 'Verify incorrect password is rejected without disclosing sensitive details.', '1. Send POST sign-in with valid email and wrong password. 2. Validate failure response payload.', 'Authentication fails with safe error message and no privileged session.'],
      3: ['Unknown user rejection', 'Ensure unknown account cannot authenticate.', '1. Send POST sign-in with non-existent email. 2. Validate failure contract.', 'Authentication fails with non-enumerative error handling.'],
      4: ['Missing email validation', 'Validate missing email field handling.', '1. Send sign-in payload without user.email. 2. Verify error response.', 'Request is rejected with validation error, no session created.'],
      5: ['Missing password validation', 'Validate missing password field handling.', '1. Send sign-in payload without user.password. 2. Verify error response.', 'Request is rejected with validation error, no session created.'],
      6: ['Email case normalization', 'Validate login works with case variations in email.', '1. Submit same account in upper/lower case email forms. 2. Compare results.', 'Authentication behavior is case-insensitive and consistent.'],
      7: ['Whitespace trimming', 'Validate leading/trailing spaces in login input are handled safely.', '1. Send email/password with leading/trailing spaces. 2. Verify behavior.', 'Input sanitization is predictable and secure.'],
      8: ['Disabled user blocked', 'Ensure disabled users cannot authenticate.', '1. Mark user disabled. 2. Attempt login. 3. Validate denial.', 'Authentication denied for disabled account.'],
      9: ['Role claim consistency', 'Validate returned user role is accurate and not mutable by request.', '1. Login with role-specific user. 2. Compare response role with DB/system role.', 'Returned role matches authoritative role mapping.'],
      10: ['Token header auth path', 'Validate token-based header auth when authentication_token exists.', '1. Login and extract token. 2. Call protected endpoint with X-User-Email/X-User-Token.', 'Protected call succeeds only with valid header pair.'],
      11: ['Token tampering rejection', 'Ensure modified token is rejected.', '1. Alter token value. 2. Call protected endpoint.', 'Unauthorized result without data exposure.'],
      12: ['Session invalidation on logout', 'Validate logout invalidates active session/token.', '1. Login then sign out. 2. Retry protected endpoint using old token/session.', 'Post-logout access is denied.'],
      13: ['Concurrent login handling', 'Validate behavior for multi-session login from same account.', '1. Login from two clients. 2. Call protected APIs from both.', 'Session policy is enforced consistently.'],
      14: ['Brute-force guard', 'Assess lockout/rate-limiting on repeated failures.', '1. Attempt repeated invalid logins. 2. Measure response and lockout behavior.', 'Protection controls activate without service instability.'],
      15: ['Credential stuffing pattern resilience', 'Validate service response under password-spray style attempts.', '1. Attempt sequential invalid credentials on many users. 2. Monitor responses.', 'No user enumeration; security controls and monitoring behave as designed.'],
      16: ['Session fixation resistance', 'Check session identifiers rotate appropriately after auth.', '1. Capture pre-login session cookie. 2. Login. 3. Compare session identity.', 'Session fixation is prevented.'],
      17: ['Error contract consistency', 'Ensure all auth failures follow consistent schema.', '1. Trigger multiple auth failure modes. 2. Compare response contracts.', 'Failure payload shape remains consistent across auth errors.'],
      18: ['Sensitive field redaction', 'Ensure auth responses do not leak sensitive internals.', '1. Run auth success/failure paths. 2. Inspect payload and logs.', 'No password/hash/internal secret leakage.'],
      19: ['Replay of previous auth artifacts', 'Verify stale/replayed auth artifacts are denied.', '1. Reuse old token/session artifact. 2. Call protected endpoint.', 'Replay attempts are blocked as per policy.'],
      20: ['Auth audit observability', 'Validate audit trail is generated for sign-in outcomes.', '1. Trigger success and failure logins. 2. Verify audit/event records.', 'Auth events are traceable with actionable metadata.']
    };
    const s = scenarios[n] ?? scenarios[20];
    return { scenario: s[0], description: s[1], steps: s[2], expected: s[3] };
  }

  const moduleMaps = {
    OTP: '2FA/OTP web-session verification and resend behavior',
    RBAC: 'authorization and role-based access control validation',
    RPT: 'reporting endpoint functional, validation, and robustness checks',
    APIKEY: 'API-key protected report detail endpoint controls',
    DSC: 'discovery and scan-control orchestration behavior',
    DEV: 'device and asset lifecycle, import/export, and batch operations',
    USR: 'user management lifecycle and authorization controls',
    TEN: 'tenant configuration and isolation controls',
    DIA: 'diagnostics execution and status behavior',
    OEM: 'oem signature creation/import and validation flows',
    ZIP: 'zip upload/file handling security and integrity',
    EXP: 'async export generation and file status tracking',
    UPM: 'uptime/comparison dashboard data correctness',
    CON: 'contract/schema compatibility assurance',
    CHA: 'performance, resilience, and chaos behavior',
    OBS: 'auditability, traceability, and observability requirements'
  };

  const base = moduleMaps[prefix] ?? 'module-specific quality validation';
  const typeHint = n % 4 === 1 ? 'positive baseline' : n % 4 === 2 ? 'negative validation' : n % 4 === 3 ? 'edge-condition' : 'break/abuse';

  return {
    scenario: `${base} - ${typeHint} case ${prefix}-${String(n).padStart(3, '0')}`,
    description: `Validate ${base} for endpoint ${endpoint} under a ${typeHint} condition with production-like assertions.`,
    steps: `1. Prepare test data and prerequisites for ${typeHint}. 2. Invoke ${endpoint} with crafted request and correlation-id. 3. Assert status code, response schema, business rules, and side-effects/log evidence.`,
    expected: `System handles ${typeHint} correctly with deterministic response, correct authorization, and no data/security regression.`
  };
}

const raw = fs.readFileSync(input, 'utf8');
const rows = parseCsv(raw);
const header = rows[0];
const out = [
  [...header, 'Scenario', 'Description', 'Test Steps', 'Expected Result']
];

for (let i = 1; i < rows.length; i += 1) {
  const row = rows[i];
  const [module, endpoint, caseId, type, priority, status, owner, sprint] = row;
  const [prefix, num] = caseId.split('-');
  const details = get(prefix, num, endpoint);
  out.push([module, endpoint, caseId, type, priority, status, owner, sprint, details.scenario, details.description, details.steps, details.expected]);
}

const csv = out.map((r) => r.map(esc).join(',')).join('\n') + '\n';
fs.writeFileSync(output, csv, 'utf8');
console.log(`written ${out.length - 1} rows to ${output}`);
