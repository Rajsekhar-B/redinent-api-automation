import fs from 'fs';

const routesFile = '/Users/raj/Documents/redinent-nextgen.nosync/redinent-frontend/config/routes.rb';
const outDir = '/Users/raj/Documents/redinent-nextgen.nosync/redinent-api-automation/docs';

const lines = fs.readFileSync(routesFile, 'utf8').split(/\r?\n/);

function singularize(name) {
  if (name.endsWith('ies')) return name.slice(0, -3) + 'y';
  if (name.endsWith('s')) return name.slice(0, -1);
  return name;
}

function pushUnique(arr, item, keySet) {
  const key = `${item.method} ${item.path}`;
  if (!keySet.has(key)) {
    keySet.add(key);
    arr.push(item);
  }
}

const endpoints = [];
const endpointKeys = new Set();

const stack = [{ type: 'root', namespace: '', resource: null, mode: null }];
let rootErrorCodes = [];

function currentNamespace() {
  return stack
    .filter((s) => s.type === 'namespace')
    .map((s) => s.namespace)
    .join('');
}

function currentResource() {
  for (let i = stack.length - 1; i >= 0; i -= 1) {
    if (stack[i].type === 'resource') return stack[i].resource;
  }
  return null;
}

function currentMode() {
  for (let i = stack.length - 1; i >= 0; i -= 1) {
    if (stack[i].type === 'mode') return stack[i].mode;
  }
  return null;
}

function addEndpoint(method, path, source) {
  const cleaned = path.replace(/\/+/g, '/').replace(/\/$/, '') || '/';
  pushUnique(endpoints, { method: method.toUpperCase(), path: cleaned, source }, endpointKeys);
}

function addDeviseDefaults(namespacePrefix = '', scope = 'users') {
  const base = `${namespacePrefix}/${scope}`.replace(/\/+/g, '/');
  addEndpoint('GET', `${base}/sign_in`, 'devise-default');
  addEndpoint('POST', `${base}/sign_in`, 'devise-default');
  addEndpoint('DELETE', `${base}/sign_out`, 'devise-default');
  addEndpoint('GET', `${base}/password/new`, 'devise-default');
  addEndpoint('POST', `${base}/password`, 'devise-default');
  addEndpoint('GET', `${base}/password/edit`, 'devise-default');
  addEndpoint('PATCH', `${base}/password`, 'devise-default');
  addEndpoint('PUT', `${base}/password`, 'devise-default');
}

for (let idx = 0; idx < lines.length; idx += 1) {
  const raw = lines[idx];
  const line = raw.trim();
  if (!line || line.startsWith('#')) continue;

  const rootCodesMatch = line.match(/^%w\(([^)]+)\)\.each do \|code\|/);
  if (rootCodesMatch) {
    rootErrorCodes = rootCodesMatch[1].trim().split(/\s+/);
    stack.push({ type: 'error_codes_loop' });
    continue;
  }

  if (line === 'end') {
    stack.pop();
    continue;
  }

  const namespaceMatch = line.match(/^namespace\s+:([a-zA-Z0-9_]+)\s+do$/);
  if (namespaceMatch) {
    const ns = `/${namespaceMatch[1]}`;
    stack.push({ type: 'namespace', namespace: ns });
    continue;
  }

  const deviseFor = line.match(/^devise_for\s+:([a-zA-Z0-9_]+)/);
  if (deviseFor) {
    const ns = currentNamespace();
    addDeviseDefaults(ns, deviseFor[1]);
    continue;
  }

  const resourcesDoMatch = line.match(/^resources\s+:([a-zA-Z0-9_]+)(.*)do$/);
  if (resourcesDoMatch) {
    const name = resourcesDoMatch[1];
    const options = resourcesDoMatch[2] || '';
    const ns = currentNamespace();
    const basePath = `${ns}/${name}`.replace(/\/+/g, '/');

    let excluded = [];
    const exceptMatch = options.match(/except:\s*:([a-z_]+)/);
    if (exceptMatch) excluded = [exceptMatch[1]];

    const allActions = ['index', 'new', 'create', 'show', 'edit', 'update', 'destroy'];
    const actions = allActions.filter((a) => !excluded.includes(a));

    if (actions.includes('index')) addEndpoint('GET', basePath, 'resources:index');
    if (actions.includes('new')) addEndpoint('GET', `${basePath}/new`, 'resources:new');
    if (actions.includes('create')) addEndpoint('POST', basePath, 'resources:create');
    if (actions.includes('show')) addEndpoint('GET', `${basePath}/:id`, 'resources:show');
    if (actions.includes('edit')) addEndpoint('GET', `${basePath}/:id/edit`, 'resources:edit');
    if (actions.includes('update')) {
      addEndpoint('PATCH', `${basePath}/:id`, 'resources:update');
      addEndpoint('PUT', `${basePath}/:id`, 'resources:update');
    }
    if (actions.includes('destroy')) addEndpoint('DELETE', `${basePath}/:id`, 'resources:destroy');

    stack.push({ type: 'resource', resource: { name, basePath } });
    continue;
  }

  const resourcesSingle = line.match(/^resources\s+:([a-zA-Z0-9_]+)(.*)$/);
  if (resourcesSingle && !line.endsWith('do')) {
    const name = resourcesSingle[1];
    const options = resourcesSingle[2] || '';
    const ns = currentNamespace();
    const basePath = `${ns}/${name}`.replace(/\/+/g, '/');

    let excluded = [];
    const exceptMatch = options.match(/except:\s*:([a-z_]+)/);
    if (exceptMatch) excluded = [exceptMatch[1]];

    const allActions = ['index', 'new', 'create', 'show', 'edit', 'update', 'destroy'];
    const actions = allActions.filter((a) => !excluded.includes(a));

    if (actions.includes('index')) addEndpoint('GET', basePath, 'resources:index');
    if (actions.includes('new')) addEndpoint('GET', `${basePath}/new`, 'resources:new');
    if (actions.includes('create')) addEndpoint('POST', basePath, 'resources:create');
    if (actions.includes('show')) addEndpoint('GET', `${basePath}/:id`, 'resources:show');
    if (actions.includes('edit')) addEndpoint('GET', `${basePath}/:id/edit`, 'resources:edit');
    if (actions.includes('update')) {
      addEndpoint('PATCH', `${basePath}/:id`, 'resources:update');
      addEndpoint('PUT', `${basePath}/:id`, 'resources:update');
    }
    if (actions.includes('destroy')) addEndpoint('DELETE', `${basePath}/:id`, 'resources:destroy');
    continue;
  }

  if (line === 'collection do') {
    stack.push({ type: 'mode', mode: 'collection' });
    continue;
  }

  if (line === 'member do') {
    stack.push({ type: 'mode', mode: 'member' });
    continue;
  }

  const directRoute = line.match(/^(get|post|patch|put|delete)\s+['"]([^'"]+)['"]/);
  if (directRoute) {
    const method = directRoute[1].toUpperCase();
    const pathRaw = directRoute[2];
    const ns = currentNamespace();
    const full = pathRaw.startsWith('/') ? `${ns}${pathRaw}` : `${ns}/${pathRaw}`;
    if (pathRaw === '404' || pathRaw === '422' || pathRaw === '500' || pathRaw === '503') {
      addEndpoint(method, `/${pathRaw}`, 'error-route');
    } else {
      addEndpoint(method, full, 'direct-route');
    }
    continue;
  }

  const symbolRoute = line.match(/^(get|post|patch|put|delete)\s+:([a-zA-Z0-9_]+)(.*)$/);
  if (symbolRoute) {
    const method = symbolRoute[1].toUpperCase();
    const action = symbolRoute[2];
    const opts = symbolRoute[3] || '';
    const res = currentResource();
    if (!res) continue;

    let mode = currentMode();
    if (!mode) {
      if (opts.includes('on: :member')) mode = 'member';
      if (opts.includes('on: :collection')) mode = 'collection';
    }

    if (mode === 'member') {
      addEndpoint(method, `${res.basePath}/:id/${action}`, 'resource-member');
    } else {
      addEndpoint(method, `${res.basePath}/${action}`, 'resource-collection');
    }
    continue;
  }
}

// Build business module mapping
function moduleFromPath(path) {
  if (path.startsWith('/api/sign_in') || path.startsWith('/api/sign_out') || path.startsWith('/api/users/sign_in') || path.includes('/users/sign')) return 'Authentication';
  if (path.startsWith('/api/reports')) return 'Reports API';
  if (path.startsWith('/reports/api_')) return 'API Key Reports';
  if (path.startsWith('/discoveries')) return 'Discovery & Scan';
  if (path.startsWith('/devices')) return 'Devices & Assets';
  if (path.startsWith('/users') || path === '/create_user' || path === '/update_user') return 'Users';
  if (path.startsWith('/tenants')) return 'Tenant Management';
  if (path.startsWith('/oemsignatures')) return 'OEM Signatures';
  if (path.startsWith('/diagnostics')) return 'Diagnostics';
  if (path.startsWith('/diagnostics_meta_data')) return 'Diagnostics Metadata';
  if (path.startsWith('/asset_upmon')) return 'Uptime Monitoring';
  if (path.startsWith('/comparison_dashboard') || path.startsWith('/quaterly_vulnerability_dashboard') || path.startsWith('/quarterly_details') || path.startsWith('/fetch_vuln_details') || path.startsWith('/export_quaterly_vulnerability')) return 'Comparison Dashboard';
  if (path.startsWith('/zip_uploads')) return 'Zip Uploads';
  if (path.startsWith('/update_app_histories') || path.startsWith('/update_type')) return 'App Update History';
  if (path.startsWith('/assetgroupmasters')) return 'Asset Group Management';
  if (path === '/verify_otp' || path === '/resend_otp') return '2FA / OTP (Web)';
  if (path === '/set_timezone' || path === '/delete_export_file') return 'Application Utilities';
  if (path.startsWith('/homes') || path.startsWith('/externalsurface') || path.startsWith('/threatmonitor') || path.startsWith('/global_dashboard') || path.startsWith('/asset_discovery_dashboard') || path.startsWith('/asset_monitoring') || path.startsWith('/uptime_monitoring_dashboard')) return 'Home Dashboards';
  if (path.startsWith('/integrators')) return 'Integrators';
  if (path.startsWith('/discoverytemplates')) return 'Discovery Templates';
  if (path.startsWith('/cwetestresults')) return 'CWE Results';
  if (path === '/') return 'Root';
  if (['/404', '/422', '/500', '/503'].includes(path)) return 'Error Handling';
  return 'Other';
}

function riskPriority(module, method) {
  if (module === 'Authentication' || module === 'API Key Reports' || module.includes('2FA') || module === 'Users' || module === 'Tenant Management') return 'P0';
  if (method !== 'GET' || module.includes('Discovery') || module.includes('Devices')) return 'P1';
  return 'P2';
}

function expectedStatus(method, aspect, module) {
  if (aspect === 'Positive' || aspect === 'Equivalence') {
    if (method === 'POST') return '200 or 201';
    if (method === 'DELETE') return '200 or 204';
    return '200';
  }
  if (aspect === 'Negative') {
    if (module === 'Authentication') return '200 (business failure) or 401/403';
    return '400/401/403/404 (as per contract)';
  }
  if (aspect === 'Boundary' || aspect === 'Edge') return '200 or 400 (as per field constraints)';
  if (aspect === 'Abuse') return '400/401/403/429';
  if (aspect === 'Chaos') return '200 with graceful degradation or 5xx handled with retry/error contract';
  return 'As per endpoint contract';
}

function schemaRef(path) {
  if (path.startsWith('/api/users/sign_in')) return 'docs/contracts/auth-signin.schema.json (planned)';
  if (path.startsWith('/api/reports')) return 'docs/contracts/reports.schema.json (planned)';
  if (path.startsWith('/reports/api_')) return 'docs/contracts/report-details.schema.json (planned)';
  return 'Swagger/OpenAPI reference TBD';
}

function testLevel(module, aspect) {
  if (aspect === 'Chaos' || aspect === 'Abuse') return 'Integration';
  if (module === 'Contract / Schema / Compatibility') return 'Component';
  if (module === 'Authentication' || module === 'Reports API' || module === 'API Key Reports') return 'Integration';
  return 'Component + Integration';
}

function expectedLatency(path, method, aspect) {
  if (aspect === 'Chaos') return '<= 1500';
  if (path.startsWith('/api/users/sign_in')) return '<= 300';
  if (path.startsWith('/api/reports')) return '<= 800';
  if (method === 'GET') return '<= 700';
  return '<= 1000';
}

function riskType(module, aspect) {
  if (aspect === 'Abuse') return 'Data Leakage / Unauthorized Access';
  if (aspect === 'Chaos') return 'Availability / Reliability';
  if (module === 'Authentication' || module.includes('2FA')) return 'Unauthorized Access';
  if (module.includes('Reports')) return 'Business Decision Integrity';
  if (module.includes('Tenant')) return 'Cross-Tenant Data Exposure';
  return 'Functional / User Experience';
}

function riskLevel(priority, aspect) {
  if (priority === 'P0' || aspect === 'Abuse') return 'High';
  if (priority === 'P1') return 'Medium';
  return 'Low';
}

function dependencies(module) {
  if (module.includes('Discovery') || module.includes('Devices')) return 'DB + Kafka + background jobs';
  if (module.includes('Reports')) return 'DB + analytics tables';
  if (module.includes('Authentication') || module.includes('Users')) return 'DB + session/auth middleware';
  if (module.includes('Zip')) return 'File storage + worker';
  return 'DB + app services';
}

function mockingRequired(module, aspect) {
  if (aspect === 'Chaos') return 'Yes';
  if (module.includes('Discovery') || module.includes('Zip') || module.includes('Update')) return 'Yes';
  return 'No';
}

function nuancedDataSet(module, path, method, aspect, baseData) {
  if (module === 'Authentication') {
    if (aspect === 'Positive') return `${baseData}; Body={\"user\":{\"email\":\"<VALID_EMAIL>\",\"password\":\"<VALID_PASSWORD>\"}}`;
    if (aspect === 'Negative') return `${baseData}; Body={\"user\":{\"email\":\"invalid.user@redinent.local\",\"password\":\"WrongPass@123\"}}`;
    if (aspect === 'Boundary') return `${baseData}; Body email/password boundary lengths`;
    if (aspect === 'Abuse') return `${baseData}; Burst login attempts + credential stuffing dataset`;
  }
  if (path.startsWith('/api/reports')) {
    if (aspect === 'Positive') return `${baseData}; Query=location=Bangalore&latitude=12.9716&longitude=77.5946&device_type=camera`;
    if (aspect === 'Negative') return `${baseData}; Query missing required params OR invalid datatype`;
    if (aspect === 'Boundary') return `${baseData}; Query boundary lengths + max filter combinations`;
    if (aspect === 'Abuse') return `${baseData}; Injection payloads in query params`;
  }
  if (path.startsWith('/reports/api_')) {
    if (aspect === 'Positive') return `${baseData}; Query=api_key=<VALID_API_KEY>&uid=<VALID_UID>`;
    if (aspect === 'Negative') return `${baseData}; Query=api_key=invalid-api-key&uid=<VALID_UID>`;
  }
  if (module === 'Users') {
    if (aspect === 'Positive') return `${baseData}; Body={\"user\":{\"name\":\"qa_user_01\",\"email\":\"qa.user01@redinent.local\",\"role\":\"analyst\"}}`;
    if (aspect === 'Negative') return `${baseData}; Body missing required fields or duplicate email`;
    if (aspect === 'Boundary') return `${baseData}; name length at min/max; role value boundary`;
    if (aspect === 'Abuse') return `${baseData}; privilege escalation payload (role=super_admin)`;
  }
  if (module.includes('Tenant')) {
    if (aspect === 'Positive') return `${baseData}; tenant_id=<VALID_TENANT_ID>; scoped token for tenant admin`;
    if (aspect === 'Negative') return `${baseData}; tenant_id mismatch between token and request`;
    if (aspect === 'Abuse') return `${baseData}; cross-tenant object IDs in path/query`;
  }
  if (module.includes('Devices') || module.includes('Asset')) {
    if (aspect === 'Positive') return `${baseData}; Body={\"asset_id\":\"ASSET-1001\",\"ip\":\"10.20.30.40\",\"type\":\"camera\"}`;
    if (aspect === 'Negative') return `${baseData}; invalid IP, missing asset_id, unsupported type`;
    if (aspect === 'Boundary') return `${baseData}; max tags, max name length, min intervals`;
    if (aspect === 'Abuse') return `${baseData}; duplicate asset onboarding and object-id tampering`;
  }
  if (module.includes('Discovery') || module.includes('Scan')) {
    if (aspect === 'Positive') return `${baseData}; Body={\"template_id\":101,\"schedule\":\"0 */6 * * *\",\"targets\":[\"10.0.0.0/24\"]}`;
    if (aspect === 'Negative') return `${baseData}; invalid cron expression or empty targets`;
    if (aspect === 'Boundary') return `${baseData}; max targets per scan; max schedule frequency`;
    if (aspect === 'Chaos') return `${baseData}; simulate worker timeout/retry path`;
  }
  if (module.includes('Reports')) {
    if (aspect === 'Chaos') return `${baseData}; report generation with delayed analytics dependency`;
  }
  return `${baseData}; Data set=${aspect}`;
}

function scenarioText(module, ep, aspect) {
  const endpoint = `${ep.method} ${ep.path}`;
  if (module === 'Authentication' && ep.method === 'POST' && ep.path.includes('sign_in')) return `${endpoint}: Login flow ${aspect.toLowerCase()} validation`;
  if (module === 'Authentication' && ep.method === 'DELETE' && ep.path.includes('sign_out')) return `${endpoint}: Logout/session invalidation ${aspect.toLowerCase()} validation`;
  if (module.includes('Tenant')) return `${endpoint}: Tenant isolation and scope ${aspect.toLowerCase()} validation`;
  if (module.includes('Devices') || module.includes('Asset')) return `${endpoint}: Asset lifecycle ${aspect.toLowerCase()} validation`;
  if (module.includes('Discovery') || module.includes('Scan')) return `${endpoint}: Scan orchestration ${aspect.toLowerCase()} validation`;
  if (module.includes('Reports')) return `${endpoint}: Reporting retrieval/generation ${aspect.toLowerCase()} validation`;
  if (module === 'Users') return `${endpoint}: User administration ${aspect.toLowerCase()} validation`;
  return `${endpoint}: API behavior ${aspect.toLowerCase()} validation`;
}

function descriptionText(module, ep, aspect, technique) {
  if (module === 'Authentication' && ep.path.includes('sign_in')) {
    if (aspect === 'Positive') return 'Validate successful authentication returns token/session artifacts, user context, and audit-safe response payload.';
    if (aspect === 'Negative') return 'Validate invalid credentials, missing fields, and malformed payloads are rejected without sensitive data leakage.';
    if (aspect === 'Abuse') return 'Validate brute-force and injection-like login abuse attempts are blocked and observable.';
  }
  if (module.includes('Tenant')) {
    return `Validate tenant-scoped authorization and object access controls for ${ep.method} ${ep.path} using ${technique}.`;
  }
  if (module.includes('Discovery') || module.includes('Scan')) {
    return `Validate async scan/discovery behavior for ${ep.method} ${ep.path}: request acceptance, status progression, and resilient error handling.`;
  }
  if (module.includes('Reports')) {
    return `Validate ${ep.method} ${ep.path} returns contract-compliant report data with correct filters, pagination, and export behavior where applicable.`;
  }
  if (module.includes('Devices') || module.includes('Asset')) {
    return `Validate asset onboarding/update/retrieval/deletion rules for ${ep.method} ${ep.path}, including duplicate and stale-object handling.`;
  }
  return `Validate ${ep.method} ${ep.path} for ${aspect.toLowerCase()} coverage using ${technique}, ensuring business behavior, security controls, and response contracts remain compliant.`;
}

function stepsText(module, ep, aspect) {
  const setup = `1) Prepare ${aspect.toLowerCase()} dataset for ${ep.method} ${ep.path}, including role and tenant context.`;
  const exec = '2) Execute request with x-correlation-id and required auth/api key/session.';
  const validate = '3) Assert HTTP status, response schema/contract, key business rules, and side effects (DB/job/audit if exposed).';
  const observe = '4) Capture correlation-id, logs/traces, and attach request/response evidence.';

  if (module === 'Authentication' && ep.path.includes('sign_in')) {
    return `${setup} 2) Send login request with credential variant for this case. 3) Validate token/session behavior, user object fields, and auth error contract. ${observe}`;
  }
  if (module.includes('Tenant')) {
    return `${setup} 2) Run request with same-tenant and cross-tenant identities. 3) Verify tenant data segregation and authorization decisions. ${observe}`;
  }
  if (module.includes('Discovery') || module.includes('Scan')) {
    return `${setup} 2) Trigger scan/discovery endpoint and store job/reference ID. 3) Poll status endpoint until terminal state; validate retry/timeout contract. ${observe}`;
  }
  if (module.includes('Reports')) {
    return `${setup} 2) Execute report API with defined filters/sort/pagination. 3) Verify response contract, aggregation correctness, and export trigger where applicable. ${observe}`;
  }
  return `${setup} ${exec} ${validate} ${observe}`;
}

function expectedResultText(module, ep, aspect) {
  if (module === 'Authentication' && ep.path.includes('sign_in')) {
    if (aspect === 'Positive') return 'Token/session is issued, authenticated user context is returned, and sensitive fields are excluded.';
    if (aspect === 'Negative') return 'Authentication fails with compliant error response; no token/session artifact is issued.';
    if (aspect === 'Abuse') return 'Abuse attempt is blocked/rate-limited and security-safe error contract is returned.';
  }
  if (module.includes('Tenant')) return 'Data access remains tenant-scoped; cross-tenant objects are not readable/writable and proper auth errors are returned.';
  if (module.includes('Discovery') || module.includes('Scan')) return 'Job lifecycle is consistent: accepted -> running -> terminal state, with retry/timeout behavior aligned to contract.';
  if (module.includes('Reports')) return 'Report payload is contract-compliant with accurate filters/sorting/pagination and expected aggregation fields.';
  if (module.includes('Devices') || module.includes('Asset')) return 'Asset data changes are deterministic, duplicates are controlled, and subsequent reads reflect expected state.';
  return `API handles ${aspect.toLowerCase()} scenario safely and deterministically; contract and authorization checks are compliant.`;
}

function automationDataStrategy(module, path, method, aspect, baseData) {
  const explicit = nuancedDataSet(module, path, method, aspect, baseData);
  if (method === 'GET') return `${explicit}; Query/path variants are table-driven in JSON fixtures`;
  if (method === 'DELETE') return `${explicit}; IDs include valid, stale, cross-tenant, and already-deleted records`;
  return `${explicit}; Body payloads generated via factory + invalid mutators`;
}

const aspects = [
  { name: 'Positive', technique: 'Equivalence Partitioning (valid partition)', suffix: 'valid-request happy path' },
  { name: 'Negative', technique: 'Equivalence Partitioning (invalid partition)', suffix: 'invalid/missing input handling' },
  { name: 'Edge', technique: 'Edge Case Analysis', suffix: 'uncommon but valid operating condition' },
  { name: 'Boundary', technique: 'Boundary Value Analysis', suffix: 'min/max threshold behavior' },
  { name: 'Equivalence', technique: 'Equivalence Class Partitioning', suffix: 'representative partition coverage' },
  { name: 'Abuse', technique: 'Security Abuse Case Testing', suffix: 'malicious misuse attempt' },
  { name: 'Chaos', technique: 'Chaos/Resilience Testing', suffix: 'dependency/transient failure robustness' }
];

endpoints.sort((a, b) => a.path.localeCompare(b.path) || a.method.localeCompare(b.method));

// endpoint inventory
const invHeader = ['Module', 'Method', 'Endpoint', 'Route Source'];
const invRows = [invHeader];
for (const ep of endpoints) {
  invRows.push([moduleFromPath(ep.path), ep.method, ep.path, ep.source]);
}

// manual + automation exhaustive rows
const manualHeader = [
  'Case ID','Module','Method','Endpoint','Aspect','Test Design Technique','Test Level','Scenario','Description','Where To Enter Data','Test Data','Expected HTTP Status Code','Response Schema/Contract','Test Steps','Action','Expected Result','Expected Latency (ms)','Traceability ID / Log Context','Mocking Required?','Contract Reference','Risk Level','Risk Type','Dependencies','Priority','Execution Status','Owner','Sprint','Last Run Date','Defect ID','Evidence Link','Comments'
];
const autoHeader = [
  'Case ID','Module','Method','Endpoint','Aspect','Target Suite','Tag(s)','Automation Candidate','Test Level','Scenario','Description','Test Steps','Expected HTTP Status Code','Response Schema/Contract','Expected Latency (ms)','Mocking Required?','Data Strategy','Preconditions','Reusable Components','Dependencies','CI Gate','Contract Reference','Risk Level','Risk Type','Priority','Automation Status','Automation Owner','Planned Sprint','Last Run Date','Notes'
];

const manual = [manualHeader];
const auto = [autoHeader];

let id = 1;
for (const ep of endpoints) {
  const mod = moduleFromPath(ep.path);
  const pri = riskPriority(mod, ep.method);
  const owner = mod.includes('Security') || mod.includes('2FA') || mod === 'API Key Reports' ? 'QE Security' : mod.includes('Performance') ? 'QE Perf Team' : 'QE API Team';
  const suite = mod === 'Authentication' ? 'tests/smoke + tests/security' : mod === 'Reports API' ? 'tests/regression + tests/security' : mod === 'API Key Reports' ? 'tests/security + tests/regression' : 'tests/integration + tests/regression';

  const dataLoc = ep.method === 'GET' ? 'Query/Path/Header' : ep.method === 'DELETE' ? 'Path/Query/Header' : 'Body JSON + Header (+Query if required)';
  const baseData = `Base URL=http://127.0.0.1:3000; Endpoint=${ep.path}`;

  for (const a of aspects) {
    const caseId = `API-${String(id).padStart(4, '0')}`;
    id += 1;

    const scenario = scenarioText(mod, ep, a.name);
    const description = descriptionText(mod, ep, a.name, a.technique);
    const steps = stepsText(mod, ep, a.name);
    const action = `Run ${ep.method} ${ep.path} for ${a.suffix} and record evidence.`;
    const expected = expectedResultText(mod, ep, a.name);
    const statusCode = expectedStatus(ep.method, a.name, mod);
    const contract = schemaRef(ep.path);
    const level = testLevel(mod, a.name);
    const latency = expectedLatency(ep.path, ep.method, a.name);
    const riskL = riskLevel(pri, a.name);
    const riskT = riskType(mod, a.name);
    const dep = dependencies(mod);
    const mockReq = mockingRequired(mod, a.name);
    const traceability = `corr-id required; case=${caseId}; endpoint=${ep.method} ${ep.path}`;
    const testData = nuancedDataSet(mod, ep.path, ep.method, a.name, baseData);

    manual.push([
      caseId,
      mod,
      ep.method,
      ep.path,
      a.name,
      a.technique,
      level,
      scenario,
      description,
      dataLoc,
      testData,
      statusCode,
      contract,
      steps,
      action,
      expected,
      latency,
      traceability,
      mockReq,
      contract,
      riskL,
      riskT,
      dep,
      pri,
      'Not Started',
      owner,
      pri === 'P0' ? 'Sprint-1' : pri === 'P1' ? 'Sprint-2' : 'Sprint-3',
      '',
      '',
      '',
      ''
    ]);

    auto.push([
      caseId,
      mod,
      ep.method,
      ep.path,
      a.name,
      suite,
      `@${a.name.toLowerCase()} @${mod.toLowerCase().replace(/\s+/g, '-')}`,
      'Yes',
      level,
      scenario,
      description,
      steps,
      statusCode,
      contract,
      latency,
      mockReq,
      automationDataStrategy(mod, ep.path, ep.method, a.name, baseData),
      'Environment reachable; secrets and role data configured',
      'Fixtures, request helper, clients, validators, assertions, metadata hooks',
      dep,
      pri === 'P0' ? 'PR + Nightly' : 'Nightly',
      contract,
      riskL,
      riskT,
      pri,
      'Pending',
      owner,
      pri === 'P0' ? 'Sprint-1' : pri === 'P1' ? 'Sprint-2' : 'Sprint-3',
      '',
      'Align with requirement ID and risk ID during implementation'
    ]);
  }
}

function toCsv(rows) {
  return rows
    .map((r) => r.map((v) => {
      const s = String(v ?? '');
      return s.includes(',') || s.includes('"') || s.includes('\n') ? `"${s.replace(/"/g, '""')}"` : s;
    }).join(','))
    .join('\n') + '\n';
}

fs.writeFileSync(`${outDir}/api-endpoint-inventory.csv`, toCsv(invRows));
fs.writeFileSync(`${outDir}/manual-execution-sheet.csv`, toCsv(manual));
fs.writeFileSync(`${outDir}/automation-mapping-sheet.csv`, toCsv(auto));

console.log(`endpoints=${endpoints.length}`);
console.log(`manual_cases=${manual.length - 1}`);
console.log(`automation_cases=${auto.length - 1}`);
