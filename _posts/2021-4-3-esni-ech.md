---
layout: post
title: "ESNI 与 ECH 的前世今生"
subtitle: "Next Step towards Safer Internet"
date: 2021-4-3
author: "ZingLix"
header-img: "img/post-8.jpg"
catalog: true
tags:
  - 网络
  - TLS
---

在当时[介绍 TLS 的最后](/2019/05/07/tls-handshake/#总结)，提到过虽然 TLS 能够加密整个通信过程，但是在协商的过程中依旧有很多隐私敏感的参数不得不以明文方式传输，其中最为重要且棘手的就是将要访问的域名，即 SNI（Server Name Indication）。同时还有用于告知客户端可用的应用层协议的 ALPN 拓展，泄露这个会导致攻击者知道服务器所支持的服务以及连接的用途。

![](/img/in-post/TLS/ech-1.png)

之所以会暴露如此重要的内容，并不是设计时的失误，而是因为加密该内容会使得许多服务器无法正常工作。通常来说，一台服务器往往会提供许多服务，小到用 nginx 反向代理数个服务，大到 CDN 服务器同时为无数网站提供服务，而因为域名的不同，证书也不相同。那么当客户端访问服务的时候必须指明 SNI，服务器才知道应该返回哪个证书，但客户端收到证书前又没有办法加密，就陷入了一个先有鸡还是先有蛋的尴尬境地。ESNI 以及其后继 ECH 就是被设计出来弥补这一问题。

> 在了解 ESNI 与 ECH 前，最好对于 TLS 的 [握手流程](/2019/05/07/tls-handshake/#握手流程) 有所了解

## Encrypted SNI

ESNI（Encrypted SNI）正如其名，其设计的目标就是为了加密 SNI，是最先为解决这一问题提出的一个 TLS 拓展。虽然这一方案即将被废弃，但对于了解其后继者 ECH 有着极大的帮助。

ESNI 为了能够让客户端获得密钥发送密文，依赖于另一个服务 DNS 来分发密钥。客户端在使用 ESNI 连接服务器之前，会在常规的请求网站 IP 的 A/AAAA 请求上再进行一次 TXT 的请求以获得 ESNI 的公钥（实际是用 BASE64 编码后的公钥以及类似加密算法之类的参数），如下是请求本博客的结果

```
$ dig _esni.zinglix.xyz TXT +short
"/wGE7aXSACQAHQAgVWE58Qfu1WOtQCxMSvjM/ve/+MRnZ/snRynvUyN3tCEAAhMBAQQAAAAAYGQd8AAAAABgbAbwAAA="
```

客户端会将加密后的 SNI 以拓展的形式发送。服务器收到请求后就会用对应的私钥解密，并用解密后得到 SNI 进行后续的操作。解密失败则终止连接。

![](/img/in-post/TLS/ech-2.png)

不过 DNS 请求本身是明文的，依旧存在风险，所以部署 ESNI 还需要引入 DoH（DNS over HTTPS）。DoH 除了保证可以加密传输公钥之外，还有一个重要的点就是可以认证 DoH 服务器，保证访问到的是正确的服务器，而非是（攻击者精心准备的）本地网络缓存，从而避免了本地缓存返回一个空的 TXT 记录以阻止客户端使用 ESNI 或者返回一个攻击者控制的密钥使得客户端使用了错误的公钥加密。

但这一方法仍然存在问题，首先就是密钥的分发，Cloudflare 在部署时每个小时都会轮换密钥，这样可以降低密钥泄露带来的损失，但是 DNS 有缓存的机制，客户端很可能获得的是过时的密钥，此时客户端就无法用 ESNI 继续进行连接。其次是对网站的 DNS 请求可能返回有几个 IP 地址，每个地址分别代表了不同的 CDN 服务器，然而 ESNI 的 TXT 记录只有一个，可能会将该密钥发送给了错误的服务器导致握手失败。

## Encrypted Client Hello

ECH（Encrypted Client Hello）出现的目标就是就是为了克服 ESNI 的缺陷，同时也正如其名，ECH 有着更大的野心，不单单加密 SNI，而是要加密整个 Client Hello。

ECH 同样采用 DoH 进行密钥的分发，但是在分发过程上进行了改进。相较于 ESNI 服务器解密失败后终止连接，ECH 服务器会提供给客户端一个公钥供客户端重试连接，以期可以完成握手。

那么问题来了，解密失败服务器还是不知道 SNI 是多少，那么怎么返回公钥呢？

实际上 ECH 的 Client Hello 分为了两个部分，分别称为 ClientHelloOuter 和 ClientHelloInner，表层和里层两个部分。ClientHelloOuter 同普通的 Client Hello 消息一样，但只有连接必要的握手参数，而不包含实际想要访问的内容。真正的内容存在于 ClientHelloInner 中，其将敏感信息用密钥加密后以拓展的形式跟在 ClientHelloOuter 后面。

![](/img/in-post/TLS/ech-3.png)

而服务器这边，握手实际上由 ECH 服务提供者来完成（称为 client-facing server）而非域名对应的背后的服务，由它来通知客户端解密是否成功以及发送正确的 ECH 公钥。

## 总结

ECH 是将会是 TLS 的又一次重大升级，这一次使得每次连接除了其发起者和接收者之外，没有人能够知道访问的是什么，有助于进一步保护用户隐私。尽管 ECH 还是一项进行中的工作，但随着工作的继续，显然我们离更安全的互联网又近了一步。

## 参考文档

1. [Good-bye ESNI, hello ECH !](https://blog.cloudflare.com/encrypted-client-hello/)