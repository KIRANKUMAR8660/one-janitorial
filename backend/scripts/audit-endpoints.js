/**
 * Automated endpoint audit — validates route registration and basic HTTP responses.
 * Run: node scripts/audit-endpoints.js
 */
import 'dotenv/config';

const BASE = process.env.AUDIT_BASE_URL || 'http://localhost:5000';
const results = { working: [], warning: [], broken: [] };

const routes = [
  { method: 'GET', path: '/health', auth: false, expect: [200] },
  { method: 'POST', path: '/api/auth/login', auth: false, body: { email: 'admin@onejanitorial.com', password: 'Password123' }, expect: [200] },
  { method: 'GET', path: '/api/employees', auth: true, expect: [200] },
  { method: 'GET', path: '/api/tasks', auth: true, expect: [200] },
  { method: 'GET', path: '/api/channels', auth: true, expect: [200] },
  { method: 'GET', path: '/api/meetings', auth: true, expect: [200] },
  { method: 'GET', path: '/api/crm/deals', auth: true, expect: [200] },
  { method: 'GET', path: '/api/crm/leads', auth: true, expect: [200] },
  { method: 'GET', path: '/api/tickets', auth: true, expect: [200] },
  { method: 'GET', path: '/api/bco/projects', auth: true, expect: [200] },
  { method: 'GET', path: '/api/hr/postings', auth: true, expect: [200] },
  { method: 'GET', path: '/api/performance', auth: true, expect: [200] },
  { method: 'GET', path: '/api/ai/agents', auth: true, expect: [200] },
  { method: 'GET', path: '/api/sop/documents', auth: true, expect: [200] },
  { method: 'GET', path: '/api/dashboard/metrics', auth: true, expect: [200] },
  { method: 'GET', path: '/api/admin/audit-logs', auth: true, expect: [200] },
  { method: 'GET', path: '/api/admin/users', auth: true, expect: [200] },
  { method: 'GET', path: '/api/workflows', auth: true, expect: [200] },
  { method: 'GET', path: '/api/workflows/executions', auth: true, expect: [200] },
  { method: 'GET', path: '/api/workflows/logs', auth: true, expect: [200] },
  { method: 'POST', path: '/api/workflows/validate', auth: true, body: { nodes: [], edges: [] }, expect: [200, 400] },
  { method: 'GET', path: '/api/analytics/datasets', auth: true, expect: [200] },
  { method: 'GET', path: '/api/analytics/dashboards', auth: true, expect: [200] },
  { method: 'GET', path: '/api/analytics/business', auth: true, expect: [200] },
  { method: 'GET', path: '/api/analytics/monitoring', auth: true, expect: [200] },
  { method: 'GET', path: '/api/integrations/', auth: true, expect: [200] },
  { method: 'GET', path: '/api/integrations/secrets', auth: true, expect: [200] },
  { method: 'GET', path: '/api/integrations/audit', auth: true, expect: [200] },
  { method: 'GET', path: '/api/integrations/health', auth: true, expect: [200] },
  { method: 'GET', path: '/api/advanced/quality/metrics', auth: true, expect: [200] },
  { method: 'GET', path: '/api/advanced/sync/status', auth: true, expect: [200] },
  { method: 'GET', path: '/api/advanced/coaching/reports', auth: true, expect: [200] },
  { method: 'GET', path: '/api/advanced/process/discovery', auth: true, expect: [200] },
  { method: 'GET', path: '/api/advanced/marketplace/agents', auth: true, expect: [200] },
  { method: 'GET', path: '/api/advanced/prompts', auth: true, expect: [200] },
  { method: 'GET', path: '/api/advanced/costs', auth: true, expect: [200] },
  { method: 'GET', path: '/api/advanced/supabase/console', auth: true, expect: [200] },
  { method: 'GET', path: '/api/advanced/chatbot/feedback', auth: true, expect: [200] },
  { method: 'GET', path: '/api/advanced/audit/logs', auth: true, expect: [200] },
  { method: 'GET', path: '/api/advanced/self-healing/status', auth: true, expect: [200] },
  { method: 'GET', path: '/api/advanced/operations/monitoring', auth: true, expect: [200] },
];

async function getToken() {
  const res = await fetch(`${BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@onejanitorial.com', password: 'Password123' }),
  });
  if (!res.ok) throw new Error(`Login failed: ${res.status}`);
  const data = await res.json();
  return data.accessToken;
}

async function testRoute(route, token) {
  const headers = { 'Content-Type': 'application/json' };
  if (route.auth && token) headers.Authorization = `Bearer ${token}`;

  const opts = { method: route.method, headers };
  if (route.body) opts.body = JSON.stringify(route.body);

  const start = Date.now();
  try {
    const res = await fetch(`${BASE}${route.path}`, opts);
    const latency = Date.now() - start;
    const text = await res.text();
    let parsed;
    try { parsed = JSON.parse(text); } catch { parsed = text.slice(0, 120); }

    const entry = {
      route: `${route.method} ${route.path}`,
      status: res.status,
      latency,
      sample: typeof parsed === 'object' ? (parsed.message || parsed.error || 'OK') : parsed,
    };

    if (route.expect.includes(res.status)) {
      results.working.push(entry);
    } else if (res.status === 401 || res.status === 403) {
      results.warning.push({ ...entry, note: 'Auth/permission issue' });
    } else if (res.status >= 500) {
      results.broken.push({ ...entry, note: 'Server error' });
    } else {
      results.warning.push({ ...entry, note: `Unexpected status ${res.status}` });
    }
  } catch (err) {
    results.broken.push({
      route: `${route.method} ${route.path}`,
      status: 'ERR',
      note: err.message,
    });
  }
}

async function main() {
  console.log(`\n=== Endpoint Audit: ${BASE} ===\n`);
  let token = null;
  try {
    token = await getToken();
    console.log('Authenticated as admin@onejanitorial.com\n');
  } catch (err) {
    console.error('Cannot authenticate:', err.message);
    process.exit(1);
  }

  for (const route of routes) {
    await testRoute(route, token);
  }

  console.log(`✓ Working: ${results.working.length}`);
  results.working.forEach(r => console.log(`  ${r.route} → ${r.status} (${r.latency}ms)`));

  console.log(`\n⚠ Warnings: ${results.warning.length}`);
  results.warning.forEach(r => console.log(`  ${r.route} → ${r.status} — ${r.note || r.sample}`));

  console.log(`\n✗ Broken: ${results.broken.length}`);
  results.broken.forEach(r => console.log(`  ${r.route} → ${r.status} — ${r.note || r.sample}`));

  const score = Math.round((results.working.length / routes.length) * 100);
  console.log(`\nEndpoint Health Score: ${score}% (${results.working.length}/${routes.length})`);

  if (results.broken.length > 0) process.exit(1);
}

main();
