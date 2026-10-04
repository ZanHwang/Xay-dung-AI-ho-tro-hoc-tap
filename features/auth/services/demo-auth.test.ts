import assert from "node:assert/strict";
import { test } from "node:test";
import { createDemoAuth, DEMO_SESSION_KEY, DEMO_USERS_KEY } from "./demo-auth";

function memoryStorage() {
  const data = new Map<string, string>();
  return { data, getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => { data.set(key, value); }, removeItem: (key: string) => { data.delete(key); } };
}
const input = { password: "JarvisTest123!", name: "Nguyễn An", email: "an@example.com", major: "Học máy", goal: "Ôn tập hàng tuần" };

test("guest access needs no profile and survives refresh until logout", async () => {
  const local = memoryStorage(), session = memoryStorage();
  local.setItem("jarvis.subjects", "learning-data");
  const auth = createDemoAuth(() => local, () => session);
  const guest = await auth.loginAsGuest();
  assert.equal(guest.isGuest, true);
  assert.equal(guest.name, "Khách");
  assert.equal(local.getItem(DEMO_USERS_KEY), null);
  const refreshed = createDemoAuth(() => local, () => session);
  assert.deepEqual(await refreshed.current(), guest);
  await refreshed.logout();
  assert.equal(await auth.current(), null);
  assert.equal(local.getItem("jarvis.subjects"), "learning-data");
});

test("guest and registered sessions can replace each other without changing profiles", async () => {
  const local = memoryStorage(), session = memoryStorage();
  const auth = createDemoAuth(() => local, () => session);
  const user = await auth.register(input);
  const profiles = local.getItem(DEMO_USERS_KEY);
  await auth.loginAsGuest();
  await auth.login(input.email, input.password);
  assert.deepEqual(await auth.current(), user);
  await auth.loginAsGuest();
  assert.equal((await auth.current())?.isGuest, true);
  assert.equal(local.getItem(DEMO_USERS_KEY), profiles);
});

test("guest works without local profile storage but propagates blocked session storage", async () => {
  const session = memoryStorage();
  const auth = createDemoAuth(() => { throw new Error("No profiles"); }, () => session);
  await auth.loginAsGuest();
  assert.equal((await auth.current())?.isGuest, true);
  const blocked = createDemoAuth(() => memoryStorage(), () => { throw new Error("Blocked"); });
  await assert.rejects(() => blocked.loginAsGuest(), /Blocked/);
});

test("registration persists salted credentials without plaintext passwords and requires an explicit login", async () => {
  const local = memoryStorage(), session = memoryStorage();
  const auth = createDemoAuth(() => local, () => session);
  const registration = { ...input, email: " AN@example.com ", password: "never-store-this", confirm: "never-store-this" };
  const user = await auth.register(registration);
  assert.equal(user.email, "an@example.com");
  assert.equal(await auth.current(), null);
  assert.ok(!local.getItem(DEMO_USERS_KEY)?.includes("never-store-this"));
  const signedIn = await auth.login("AN@EXAMPLE.COM", registration.password);
  assert.equal(signedIn.id, user.id);
  assert.equal(session.getItem(DEMO_SESSION_KEY), user.id);
  assert.deepEqual(await auth.current(), user);
});

test("rejects duplicate emails and unregistered demo logins", async () => {
  const local = memoryStorage(), session = memoryStorage();
  const auth = createDemoAuth(() => local, () => session);
  await auth.register(input);
  await assert.rejects(() => auth.register({ ...input, email: "AN@example.com" }), /đã có tài khoản/);
  await assert.rejects(() => auth.login("other@example.com", input.password), /Chưa có tài khoản/);
  assert.equal(await auth.current(), null);
});

test("refresh retains the tab session; logout removes the session but keeps learning data", async () => {
  const local = memoryStorage(), session = memoryStorage();
  const auth = createDemoAuth(() => local, () => session);
  local.setItem("jarvis.subjects", "unchanged");
  await auth.register(input); await auth.login(input.email, input.password);
  const refreshed = createDemoAuth(() => local, () => session);
  assert.equal((await refreshed.current())?.name, input.name);
  await refreshed.logout();
  assert.equal(await auth.current(), null);
  assert.equal(local.getItem("jarvis.subjects"), "unchanged");
  assert.ok(local.getItem(DEMO_USERS_KEY));
  await refreshed.login(input.email, input.password);
  const separateTab = createDemoAuth(() => local, () => memoryStorage());
  assert.equal(await separateTab.current(), null);
});

test("invalid sessions cannot select missing profiles and corrupt storage is not overwritten", async () => {
  const local = memoryStorage(), session = memoryStorage();
  const auth = createDemoAuth(() => local, () => session);
  session.setItem(DEMO_SESSION_KEY, "missing-id");
  assert.equal(await auth.current(), null);
  local.setItem(DEMO_USERS_KEY, "null");
  await assert.rejects(() => auth.register(input));
  assert.equal(local.getItem(DEMO_USERS_KEY), "null");
});

test("storage errors propagate and do not report a successful login", async () => {
  const local = memoryStorage();
  const auth = createDemoAuth(() => local, () => { throw new Error("Blocked"); });
  await auth.register(input);
  await assert.rejects(() => auth.login(input.email, input.password), /Blocked/);
});


test("wrong or empty passwords cannot open a session", async () => {
  const local = memoryStorage(), session = memoryStorage();
  const auth = createDemoAuth(() => local, () => session);
  await auth.register(input);
  for (const password of ["wrong-password", "", input.password.toLowerCase()]) {
    await assert.rejects(() => auth.login(input.email, password), /Mật khẩu không đúng/);
    assert.equal(session.getItem(DEMO_SESSION_KEY), null);
  }
  assert.equal((await auth.login(input.email, input.password)).email, input.email);
});

test("invalid registration does not write an account", async () => {
  const local = memoryStorage(), session = memoryStorage();
  const auth = createDemoAuth(() => local, () => session);
  for (const changes of [{ password: "short" }, { email: "invalid" }, { name: " " }]) {
    await assert.rejects(() => auth.register({ ...input, ...changes }));
    assert.equal(local.getItem(DEMO_USERS_KEY), null);
  }
});

test("each account has its own salt and credentials are not exposed in profiles", async () => {
  const local = memoryStorage(), session = memoryStorage();
  const auth = createDemoAuth(() => local, () => session);
  const user = await auth.register(input);
  await auth.register({ ...input, email: "second@example.com" });
  const accounts = JSON.parse(local.getItem(DEMO_USERS_KEY)!);
  assert.notEqual(accounts[0].credentials.salt, accounts[1].credentials.salt);
  assert.notEqual(accounts[0].credentials.hash, accounts[1].credentials.hash);
  assert.equal("credentials" in user, false);
  assert.equal("password" in user, false);
  assert.equal("credentials" in await auth.login(input.email, input.password), false);
  assert.equal("credentials" in (await auth.current())!, false);
});

test("legacy profiles require password setup without deleting existing data", async () => {
  const local = memoryStorage(), session = memoryStorage();
  const auth = createDemoAuth(() => local, () => session);
  const { password, ...profile } = input;
  local.setItem(DEMO_USERS_KEY, JSON.stringify([{ ...profile, id: "legacy-id" }]));
  local.setItem("jarvis.subjects", "existing-data");
  session.setItem(DEMO_SESSION_KEY, "legacy-id");
  assert.equal(await auth.current(), null);
  await assert.rejects(() => auth.login(input.email, password), /đăng ký lại/);
  const user = await auth.register(input);
  assert.equal(user.id, "legacy-id");
  assert.equal((await auth.login(input.email, password)).id, "legacy-id");
  assert.equal(local.getItem("jarvis.subjects"), "existing-data");
});

test("concurrent registrations keep both users and reject duplicate accounts", async () => {
  const local = memoryStorage(), session = memoryStorage();
  const auth = createDemoAuth(() => local, () => session);
  await Promise.all([auth.register(input), auth.register({ ...input, email: "second@example.com" })]);
  assert.equal(JSON.parse(local.getItem(DEMO_USERS_KEY)!).length, 2);
  const results = await Promise.allSettled([
    auth.register({ ...input, email: "third@example.com" }),
    auth.register({ ...input, email: "THIRD@example.com" }),
  ]);
  assert.equal(results.filter((result) => result.status === "fulfilled").length, 1);
  assert.equal(JSON.parse(local.getItem(DEMO_USERS_KEY)!).length, 3);
});

test("failed persistence does not claim registration succeeded", async () => {
  const session = memoryStorage();
  const auth = createDemoAuth(() => ({ getItem: () => null, setItem: () => { throw new Error("Quota"); }, removeItem: () => {} }), () => session);
  await assert.rejects(() => auth.register(input), /Quota/);
  assert.equal(await auth.current(), null);
});
