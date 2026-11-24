/* eslint-disable no-await-in-loop -- Keep HTTP assertions ordered while exercising shared mocked services. */
const assert = require("node:assert/strict");
const { once } = require("node:events");
const { after, afterEach, before, beforeEach, mock, test } = require("node:test");

const express = require("express");

const firebase = require("../dist/util/firebaseAdmin");
const User = require("../dist/models/user").default;
const Activity = require("../dist/models/activity").default;
const Email = require("../dist/models/email").default;
const activityRoutes = require("../dist/routes/activity").default;
const emailRoutes = require("../dist/routes/email").default;

const publishedId = "507f1f77bcf86cd799439011";
const draftId = "507f1f77bcf86cd799439012";
const archivedId = "507f1f77bcf86cd799439013";
const activities = [
  { _id: publishedId, title: "Public activity", status: "Published" },
  { _id: draftId, title: "Private draft", status: "Draft" },
  { _id: archivedId, title: "Archived activity", status: "Archived" },
];
let server;
let baseUrl;

// Exercise the real routes and middleware over HTTP, with only external services mocked.
before(async () => {
  const app = express();
  app.use(express.json());
  app.use("/api/activities", activityRoutes);
  app.use("/api/emails", emailRoutes);
  app.use((error, _req, res, _next) => res.status(500).json({ error: error.message }));
  server = app.listen(0, "127.0.0.1");
  await once(server, "listening");
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(
  () =>
    new Promise((resolve) => {
      server.close(resolve);
    }),
);
afterEach(() => mock.restoreAll());

beforeEach(() => {
  mock.method(firebase, "verifyFirebaseIdToken", async (token) => {
    if (!["admin", "super_admin", "inactive", "unregistered"].includes(token)) {
      throw new Error("Invalid token");
    }
    return { userId: token, email: `${token}@example.com`, role: "super_admin" };
  });
  mock.method(User, "findOne", async ({ email }) => {
    if (email === "unregistered@example.com") return null;
    return {
      _id: email,
      role: email === "super_admin@example.com" ? "super_admin" : "admin",
      isActive: email !== "inactive@example.com",
    };
  });
  mock.method(Activity, "find", (filter) => ({
    sort: () => ({
      skip: () => ({
        limit: async () => activities.filter((a) => !filter.status || a.status === filter.status),
      }),
    }),
  }));
  mock.method(
    Activity,
    "countDocuments",
    async (filter = {}) =>
      activities.filter((a) => !filter.status || a.status === filter.status).length,
  );
  mock.method(Activity, "findById", async (id) => activities.find((a) => a._id === id));
  mock.method(Activity, "aggregate", async () => []);
  mock.method(Email, "find", () => ({ sort: async () => [{ email: "subscriber@example.com" }] }));
  mock.method(Email, "countDocuments", async () => 1);
});

async function request(path, { token, method = "GET", body } = {}) {
  return fetch(`${baseUrl}${path}`, {
    method,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
}

test("anonymous mobile requests only list published activities, even with a private status filter", async () => {
  for (const query of ["", "?status=Published", "?status=Draft", "?status=Archived"]) {
    const response = await request(`/api/activities${query}`);
    assert.equal(response.status, 200);
    const data = await response.json();
    assert.deepEqual(
      data.activities.map((a) => a._id),
      [publishedId],
    );
    assert.equal(data.total, 1);
  }
});

test("anonymous mobile requests can open published details but cannot open drafts or archives", async () => {
  assert.equal((await request(`/api/activities/${publishedId}`)).status, 200);
  assert.equal((await request(`/api/activities/${draftId}`)).status, 404);
  assert.equal((await request(`/api/activities/${archivedId}`)).status, 404);
});

test("all admin operations reject anonymous requests before touching their handlers", async () => {
  const operations = [
    ["GET", "/api/activities/stats"],
    ["POST", "/api/activities"],
    ["PUT", `/api/activities/${publishedId}`],
    ["PATCH", `/api/activities/${publishedId}/status`],
    ["DELETE", `/api/activities/${publishedId}`],
    ["POST", `/api/activities/${publishedId}/media`],
    ["GET", "/api/emails"],
    ["GET", "/api/emails/all"],
  ];
  for (const [method, path] of operations) {
    assert.equal((await request(path, { method })).status, 401, `${method} ${path}`);
  }
});

test("active admins retain access to drafts, statistics, and the mailing list", async () => {
  for (const token of ["admin", "super_admin"]) {
    const response = await request("/api/activities?status=Draft", { token });
    assert.equal(response.status, 200);
    assert.deepEqual(
      (await response.json()).activities.map((a) => a._id),
      [draftId],
    );
    assert.equal((await request(`/api/activities/${draftId}`, { token })).status, 200);
    assert.equal((await request("/api/activities/stats", { token })).status, 200);
    const emails = await request("/api/emails/all", { token });
    assert.equal(emails.status, 200);
    assert.equal((await emails.json()).emails[0].email, "subscriber@example.com");
  }
});

test("an authenticated admin can delete an activity", async () => {
  const remove = mock.method(Activity, "findByIdAndDelete", async () => activities[0]);
  const response = await request(`/api/activities/${publishedId}`, {
    method: "DELETE",
    token: "admin",
  });
  assert.equal(response.status, 204);
  assert.deepEqual(remove.mock.calls[0].arguments, [publishedId]);
});

test("inactive or unregistered Firebase identities cannot obtain admin access from a token claim", async () => {
  for (const token of ["inactive", "unregistered"]) {
    for (const path of ["/api/activities", `/api/activities/${draftId}`, "/api/emails/all"]) {
      assert.equal((await request(path, { token })).status, 403);
    }
    assert.equal(
      (await request(`/api/activities/${publishedId}`, { method: "DELETE", token })).status,
      403,
    );
  }
});

test("invalid credentials are rejected rather than silently treated as anonymous", async () => {
  mock.method(console, "error", () => {});
  assert.equal((await request("/api/activities", { token: "invalid" })).status, 401);
  assert.equal((await request("/api/emails/all", { token: "invalid" })).status, 401);
});

test("public signup validates input before writing to the database", async () => {
  const write = mock.method(Email, "updateOne", async () => ({}));
  for (const email of [
    undefined,
    "",
    "bad-address",
    "a@",
    "@example.com",
    { email: "a@example.com" },
    `${"a".repeat(250)}@example.com`,
  ]) {
    const response = await request("/api/emails", { method: "POST", body: { email } });
    assert.equal(response.status, 400);
  }
  assert.equal(write.mock.callCount(), 0);
});

test("public signup normalizes addresses and saves repeated signups only once", async () => {
  const subscribers = new Set();
  const write = mock.method(Email, "updateOne", async (filter, update, options) => {
    assert.deepEqual(filter, { email: "reader+news@example.com" });
    assert.deepEqual(update, { $setOnInsert: filter });
    assert.equal(options.upsert, true);
    subscribers.add(filter.email);
  });
  for (const email of [" Reader+News@Example.com ", "reader+news@example.com"]) {
    const response = await request("/api/emails", { method: "POST", body: { email } });
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { message: "You're on the list!" });
  }
  assert.equal(write.mock.callCount(), 2);
  assert.equal(subscribers.size, 1);
});

test("concurrent duplicate signup is successful without revealing subscriber details", async () => {
  mock.method(Email, "updateOne", async () => {
    throw Object.assign(new Error("Duplicate email"), { code: 11000 });
  });
  const response = await request("/api/emails", {
    method: "POST",
    body: { email: "reader@example.com" },
  });
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { message: "You're on the list!" });
});

test("a database failure does not produce a false signup success", async () => {
  mock.method(Email, "updateOne", async () => {
    throw new Error("Database unavailable");
  });
  const response = await request("/api/emails", {
    method: "POST",
    body: { email: "reader@example.com" },
  });
  assert.equal(response.status, 503);
  assert.deepEqual(await response.json(), {
    error: "Unable to sign up right now. Please try again.",
  });
});
