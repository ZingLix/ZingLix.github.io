---
layout:     post
title:      "IP 协议头部结构"
subtitle:   ""
date:       2018-7-26
author:     "ZingLix"
header-img: "img/post-25.jpg"
catalog: true
tags:
    - 网络
---

IP 是 TCP/IP 协议中的核心协议，为 TCP、UDP 等协议提供了一种尽力而为、无连接的数据报传输服务，也就意味着 IP 协议不保证成功传输，也不维护数据报相关的链接状态信息。

## IPv4 头部

IPv4 数据报头部至少为 20 字节，结构如下。

![](/img/in-post/IP/1.png)

- 版本：确定 IP 协议的版本（IPv4 或 IPv6），从而能正确解释后面的内容。
- IHL（头部长度）：由于选项的存在，由此字段确定数据从何处开始。
- DS（区分服务，DiffServ）：用于支持其他不同类型的服务（非尽力而为的）。可以区分一些可能要求低时延或者其他要求的服务。
- ECN：拥塞标识符。当路由器感知到拥塞时会设置这两位以降低发送速度。
- 总长度：IP 数据报的总长度，包括首部和头部，字节为单位。由于位数限制最多 65535 字节，所以数据大小最多为 65515 字节，但是链路层一般不能携带这么大的数据，很少超过 1500 字节。
- 标识、标志、分片偏移：用于 IP 分片。传输过程有些协议并不能携带过大的数据，所以只能分为多个部分发送。标识避免与其他数据报分片混淆。最后一片标志设为 0，其他的设为 1。偏移指明是第几个分片，用于正确组装。
- 生存期（Time-To-Live，TTL）：标识可通过的路由器数量上限。每经过一个路由器将该值减一，为 0 时丢弃，避免在一个网络环路中无限传输。
- 协议：指示了上层是什么协议，6 为 TCP，17 为 UDP。
- 头部校验和：用 16 位反码和（Internet 校验和）计算头部，对于数据部分校验由上层协议实现。由于 TTL 每经过一次路由器都会改变，校验和也要因此重新计算。

## IPv6 头部

IPv6 协议扩大了 IP 地址的位数，对于头部也有所精简，结构如下。

![](/img/in-post/IP/2.png)

- 版本、DS、ECN：同 IPv4。
- 流标签：用于为特殊的分组加上标签，不过目前流的确切含义未完全确定。
- 负载长度：标识跟在定长的 40 字节数据报后的字节数量。
- 下一个头部：标识需要交给哪个协议，使用与 IPv4 中协议字段相同的值，但也有可能交给拓展首部，所以名称不同。
- 跳数限制：与 IPv4 中 TTL 相同。但由于 TTL 最初定义为最大生存期在几秒内，现在此规则已被忽略，所以被重新命名。

相比 IPv4 有几个重要的字段都被取消：

- 分片和组装。该操作改为在源和目的地上进行。路由器收到过大的报文直接丢弃并返回“分组太大”的差错报文。
- 校验和字段。因为上层协议往往有差错检测机制，而且每一跳校验和必须重新计算，十分耗时。
- 选项。这样使得 IPv6 头部长度固定为 40 字节，但是选项这一功能未被删除，其可能出现在下一个头部的位置，相比 IPv4 提供了更灵活的拓展方式。