/**
 * API integration tests — run against a live server on localhost:5000
 * Usage: node --test scripts/api.test.js
 */
import { describe, it, before } from 'node:test';
import assert from 'node:assert/strict';

const BASE = process.env.AUDIT_BASE_URL || 'http://localhost:5000';
let token = null;

before(async () => {
  const res = await fetch(`${BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@onejanitorial.com', password: 'Password123' }),
  });
  assert.equal(res.status, 200);
  const data = await res.json();
  token = data.accessToken;
  assert.ok(token);
});

const authGet = (path) =>
  fetch(`${BASE}${path}`, { headers: { Authorization: `Bearer ${token}` } });

describe('Health & Auth', () => {
  it('GET /health returns OK', async () => {
    const res = await fetch(`${BASE}/health`);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.status, 'OK');
  });

  it('GET /api/tasks requires auth', async () => {
    const res = await fetch(`${BASE}/api/tasks`);
    assert.equal(res.status, 401);
  });

  it('GET /api/tasks returns data when authenticated', async () => {
    const res = await authGet('/api/tasks');
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.ok(Array.isArray(data));
  });
});

describe('Core Modules', () => {
  const endpoints = [
    '/api/employees',
    '/api/channels',
    '/api/crm/deals',
    '/api/tickets',
    '/api/workflows',
    '/api/analytics/datasets',
    '/api/integrations/health',
    '/api/advanced/self-healing/status',
  ];

  for (const path of endpoints) {
    it(`GET ${path} → 200`, async () => {
      const res = await authGet(path);
      assert.equal(res.status, 200, `Expected 200 for ${path}, got ${res.status}`);
    });
  }
});

describe('Workflow validation', () => {
  it('POST /api/workflows/validate accepts empty DAG', async () => {
    const res = await fetch(`${BASE}/api/workflows/validate`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ nodes: [], edges: [] }),
    });
    assert.equal(res.status, 200);
  });
});

describe('404 handling', () => {
  it('unknown route returns 404 JSON', async () => {
    const res = await authGet('/api/nonexistent-route-xyz');
    assert.equal(res.status, 404);
  });
});
