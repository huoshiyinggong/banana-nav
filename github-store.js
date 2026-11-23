/* The token stays in this browser. It is never stored in the repository. */
class GitHubNavigationStore {
  constructor({ repository, branch = "main", path = "sites.json" }) {
    this.repository = repository;
    this.branch = branch;
    this.path = path;
    this.tokenKey = "banana-github-token-v1";
    this.token = localStorage.getItem(this.tokenKey) || "";
    this.sha = null;
    this.queue = Promise.resolve();
    this.dirty = false;
    this.revision = 0;
  }

  async request(method = "GET", body, token = this.token) {
    const endpoint = `https://api.github.com/repos/${this.repository}/contents/${this.path}`;
    const response = await fetch(`${endpoint}${method === "GET" ? `?ref=${encodeURIComponent(this.branch)}&t=${Date.now()}` : ""}`, {
      method,
      cache: "no-store",
      headers: {
        Accept: "application/vnd.github+json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(body ? { "Content-Type": "application/json" } : {}),
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
    if (!response.ok) {
      const messages = {
        401: "Token 无效或已到期，请重新配置",
        403: "访问被拒绝：请检查 Token 的仓库权限或 API 用量限制",
        404: "无法读取仓库文件，请检查仓库名称和 Token 授权",
        409: "其他设备已更新数据，请先导出本地修改，再刷新页面",
        422: "保存被拒绝，请检查仓库写入权限和分支规则",
      };
      throw new Error(messages[response.status] || `GitHub 请求失败（${response.status}）`);
    }
    return response.json();
  }

  decode(file) {
    if (file.encoding !== "base64" || typeof file.content !== "string") {
      throw new Error("导航文件过大或格式不支持，请精简内嵌图标");
    }
    const bytes = Uint8Array.from(atob(file.content.replace(/\s/g, "")), (char) => char.charCodeAt(0));
    const data = JSON.parse(new TextDecoder().decode(bytes));
    if (!Array.isArray(data) || !data.every((section) => typeof section.title === "string" && Array.isArray(section.sites) && section.sites.every((site) => typeof site.name === "string" && /^https?:\/\//i.test(site.url)))) {
      throw new Error("导航数据格式不正确，未覆盖本地数据");
    }
    return data;
  }

  async load() {
    const file = await this.request();
    const data = this.decode(file);
    this.sha = file.sha;
    return data;
  }

  async connect(token) {
    const value = token.trim();
    if (!value) throw new Error("请输入 GitHub Token");
    const file = await this.request("GET", undefined, value);
    this.decode(file);
    // Do not silently overwrite edits made from a stale browser session.
    if (this.sha && this.sha !== file.sha) throw new Error("仓库已有新数据，请刷新页面后再启用编辑");
    this.sha = file.sha;
    this.token = value;
    localStorage.setItem(this.tokenKey, value);
  }

  disconnect() {
    this.token = "";
    localStorage.removeItem(this.tokenKey);
  }

  save(data) {
    if (!this.token || !this.sha) return Promise.reject(new Error("尚未连接 GitHub 编辑权限"));
    const snapshot = JSON.stringify(data, null, 2) + "\n";
    if (new TextEncoder().encode(snapshot).length > 900000) return Promise.reject(new Error("导航数据接近 1 MB，请减少上传图标后重试"));
    this.dirty = true;
    const revision = ++this.revision;
    const operation = this.queue.then(async () => {
      const bytes = new TextEncoder().encode(snapshot);
      let binary = "";
      for (const byte of bytes) binary += String.fromCharCode(byte);
      const result = await this.request("PUT", {
        message: "Update personal navigation",
        branch: this.branch,
        sha: this.sha,
        content: btoa(binary),
      });
      this.sha = result.content.sha;
      if (revision === this.revision) this.dirty = false;
    });
    // Keep subsequent saves serial after failure; the caller receives operation's rejection.
    this.queue = operation.catch(() => undefined);
    return operation;
  }
}

window.githubNavigation = new GitHubNavigationStore({ repository: "huoshiyinggong/banana-nav" });
