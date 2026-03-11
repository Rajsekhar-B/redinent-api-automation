import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 5,
  duration: '30s',
  thresholds: {
    http_req_failed: ['rate<0.05'],
    http_req_duration: ['p(95)<1200']
  }
};

const baseUrl = __ENV.BASE_URL || 'http://localhost:3000';
const username = __ENV.DEFAULT_USERNAME || 'qa.sdet@redinent.example.com';
const password = __ENV.DEFAULT_PASSWORD || 'replace_me';

export default function () {
  const loginRes = http.post(
    `${baseUrl}/api/users/sign_in`,
    JSON.stringify({ user: { email: username, password } }),
    {
      headers: {
        'Content-Type': 'application/json'
      }
    }
  );

  check(loginRes, {
    'login status 200': (r) => r.status === 200
  });

  const locationsRes = http.get(`${baseUrl}/api/reports/get_locations`);
  check(locationsRes, {
    'locations endpoint reachable': (r) => r.status === 200,
    'locations response under 1.2s': (r) => r.timings.duration < 1200
  });

  sleep(1);
}
