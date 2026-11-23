const { test } = require("node:test");
const assert = require("node:assert/strict");
const vm = require("node:vm");
const fs = require("node:fs");
const source = fs.readFileSync(require("node:path").join(__dirname, "../github-store.js"), "utf8");
const data = [{ title: "主页", sites: [{ name: "中文", url: "https://example.com" }] }];
const file = (sha = "initial", value = data) => ({ sha, encoding: "base64", content: Buffer.from(JSON.stringify(value)).toString("base64") });

function setup(replies, savedToken) {
  const calls = [];
  const storage = new Map(savedToken ? [["banana-github-token-v1", savedToken]] : []);
  const context = {
    window: {}, TextEncoder, TextDecoder, Uint8Array, Date, JSON,
    atob: (value) => Buffer.from(value, "base64").toString("binary"),
    btoa: (value) => Buffer.from(value, "binary").toString("base64"),
    localStorage: { getItem: (key) => storage.get(key), setItem: (key, value) => storage.set(key, value), removeItem: (key) => storage.delete(key) },
    fetch: async (url, options) => {
      calls.push({ url, ...options });
      const reply = replies.shift();
      assert.ok(reply, "unexpected network call");
      return { ok: !reply.status, status: reply.status || 200, json: async () => reply.data };
    },
  };
  vm.runInNewContext(source, context);
  return { store: context.window.githubNavigation, calls, storage };
}

test("anonymous reads public navigation without credentials", async () => {
  const { store, calls, storage } = setup([{ data: file() }]);
  assert.equal((await store.load())[0].sites[0].name, "中文");
  assert.equal(calls[0].headers.Authorization, undefined);
  assert.equal(storage.size, 0);
});

test("editor token is stored locally, never in URL or submitted file", async () => {
  const { store, calls, storage } = setup([{ data: file() }, { data: file() }, { data: { content: { sha: "next" } } }]);
  await store.load();
  await store.connect("test-private-key");
  await store.save(data);
  assert.equal(storage.get(store.tokenKey), "test-private-key");
  assert.equal(calls[2].headers.Authorization, "Bearer test-private-key");
  assert.ok(!calls[2].url.includes("test-private-key"));
  assert.ok(!calls[2].body.includes("test-private-key"));
  assert.deepEqual(JSON.parse(Buffer.from(JSON.parse(calls[2].body).content, "base64").toString()), data);
  store.disconnect();
  assert.equal(storage.size, 0);
});

test("invalid token is not persisted", async () => {
  const { store, storage } = setup([{ status: 401 }]);
  await assert.rejects(store.connect("invalid"), /Token/);
  assert.equal(storage.size, 0);
});

test("stale device cannot silently overwrite latest revision", async () => {
  const { store, calls } = setup([{ data: file() }, { data: file() }, { status: 409 }]);
  await store.load();
  await store.connect("key");
  await assert.rejects(store.save(data), /其他设备/);
  assert.equal(store.sha, "initial");
  assert.equal(store.dirty, true);
  assert.equal(JSON.parse(calls[2].body).sha, "initial");
});

test("concurrent saves are serialized and use last acknowledged SHA", async () => {
  const { store, calls } = setup([{ data: file() }, { data: file() }, { data: { content: { sha: "second" } } }, { data: { content: { sha: "third" } } }]);
  await store.load();
  await store.connect("key");
  await Promise.all([store.save(data), store.save(data)]);
  assert.equal(JSON.parse(calls[3].body).sha, "second");
  assert.equal(store.sha, "third");
  assert.equal(store.dirty, false);
});

test("reader cannot save", async () => {
  const { store, calls } = setup([]);
  await assert.rejects(store.save(data), /尚未连接/);
  assert.equal(calls.length, 0);
});

test("malformed data or unsafe links do not replace data", async () => {
  const { store } = setup([{ data: file("bad", [{ title: "x", sites: [{ name: "x", url: "javascript:alert(1)" }] }]) }]);
  await assert.rejects(store.load(), /格式/);
  assert.equal(store.sha, null);
});

test("token from previous device session can be reused", async () => {
  const { store, calls } = setup([{ data: file() }], "saved-key");
  await store.load();
  assert.equal(calls[0].headers.Authorization, "Bearer saved-key");
});

test("connection detects remote changes before enabling editor", async () => {
  const { store, storage } = setup([{ data: file() }, { data: file("changed") }]);
  await store.load();
  await assert.rejects(store.connect("key"), /刷新页面/);
  assert.equal(storage.size, 0);
});

test("overlarge embedded icon payload is rejected before upload", async () => {
  const { store, calls } = setup([{ data: file() }, { data: file() }]);
  await store.load();
  await store.connect("key");
  await assert.rejects(store.save([{ title: "x", sites: [{ icon: "a".repeat(900001) }] }]), /1 MB/);
  assert.equal(calls.length, 2);
});
