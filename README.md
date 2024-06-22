# 注意

>本仓库分叉于 [https://github.com/x-dr/short](https://github.com/x-dr/short) 并且已经在源代码的基础上做了修改。

>源代码使用 MIT 许可证进行授权，本经过二次修改的程序同源代码的许可证，二次分发或者修改时请保留原作者和修改作者的版权信息。

问题反馈请提交 `issues` 谢谢！

## 介绍

一个使用 Cloudflare Pages 创建的免费 URL 缩短/短链服务。

*可靠的短链示例* : [https://c1n.top/](https://c1n.top/)

<details>
  <summary>《点击这里查看图片》</summary>
  
  ![2_4](/doce/2_4.png)

  ![2_5](/doce/2_5.png)
</details>

### 利用 Cloudflare Pages 部署

1. Fork 分叉本项目 : [https://github.com/molikai-work/short](https://github.com/molikai-work/short)。

2. 登录到[Cloudflare](https://dash.cloudflare.com/)控制台。

3. 在帐户主页中，选择 [Workers 和 Pages](https://dash.cloudflare.com/?to=/:account/workers-and-pages) -> ` 创建应用程序` -> `Pages` -> `连接到 Git`。（Cloudflare 支持多种语言，推荐将语言显示设置为与本教程相同的语言）

4. 选择你创建的项目存储库，在 `设置构建和部署` 部分中，全部默认即可，不需要修改框架预设、构建命令等内容。

5. 点击 `保存并部署` ，稍等片刻，短链服务就部署好了。

<details>
  <summary>6. 点击这里查看创建数据库操作的图示</summary>

  (1) 进入 Cloudflare 的控制台，查看左侧侧边栏，选择 `Workers 和 Pages` 展开菜单后再选择 [D1](https://dash.cloudflare.com/?to=/:account/workers/d1)：
  ![4](/doce/4.png)

  (2) 在 `D1` 页面点击右上角的 `创建数据库` 以打开创建数据库菜单：
  ![4_1](/doce/4_1.png)
  
  ![4_2](/doce/4_2.png)

  (3) 填写 `数据库名称` 输入框，名称随意，确保绑定是为同一个数据库即可，下方的位置选项可不选（这里已经填好，示范）：
  ![3](/doce/4_3.png)

  (4) 完成数据库创建，接下来在数据库的操作页面，请点击 `控制台`，并查看主部署教程的下一步（第7步）：
  ![3](/doce/4_4.png)

  ![3](/doce/4_5.png)

</details>

7. 在数据库控制台输入框粘贴下面语句（或使用根目录的 `short.sql` 文件）执行 `SQLite` 的命令创建表执行即可。

```sql
DROP TABLE IF EXISTS links;
CREATE TABLE IF NOT EXISTS links (
  `id` integer PRIMARY KEY NOT NULL,
  `url` text,
  `slug` text,
  `email` text,
  `ua` text,
  `ip` text,
  `status` text,
  `hostname` text ,
  `create_time` DATE
);
DROP TABLE IF EXISTS logs;
CREATE TABLE IF NOT EXISTS logs (
  `id` integer PRIMARY KEY NOT NULL,
  `url` text ,
  `slug` text,
  `referer` text,
  `ua` text ,
  `ip` text ,
  `status` text,
  `hostname` text ,
  `create_time` DATE
);
DROP TABLE IF EXISTS banUrl;
CREATE TABLE IF NOT EXISTS banUrl (
  `id` INTEGER PRIMARY KEY NOT NULL,
  `url` TEXT,
  `create_time` TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))

);
CREATE UNIQUE INDEX links_index ON links(slug);
CREATE INDEX logs_index ON logs(slug);
CREATE UNIQUE INDEX banUrl_index ON banUrl(url);
```
8. 选择部署完成项目，前往 Cloudflare Pages 项目控制面板依次点击`设置`->`函数`->`D1 数据库绑定`->`编辑绑定`->添加变量，变量名称填写：`DB` -> D1 数据库选择 `你刚刚创建好的 D1 数据库`

<details>
  <summary>《点击这里查看绑定操作的图示》</summary>

  (1) 打开具体项目的控制台：
  ![1](/doce/1.png)

  (2) 进入设置找到函数选项并向下拉：
  ![2](/doce/2.png)

  (3) 找到D1数据库绑定，编辑，变量名称填“DB”，D1数据库选择刚刚创建的数据库（这里已经填好，示范）：
  ![3](/doce/3.png)
</details>

9. 重新部署项目以刷新数据，完成。

### 配置数据表

你可以向 Cloudflare 的 D1 数据库的已创建短链数据库中的 `banUrl` 数据表添加数据以设置黑名单域名。

在此数据表中的域名均无法创建/解析短链。

请直接在数据表的 `url` 项添加要加黑名单的一级域名，如 `example.com` ，其他的数据项会自动填写。

### 配置环境变量

你可以在 Cloudflare Pages 项目控制面板`设置`->`环境变量`->`制作`->`为生产环境定义变量`中配置以下环境变量。

所有环境变量全部都是可选配置的，不配置则执行默认的相关函数，不影响正常使用。

| 变量名称 | 示例值 | 可选 | 介绍 |
|---------|----|------|-----|
| SHORT_DOMAINS     | example.com               | 是的 | 短链生成后的显示域名（主域名），没有变量则默认自动获取当前域名 |
| DIRECT_DOMAINS    | example.com,example.org   | 是的 | 直链域名，设置后使用该域名访问则直接 302 重定向跳转，而不是默认的 JS 跳转，多个用逗号分割，没有变量则默认不启用直链跳转 |
| ALLOW_DOMAINS     | example.com,example.org   | 是的 | 允许解析目标地址的域名白名单，设置后只能使用该域名解析目标地址，否则拒绝请求，多个用逗号分割，没有变量则默认不启用允许解析域名白名单 |

### 通过 API 生成

```bash
# POST /create
curl -X POST -H "Content-Type: application/json" -d '{"url":"https://example.com"}' https://c1n.top/create

# 指定 slug
curl -X POST -H "Content-Type: application/json" -d '{"url":"https://example.com","slug":"1example"}' https://c1n.top/create

# 指定 email
curl -X POST -H "Content-Type: application/json" -d '{"url":"https://example.com","email":"info@example.com"}' https://c1n.top/create

```

> 响应:

```json
{
  "slug": "1example",
  "link": "http://c1n.top/1example"
}
```

### 信息修改

您可以修改程序页面底部的版权声明，如改为“Copyright © 2024 Example. All rights reserved.”，但还请声明/保留此程序的来源、作者及所在仓库地址。

您可以快捷修改文件 `functions/[id].js` 中的 `shortName`、`htmlHead`和`footer` 及其他常量值来统一编辑短链跳转相关页面显示文本。从标有注释“统一固定内容”字样的地方开始到结束。

代码中包含的隐私政策或相关文件请按照实际信息修改。

### 数据表解释

> 表 `links` 短链记录

- `id` 行数据在数据表中的唯一记录 ID
- `url` 短链的目标 URL
- `slug` 短链对应的唯一短 ID
- `email` 用户可选提交的 Email 地址
- `ua` 用户的浏览器标识（注：此数据依靠客户端标头，可篡改）
- `ip` 用户的 IP 地址
- `status` 短链的状态，默认为“1”，“-1”或“ban”为封禁、“1”为正常、“2”或“skip”为跳过黑名单
- `hostname` 用户生成短链访问的主机名
- `create_time` 短链生成时间

>表 `logs` 短链访问记录

- `id` 行数据在数据表中的唯一记录 ID
- `url` 访问的短链的目标 URL
- `slug` 访问的短链对应的唯一短 ID
- `referer` 访问短链的用户来源（注：此数据依靠客户端标头，可篡改）
- `ua` 访问的用户的浏览器标识（注：此数据依靠客户端标头，可篡改）
- `ip` 访问的用户的 IP 地址
- `status` 访问的短链的状态，默认为“1”，“-1”或“ban”为封禁、“1”为正常、“2”或“skip”为跳过黑名单
- `hostname` 用户访问短链所访问的主机名
- `create_time` 用户访问短链的时间

>表 `banUrl` 域名黑名单

- `id` 行数据在数据表中的唯一记录 ID
- `url` 黑名单域名
- `create_time` 黑名单添加时间
