/*
 * Copyright (c) molikai-work (2024)
 * molikai-work 的特定修改和新增部分
 * 根据 MIT 许可证发布
 */

import page403 from './403.html'; // 导入 403 页面
import page404 from './404.html'; // 导入 404 页面

// 处理 GET 请求的函数
export async function onRequestGet(context) {
    const { request, env, params } = context; // 解构获取请求、环境和参数信息

    // 获取客户端 IP、用户代理、Referer 和主机名等信息
    const clientIP = request.headers.get("CF-Connecting-IP") || request.headers.get("x-real-ip") || request.headers.get("clientIP");
    const countryIP = request.headers.get("CF-IPCountry")
    const userAgent = request.headers.get("user-agent");
    const referer = request.headers.get('Referer') || "Referer";
    const hostname = request.headers.get('host');

    // 配置日期格式
    const formattedDate = new Date().toISOString();

    /* 统一固定内容 */
    const shortName =`example`

    const htmlHead =`<meta name="robots" content="noindex" />

        <link rel="icon" href="/logo.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="stylesheet" href="/asset/css/jump-styles.css" />
    `

    const adminEmail =`info@example.com`

    const noscript =`<noscript>
        <p>完整使用${shortName}短链需要浏览器支持（启用）JavaScript！</p>
        <p>此页面（短链跳转）也可以在不使用JavaScript的情况下使用，请手动操作页面。</p>
        <p>不是您的浏览器所导致的？请联系管理员进行排错：info[at]example.com。</p>
    </noscript>`

    const footer = `<p class="links">
        <hr />

        您还可以看看本站的友情链接：<br /><br />

        <a href="https://example.com/" title="友情链接：[友情链接预留]" target="_blank">[友情链接预留]</a> ｜
        <a href="https://example.com/" title="友情链接：[友情链接预留]" target="_blank">[友情链接预留]</a>
    </p>

    <script src="/asset/js/web_console.js" defer></script>`
    /* 统一固定内容结束 */

    if (!env.ALLOW_DOMAINS) {
        // 环境变量不存时跳过代码执行
    } else {
        // 读取环境变量允许解析域名名单
        const allowDomains = env.ALLOW_DOMAINS.split(',');
        // 如果主机名不在允许列表内，则返回自定义的 403 页面
        if (!allowDomains.includes(hostname)) {
            const banRedirectPage = `<!DOCTYPE html>
                <html lang="zh-CN">
                <head>
                    <title>${shortName} 短链|未授权的主机名</title>

                    ${htmlHead}
                </head>
                <body>
                    <h2>${shortName} 短链 - 403</h2>
                    <h1>未授权的主机名</h1>
                    <p>您访问的 URL 中，考虑防滥用，主机名尚未被授权解析目标地址。</p>
                    <p>请使用允许的主机名，例如：c1n.top（Js 跳转）、a77.top（重定向跳转）。</p>
                    <a href="/">返回主页</a>

                    <br /><br />

                    <p class="contact">对此页面的处理有疑问？请联系：<a href="mailto:${adminEmail}?subject=Feedback...&body=Hello...">${adminEmail}</a>，寻求短链支持。</p>

                    ${footer}
                </body>
                </html>
            `;

            return new Response(banRedirectPage, {
                status: 403,
                headers: {
                    "content-type": "text/html;charset=UTF-8",
                }
            });
        }
    }

    const slug = decodeURIComponent(params.id); // 解码 slug 参数

    // 查询 slug 对应的状态
    const statusQueryResult = await env.DB.prepare(`
        SELECT status AS status 
        FROM links 
        WHERE slug = '${slug}'
    `).first();

    // 查询 slug 对应的 URL
    const urlQueryResult = await env.DB.prepare(`
        SELECT url AS url 
        FROM links 
        WHERE slug = '${slug}'
    `).first();

    let status = null;
    if (statusQueryResult && statusQueryResult.status) {
        status = statusQueryResult.status;
    }

    // 如果未找到 URL，则返回 404 响应
    if (!urlQueryResult) {
        return new Response(page404, {
            status: 404,
            headers: {
                "content-type": "text/html;charset=UTF-8",
            }
        });
    } else {
        try {
            // 插入访问日志
            const logInsertResult = await env.DB.prepare(`
                INSERT INTO logs (url, slug, ip, status, referer, ua, hostname, create_time) 
                VALUES ('${urlQueryResult.url}', '${slug}', '${clientIP}/${countryIP}', '${status}', '${referer}', '${userAgent}', '${hostname}', '${formattedDate}')`
            ).run();

            if (status === "skip" || status === 2) {
                // 跳过代码执行
            } else {
                // 提取 URL 的一级域名部分
                const urlHostname = new URL(urlQueryResult.url).hostname.split('.').slice(-2).join('.');

                // 查询 banUrl 表是否存在该一级域名
                const banUrlQueryResult = await env.DB.prepare(`
                    SELECT id AS id
                    FROM banUrl 
                    WHERE url = '${urlHostname}'
                `).first();

                // 如果存在 banUrl 记录，则返回 403
                if (banUrlQueryResult) {
                    return new Response(page403, {
                        status: 403,
                        headers: {
                            "content-type": "text/html;charset=UTF-8",
                        }
                    });
                }
            }

            // 如果状态为 ban，则返回自定义的 403 页面
            if (status === "ban" || status === -1) {
                const banRedirectPage = `<!DOCTYPE html>
                    <html lang="zh-CN">
                    <head>
                        <title>${shortName} 短链|解析 URL 被拒绝</title>

                        ${htmlHead}
                    </head>
                    <body>
                        <h2>${shortName} 短链 - 403</h2>
                        <h1>解析 URL 被拒绝</h1>
                        <p>抱歉，我们已理解您的请求，但您被服务器拒绝了。</p>
                        <p class="warning">注意，此短链指向的目标 Url 页面可能含有违规内容。</p>
                        <a href="/">返回主页</a>

                        <br /><br />

                        <p class="contact">对此页面的处理有疑问？请联系：<a href="mailto:${adminEmail}?subject=Feedback...&body=Hello...">${adminEmail}</a>，寻求短链支持。</p>

                        ${footer}
                    </body>
                    </html>
                `;

                return new Response(banRedirectPage, {
                    status: 403,
                    headers: {
                        "content-type": "text/html;charset=UTF-8",
                    }
                });
            }

            // 检查环境变量是否存在
            if (!env.DIRECT_DOMAINS) {
                // 环境变量不存时跳过代码执行
            } else {
                // 如果是直链域名，则进行 302 重定向
                const directDomains = env.DIRECT_DOMAINS.split(',');

                if (directDomains.includes(hostname)) {
                    return Response.redirect(`${urlQueryResult.url}`, 302);
                }
            }
  
            // 构建带自动跳转的页面
            const redirectPage = `<!DOCTYPE html>
                <html lang="zh-CN">
                <head>
                    <title>${shortName} 短链|带你到目标页面 #${slug}</title>

                    <link rel="canonical" href="https://c1n.top/${slug}" />
                  
                    <meta property="og:type" value="website" />
                    <meta property="og:title" value="${shortName} 短链接跳转" />
                    <meta property="og:description" value="#${slug} 将会跳转到 ${urlQueryResult.url}" />
                    <meta property="og:url" value="https://c1n.top/${slug}" />
                    <meta property="og:image:width" value="64" />
                    <meta property="og:image:height" value="64" />
                    <meta property="og:image" value="https://c1n.top/asset/image/logo/png/indication.png" />
                    <meta property="og:image:alt" value="c1nTop Logo" />

                    <meta name="twitter:card" value="summary" />
                    <meta name="twitter:title" value="${shortName} 短链接跳转" />
                    <meta name="twitter:description" value="#${slug} 将会跳转到 ${urlQueryResult.url}" />
                    <meta name="twitter:image" value="https://c1n.top/asset/image/logo/png/indication.png" />
                    <meta name="twitter:image:alt" value="c1nTop Logo" />

                    ${htmlHead}
                </head>
                <body>
                    <h2>${shortName} 短链</h2>
                    <h1>带你到目标页面</h1>
                    <p>状态：${status}</p>
                    <p>这将在 <span id="countdown"></span> 秒后自动跳转。</p>
                    <p>如果页面没有自动跳转，请点击此链接：</p>
                    <a href="${urlQueryResult.url}" rel="external nofollow noopener noreferrer">${urlQueryResult.url}</a>

                    <br /><br />

                    <p class="tip">如需直链跳转，请使用 a77.top/${slug}</p>

                    <p class="contact">对此目标 Url 有疑问？请联系：<a href="mailto:${adminEmail}?subject=Feedback...&body=Hello...">${adminEmail}</a>，寻求短链支持。</p>

                    ${noscript}

                    ${footer}

                    <script>
                        const targetTime = Date.now() + 3000;

                        function updateCountdown() {
                            const currentTime = Date.now();
                            const remainingTime = Math.max(targetTime - currentTime, 0);
                            const seconds = Math.ceil(remainingTime / 1000);
                            document.getElementById('countdown').innerText = seconds;

                            if (remainingTime > 0) {
                                setTimeout(updateCountdown, 1000);
                            } else {
                                var newLink = document.createElement('a');
                                newLink.setAttribute('href', "${urlQueryResult.url}");
                                newLink.setAttribute('rel', 'external nofollow noopener noreferrer');
                                newLink.click();
                            }                            
                        }

                        updateCountdown();
                    </script>
                </body>
                </html>
            `;

            return new Response(redirectPage, {
                status: 200,
                headers: {
                    "content-type": "text/html;charset=UTF-8",
                }
            });
        } catch (error) {
            console.log(error);
            // 构建带错误提示的页面
            const errorRedirectPage = `<!DOCTYPE html>
                <html lang="zh-CN">
                <head>
                    <title>${shortName} 短链|似乎遇到了内部问题</title>

                    ${htmlHead}
                </head>
                <body>
                    <h2>${shortName} 短链 - 500</h2>
                    <h1>似乎遇到了内部问题</h1>
                    <p>某些内部函数可能未正常执行，但我们仍会尝试解析目标地址。</p>
                    <p>这不是您的错，是我们。请等待我们排查错误。</p>
                    <p>请点击此链接：<a href="${urlQueryResult.url}" rel="external nofollow noopener noreferrer">${urlQueryResult.url}</a>以尝试进行跳转。</p>

                    <br /><br />

                    <p class="contact">对此目标 Url 或是页面有疑问？请联系：<a href="mailto:${adminEmail}?subject=Feedback...&body=Hello...">${adminEmail}</a>，寻求短链支持。</p>

                    ${noscript}

                    ${footer}
                </body>
                </html>
            `;

            return new Response(errorRedirectPage, {
                status: 500,
                headers: {
                    "content-type": "text/html;charset=UTF-8",
                }
            });
        }
    }
}
