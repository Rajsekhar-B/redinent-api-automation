import seeds from '../data/report-seeds.json';

type JsonLike = Record<string, unknown>;

function deepClone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

export function buildSeededReportCreatePayload(): JsonLike {
  const payload = deepClone(seeds.create) as JsonLike;
  const report = payload.report as Record<string, unknown>;
  const suffix = Date.now().toString();

  report.name = `${String(report.name)}-${suffix}`;
  report.title = `${String(report.title)}-${suffix}`;

  return payload;
}

export function buildSeededReportPatchPayload(): JsonLike {
  return deepClone(seeds.patch) as JsonLike;
}

export function buildSeededReportPutPayload(): JsonLike {
  const payload = deepClone(seeds.put) as JsonLike;
  const report = payload.report as Record<string, unknown>;
  const suffix = Date.now().toString();

  report.name = `${String(report.name)}-${suffix}`;
  report.title = `${String(report.title)}-${suffix}`;

  return payload;
}
