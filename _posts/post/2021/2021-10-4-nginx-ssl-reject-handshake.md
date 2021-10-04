---
layout: post
title: "NGINX 配置避免 IP 访问时证书暴露域名"
subtitle: "Reject SSL Handshake in NGINX"
date: 2021-10-4
author: "ZingLix"
header-img: "img/post-16.jpg"
catalog: true
tags:
  - NGINX
  - TLS
---

## TL;DR

利用 NGINX 1.19.4 后的新特性 `ssl_reject_handshake on;`，将其置于默认访问时配置中，IP 访问时会终止 TLS 握手，也就不会暴露域名了。

## 细说

CDN 是建站时常用的工具，在自己的主机外面套一层 CDN 是常见操作，一般这样认为自己的主机就安全了，有人来攻击也会先到 CDN 服务器，攻击者根本无法获取到自己主机的 IP，但事实真的是这样吗？

我们先来看看一般配置后会出现什么问题。

```
server {
    listen 80 default_server;

    # Redirect all HTTP requests to HTTPS.
    return 301 https://$host$request_uri;
}

server {
    listen 443 default_server;
    server_name _;
    include conf.d/ssl.config;
    return 444;
}
```

上面是一个很常用的 NGINX 配置，HTTP 访问全部重定向到 HTTPS 的 443 端口上，没有配置过的域名返回 444 终止连接。

好了，现在尝试用 IP 和 HTTPS 访问你的网站，你应该能够看到预想中访问失败、证书无效等连接失败的提示。

**但是！**注意下浏览器左上角提示的不安全，点开查看证书信息，你就会发现你的域名其实随着证书发送了过来。此时如果你是攻击者，那么其实就可以知道该域名背后的源主机 IP 就是这个。

![](/img/in-post/nginx-ssl/1.png)

上图即为用 IP 访问后，依旧能看到证书内容。这是因为返回 444 是 HTTP 层面的事情，意味着到达这一步下层的 TLS 握手已经完成。证书不被信任是一回事，但说明已经拿到了服务器的证书。

CDN 确实避免了直接 DNS 查询暴露 IP 的问题，但攻击者通过扫描全网 IP，用上述方式依旧可以知道每个 IP 对应的域名是什么，这也是为什么很多站长用了 CDN 后并且反复更换 IP 却依旧被攻击者迅速找到 IP 的原因。

> [Censys](https://search.censys.io/) 就一直在干这件事，全网扫描 IP 并找到其对应的域名

## 那该怎么办呢？

问题根源出在 client 在 TLS 握手时发送了 ClientHello 后，NGINX 在 ServerHello 中带着含有域名的默认证书返回了，因为 NGINX 期望可以完成握手，这可能可以算是 NGINX 的一个缺陷。

### 笨办法

既然 NGINX 默认提供了带有域名的证书，那么想不暴露也很简单，提供一个不含有正确域名的证书即可。

NGINX 设置中 HTTPS 访问如果没有设置证书，那么就会报错。但反正 IP 访问也不需要提供服务，那么直接自签一个 IP 证书，或者随便一个域名的证书都可。当然，如果能搞定合法的 IP 证书也不是不行。

搞定证书后，添加一个配置，让 IP 访问返回错误证书就完事了。

```
server {
    listen 443 ssl default_server;
    server_name your_ip;

    ssl_certificate    xxxx.pem;
    // and more ssl config ...

    return 444;
}
```

### 好方法

这种方法还得自己搞个证书，如果服务器多每个都得这么搞也挺麻烦的，好在这个问题 NGINX 这已经有了很完美的解决方案。

ClientHello 中是带着 SNI 的，所以其实握手阶段是可以知道访问的域名是否合法的，NGINX 1.19.4 中添加了一个新的配置项 `ssl_reject_handshake` 用于拒绝握手，也就不会提供证书。

使用方法也很简单，将原本默认配置中的 `return 444` 替换成 `ssl_reject_handshake on` 即可。

```
server {
    listen 443 default_server;
    server_name _;
    include conf.d/ssl.config;
    
    # 不用返回 444 了，直接拒绝握手
    ssl_reject_handshake on;
    # return 444;
}
```

配置后，再尝试 IP 访问，会发现浏览器报了 `ERR_SSL_UNRECOGNIZED_NAME_ALERT` 的错误，也看不到证书信息，目标达成！

![](/img/in-post/nginx-ssl/2.png)

## 其实还没完

上述方法是通过 ClientHello 中的 SNI 确定访问是否合法的，那如果 SNI 就是正确的域名呢？

这种场景发生于攻击者已经确定要攻击某个域名，那么他就可以将带着该域名的握手信息遍历所有 IP，握手成功就找到，这样访问其实与正常访问并无区别，唯一解决方法就是白名单只允许 CDN 服务器访问。

> 例如 hosts 直接将硬写 IP，将域名强行指向某个 IP
> 
> 或者用这种方式 `curl https://example.com --resolve 'example.com:443:172.17.54.18'`

```
location / {
    allow   172.1.2.0/24;
    allow   1.2.3.4/32;
    deny    all;
}
```

上述 IP 段只能向 CDN 提供商询问，一般文档中都是有相关信息的。