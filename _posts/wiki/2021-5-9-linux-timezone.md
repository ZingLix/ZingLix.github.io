---
layout: post
title: "Linux 更换时区"
subtitle: ""
date: 2021-5-9
author: "ZingLix"
header-style: 'text'
knowledge: true
hidden: true
tags:
  - Linux_kb
---

`timedatectl` 指令可以查看当前的时间信息，如下

```
      Local time: Sun 2021-05-09 23:00:17 CST
  Universal time: Sun 2021-05-09 15:00:17 UTC
        RTC time: Sun 2021-05-09 15:00:17
       Time zone: Asia/Shanghai (CST, +0800)
 Network time on: yes
NTP synchronized: yes
 RTC in local TZ: no
```

如果时区不对，可以用 `sudo timedatectl set-timezone Asia/Shanghai` 这条指令切换到国内的时区，最后一个参数就是你要切换的时区，这条指令需要 `sudo` 权限。

具体的时区列表可以用 `timedatectl list-timezones` 获得或者去 `/usr/share/zoneinfo` 路径下查看。