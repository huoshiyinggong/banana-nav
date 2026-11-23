# 香蕉导航 · GitHub Pages

个人导航，公开浏览；编辑设备通过本地保存的细粒度 GitHub Token 写入 `sites.json`。

## 开启网站

仓库 Settings → Pages → Deploy from a branch → main → /(root) → Save。

访问：https://huoshiyinggong.github.io/banana-nav/

## 编辑设备

创建 fine-grained personal access token，仅选择本仓库，Repository permissions → Contents → Read and write。无需授权 Workflows、管理权限或其他仓库。

打开导航右上角的编辑配置，输入 Token。Token 只存在该设备浏览器的 localStorage，不会提交到仓库。仅浏览的设备无需 Token。不要在不可信设备上保存 Token；同源脚本可以读取 localStorage。断开编辑会清除本机 Token。

仓库及 `sites.json` 的完整提交历史公开，请勿添加密码、带访问密钥的链接、私密备忘录。导航数据只接受 http/https 地址。

保存时以 GitHub 文件 SHA 检测冲突，其他设备先提交时会拒绝覆盖。保存失败会保留本地副本，可通过编辑配置中的“导出本地导航”备份后再刷新。GitHub API 有请求限额；导航数据（含内嵌图标）限制在约 900 KB。

## 迁移边界

此版本不连接 CloudBase。不迁移私密备忘录，天气和热点显示未接入状态；农历日历与计算器在本地运行，壁纸和主题为设备本地设置。初始导航来自项目的 sites.json 快照，并非已核对的最新云数据库导出。

## 验证

`node --test tests/github-store.test.cjs`
