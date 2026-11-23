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

此版本不连接 CloudBase。不迁移私密备忘录；农历日历与计算器在本地运行，壁纸和主题为设备本地设置。导航列表已在 2026-11-23 对齐旧站最新数据：13 个分类、239 个网站。

## 天气和热搜

`Refresh weather and hot search` 工作流约每 10 分钟运行一次；热搜每次获取，和风天气以约 30 分钟为最小请求间隔。数据文件位于 `data/`，页面直接读取主分支公开快照（因为 Actions 自带 GITHUB_TOKEN 的提交不会触发 Pages 重建）。页面每 5 分钟检查新快照，显示实际更新时间，延迟/失败时标记过期并保留最后成功结果。GitHub 定时调度不保证准时。

在 Settings → Secrets and variables → Actions 添加 Repository secret：`QWEATHER_API_KEY`。密钥不写在前端、JSON 或日志里。

可选 Repository variables：`QWEATHER_API_HOST`（默认原有专属 Host）、`QWEATHER_LOCATION`（默认 `114.04,22.69`）、`QWEATHER_CITY_NAME`（默认龙华）、`QWEATHER_PROVINCE_NAME`（默认广东省）。当前沿用原账户 WebAPI v7 城市接口；和风已将 v7 标为即将弃用，失效后需切换 v1 接口。

添加 Secret 后，在 Actions 中打开该工作流 → Run workflow，或等待下一次定时运行。天气接口收费/额度按和风账户计费。Actions 使用标准公开仓库运行器；第三方数据源可能拒绝请求或限流。若仓库 60 天无活动，GitHub 可能停用定时任务，需在 Actions 重新启用。

## 验证

`node --test tests/github-store.test.cjs`

`node --test tests/widgets.test.mjs`
