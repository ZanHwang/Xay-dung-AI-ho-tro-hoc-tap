import { z } from "zod";

export const DEMO_USERS_KEY = "jarvis.demo.users.v1";
export const DEMO_SESSION_KEY = "jarvis.demo.session.v1";
const profileSchema = z.object({
  id: z.string().min(1), name: z.string().trim().min(2).max(80), email: z.string().email(),
  major: z.string().max(120), goal: z.string().max(300),
});
const credentialsSchema = z.object({
  salt: z.string().regex(/^[a-f0-9]{32}$/),
  hash: z.string().regex(/^[a-f0-9]{64}$/),
});
const accountSchema = profileSchema.extend({ credentials: credentialsSchema.optional() });
const passwordSchema = z.string().min(8, "Mật khẩu cần ít nhất 8 ký tự.").max(128);
export type DemoUser = z.infer<typeof profileSchema> & { isGuest?: boolean };
export type DemoRegistration = Omit<z.infer<typeof profileSchema>, "id"> & { password: string };
const GUEST_SESSION_ID = "jarvis-guest";
function guestProfile(): DemoUser {
  return { id: GUEST_SESSION_ID, name: "Khách", email: "", major: "", goal: "", isGuest: true };
}
type StorageLike = Pick<Storage, "getItem" | "setItem" | "removeItem">;

function hex(bytes: Uint8Array) {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}
async function hashPassword(password: string, salt: string) {
  if (!crypto.subtle) throw new Error("Đăng nhập thử nghiệm cần HTTPS hoặc localhost.");
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]);
  const saltBytes = Uint8Array.from(salt.match(/.{2}/g)!, (part) => parseInt(part, 16));
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt: saltBytes, iterations: 100000 }, key, 256);
  return hex(new Uint8Array(bits));
}

// Browser-only prototype; replace with server authentication for production.
export function createDemoAuth(local: () => StorageLike, session: () => StorageLike) {
  function profiles(): z.infer<typeof accountSchema>[] {
    const value = local().getItem(DEMO_USERS_KEY);
    if (!value) return [];
    const parsed = z.array(accountSchema).safeParse(JSON.parse(value));
    if (!parsed.success) throw new Error("Hồ sơ demo đã lưu không hợp lệ.");
    return parsed.data;
  }
  return {
    async loginAsGuest(): Promise<DemoUser> {
      session().setItem(DEMO_SESSION_KEY, GUEST_SESSION_ID);
      return guestProfile();
    },
    async register(input: DemoRegistration): Promise<DemoUser> {
      const email = input.email.trim().toLowerCase();
      const password = passwordSchema.parse(input.password);
      const user = profileSchema.parse({ ...input, email, id: crypto.randomUUID() });
      const salt = hex(crypto.getRandomValues(new Uint8Array(16)));
      const hash = await hashPassword(password, salt);
      // Re-read after hashing to preserve registrations made in the meantime.
      const users = profiles();
      const existing = users.find((account) => account.email === email);
      if (existing?.credentials) throw new Error("Email này đã có tài khoản thử nghiệm. Hãy chuyển sang đăng nhập.");
      if (existing) user.id = existing.id;
      const account = { ...user, credentials: { salt, hash } };
      local().setItem(DEMO_USERS_KEY, JSON.stringify(existing
        ? users.map((item) => item.id === existing.id ? account : item)
        : [...users, account]));
      return user;
    },
    async login(email: string, password: string): Promise<DemoUser> {
      const user = profiles().find((user) => user.email === email.trim().toLowerCase());
      if (!user) throw new Error("Chưa có tài khoản với email này trên trình duyệt. Hãy đăng ký trước.");
      if (!user.credentials) throw new Error("Hồ sơ demo cũ chưa có mật khẩu. Hãy đăng ký lại cùng email để thiết lập mật khẩu thử nghiệm.");
      if (typeof password !== "string" || !password || password.length > 128 ||
        await hashPassword(password, user.credentials.salt) !== user.credentials.hash) {
        throw new Error("Mật khẩu không đúng. Hãy thử lại.");
      }
      session().setItem(DEMO_SESSION_KEY, user.id);
      return profileSchema.parse(user);
    },
    async current(): Promise<DemoUser | null> {
      const id = session().getItem(DEMO_SESSION_KEY);
      if (id === GUEST_SESSION_ID) return guestProfile();
      const user = id ? profiles().find((user) => user.id === id) : null;
      return user?.credentials ? profileSchema.parse(user) : null;
    },
    async logout() { session().removeItem(DEMO_SESSION_KEY); },
  };
}

export const demoAuth = createDemoAuth(() => window.localStorage, () => window.sessionStorage);

export function authErrorMessage(error: unknown) {
  if (error instanceof DOMException) return "Trình duyệt không thể lưu dữ liệu demo. Hãy kiểm tra quyền lưu trữ hoặc dung lượng rồi thử lại.";
  if (error instanceof SyntaxError || error instanceof z.ZodError) return "Dữ liệu hồ sơ chưa hợp lệ. Hãy kiểm tra thông tin hoặc dùng một trình duyệt khác để thử bản demo.";
  return error instanceof Error ? error.message : "Không thể thực hiện thao tác. Hãy thử lại.";
}
