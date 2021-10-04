---
layout: post
title: "NGINX 配置 HTTPS 最佳实践"
subtitle: "Got A+ Security for Your Websites"
date: 2021-10-3
author: "ZingLix"
header-img: "img/post-15.png"
catalog: true
tags:
  - NGINX
  - TLS
---

1202 年了，不会还有网站不支持 HTTPS 吧？不过 HTTPS 的配置还是有很多讲究的。本文以 NGINX 的配置为例，嫌麻烦的可以直接跳到 [最后](#完整配置) 抄配置。

如果你不清楚 HTTPS 与 TLS 的工作原理，可以先阅读 [这篇文章](/2019/05/07/tls-handshake/)，可以帮助你理解下述配置。

## 获取证书

证书是实现 HTTPS 的基础，现在各个云服务商都提供了免费的证书申请，可以直接去申请。这里我以 acme.sh 为例说明下申请证书时的注意事项。

```
acme.sh --issue -d "*.zinglix.xyz" --keylength ec-256 --ocsp
```

上面是一个简单的用 acme 申请证书的命令，其中关键的是 `keylength` 和 `ocsp` 两个参数，OCSP 的作用我们 [后面](#ocsp) 再说，建议能开启则开启，先来谈谈密钥长度的问题。

证书加密的算法分为 RSA 和 ECDSA 两类，这对应到证书也就分为两类。acme 中 `keylength` 支持的参数有 `2048`, `3072`, `4096`, `8192` 和 `ec-256`, `ec-384`, `ec-521`(参数支持，但暂不支持申请)。

`ec-` 开头的对应着 ECDSA 证书，其他的为 RSA 证书，长度越长安全性也就更高，但对性能的消耗也就越高。RSA 有更好的兼容性，ECDSA 可以提供更好的前向安全，具体差异可以看 [这里](/2021/04/05/tls-13/#rsa-与-dh)。

根据 [SSL Labs 的推荐](https://github.com/ssllabs/research/wiki/SSL-and-TLS-Deployment-Best-Practices#31-avoid-too-much-security)，长于 2048 的 RSA 密钥和 256 bits 的 ECDSA 密钥对于 CPU 性能是一种浪费，从中获得安全性的提升有限，导致过度加密。

**因此推荐密钥长度为 `2048` 与 `ec-256`！**

那么两种类型证书选择哪一个呢？那当然是全都要啦~ NGINX 支持同时使用两个证书，只需要都写上就行了

```
# RSA 证书
ssl_certificate  /cert/*.zinglix.xyz/fullchain.cer;
ssl_certificate_key  /cert/*.zinglix.xyz/*.zinglix.xyz.key;
# ECDSA 证书
ssl_certificate  /cert/*.zinglix.xyz_ecc/fullchain.cer;
ssl_certificate_key  /cert/*.zinglix.xyz_ecc/*.zinglix.xyz.key;
```

这里 `ssl_certificate` 最好是使用完整的证书链，如果没有提供必要的中间证书可能会导致证书链不可信。

## HTTP/2 与会话恢复

HTTP/2 可以有效提升对网络的利用效率，会话恢复可以复用曾经协商过的数据，两者都可以帮助减少 RTT，所以建议开启，可以有效减少建立连接时的耗时。

```
listen 443 ssl http2;

ssl_session_timeout 1d;
ssl_session_cache shared:MozSSL:10m;
ssl_session_tickets off;
```

## 加密协议与套件

SSL 已经是不安全的了，绝不要使用。TLSv1.0 与 TLSv1.1 虽然没有被证明不安全，但作为老旧的协议即将过时，除非你的客户真的需要，也不要开启。

TLSv1.2 可以说是目前被最广泛使用的协议，应当被开启。[TLSv1.3](/2021/04/05/tls-13/) 作为最新的协议，在性能和安全性上都有提升，支持的话也应当开启。

> 如果为了极致的安全，只开启 TLSv1.3 也是没有问题的，现代的浏览器都已经支持 TLSv1.3，只要你相信你的客户不会使用略微老旧的软件

至于加密套件，`RC4`、`DES` 等等都不安全，但说那么多套件头也晕了，下面已经整理了一份支持绝大多数客户端且安全的配置

```
ssl_protocols TLSv1.2 TLSv1.3;
ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305;

ssl_prefer_server_ciphers on;
```

`ssl_prefer_server_ciphers` 用于指定服务器是否有推荐的套件，为了能够根据服务器配置用上更安全的套件，防止 BEAST 攻击，建议开启。

## HSTS

HSTS (HTTP Strict Transport Security) 能够告诉浏览器，该网站只应该通过 HTTPS 访问，避免使用 HTTP。开启方式如下，只需要添加一个 HTTP 头

```
add_header Strict-Transport-Security 'max-age=31536000; includeSubDomains; preload' always;
```

其中三个参数

- `max-age=<expire-time>`：指明 HSTS 的有效期，最佳实践是一年时间即 `31536000`。注意，开启后如果关闭 HTTPS 将在有效期内导致网站无法访问。
- `includeSubDomains`：是一个可选参数，指明是否同时适用于子域名。
- `preload`：可选参数，指明是否为预加载。

> HSTS 虽然可以实现强制浏览器使用 HTTPS，但是第一次访问时依旧不知道目标网站是否采用了 HSTS。
>
> 为了解决这一问题，Google 维护了一个名单，里面是采用了 HSTS 的网站列表，名单会随着浏览器分发。这样浏览器第一次访问时，会先查看网站是否位于该名单里，从而决定是否采用 HTTPS。这一机制即为 **预加载机制**。
>
> 可以在 [该网站](https://hstspreload.org/) 上提交申请，注意必须加上与上述配置相同或更严格的配置，同时重定向所有 HTTP 请求。

## DHE 参数

密钥交换时常采用 Diffie-Hellman 密钥交换，低强度（768 及以下）的参数容易被破解，以及一些常见的 1024 位参数。

出于性能与安全性的考虑，2048 位即可，如果你不担心性能可以选择更高的。

可以用 `openssl dhparam -out dhparams.pem 2048` 生成一个（通常很慢）或者获取一个现成的，例如 [2048位](https://ssl-config.mozilla.org/ffdhe2048.txt) 和 [4096位](https://ssl-config.mozilla.org/ffdhe4096.txt)。

```
ssl_dhparam /path/to/dhparam.pem;
```

## OCSP

OCSP 是一种从证书颁发者处验证证书是否被撤回的机制，可以让浏览器验证证书有效性。

最佳实践是证书中强制要求 OCSP，但客户到颁发者处的连接质量可能并不好，例如国内访问 Let's Encrypt，这会导致网站访问速度下降。

OCSP Stapling 是一种让服务器在握手过程中同时传递 OCSP 相应的技术，向颁发者验证的过程由服务器代劳，避免用户直接去访问。开启也很简单，如下

```
ssl_stapling on;
ssl_stapling_verify on;
```

## 0-RTT

[0-RTT](/2021/04/05/tls-13/#0-rtt) 是 TLSv1.3 很棒的一个特性，有效消除握手时间，但会导致重放攻击，且放弃了前向安全性。

在足够了解后果的前提下可以开启，但如果不确定那就算了，建议是 GET 等无副作用的操作可以开启。

```
ssl_early_data on;
```

## 其他一些细节

- 网站所有资源开启 HTTPS，例如一些公用 CSS、JS
- [非法域名（尤其是 IP 访问）禁止握手](/2021/10/04/nginx-ssl-reject-handshake/)，避免暴露证书
- 重定向所有 HTTP 请求至 HTTPS

```
server {
    listen 80 default_server;
    listen [::]:80 default_server;

    return 301 https://$host$request_uri;
}
```

## 完整配置

```
# HTTP/2
listen 443 ssl http2;
server_name your_domain;

# RSA 证书（推荐2048位）
ssl_certificate  /cert/*.zinglix.xyz/fullchain.cer;
ssl_certificate_key  /cert/*.zinglix.xyz/*.zinglix.xyz.key;
# ECDSA 证书（推荐256位）
ssl_certificate  /cert/*.zinglix.xyz_ecc/fullchain.cer;
ssl_certificate_key  /cert/*.zinglix.xyz_ecc/*.zinglix.xyz.key;

# 会话恢复
ssl_session_timeout 1d;
ssl_session_cache shared:MozSSL:10m;
ssl_session_tickets off;


# 加密协议与套件
ssl_protocols TLSv1.2 TLSv1.3;
ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305;
ssl_prefer_server_ciphers on;

# HSTS 
add_header Strict-Transport-Security 'max-age=31536000; includeSubDomains; preload' always;

# DHE 参数（推荐2048位）
ssl_dhparam /cert/ffdhe2048.txt;

# OCSP Stapling 
ssl_stapling on;
ssl_stapling_verify on;
```

## 验证

配置后，可以验证自己的配置是否正确，下面推荐两个网站

- [SSL Labs](https://www.ssllabs.com/ssltest/)：除了配置外，可以检查与各类客户端的兼容性
- [ImmuniWeb](https://www.immuniweb.com/ssl/)：有更完整的配置测试

上述配置后应该都能取得 A+ 的成绩。

![](/img/in-post/nginx-ssl/3.png)

![](/img/in-post/nginx-ssl/4.png)

最后提一嘴关于 SSL Labs 中有两项 90 分，虽然没有必要，但可以继续冲击 100。

关于 Key Exchange，其要求 DH 参数和证书密钥长度均大于等于 4096，替换这两个文件即可。当然之前提到过这会导致过度加密，带来的性能损失并不能带来足够的安全性提升。

而 Cipher Strength，其要求所有加密套件均大于等于 256 bits，而这里存在一个 [bug](https://github.com/ssllabs/ssllabs-scan/issues/636) 是 TLSv1.3 有一个算法为 `TLS13-AES-128-GCM-SHA256`，虽然 128 位但其实配上 TLSv1.3 足够安全，但这导致了开启 TLSv1.3 就无法得到 100 分。

不过除了关闭 TLSv1.3 之外，还是有解决方法的，那就是移除 `TLS13-AES-128-GCM-SHA256` 套件，NGINX 1.19.4 开始支持调整 TLSv1.3 的加密套件，只需加上下述配置，但会导致 0-RTT 失效

```
ssl_conf_command    Ciphersuites TLS_AES_256_GCM_SHA384:TLS_CHACHA20_POLY1305_SHA256;
ssl_ecdh_curve      secp384r1;
```