---
layout: post
title: "添加用户至 docker 用户组"
subtitle: "以无 root 权限的方式使用 docker"
date: 2021-4-3
author: "ZingLix"
header-style: 'text'
knowledge: true
hidden: true
tags:
  - docker_kb
---

Docker daemon 绑定的是 Unix socket，这就导致 docker 需要 root 权限才能使用，但这十分麻烦，因为其他用户必须经常使用 `sudo`。

为此，docker daemon 创建 Unix socket 时，会允许所有 `docker` 组内成员访问，所以我们只需要将用户加入 `docker` 组内就可以避免使用 `sudo`。

1. 创建 `docker` 组：`sudo groupadd docker`
2. 将用户加入 `docker` 组内：`sudo usermod -aG docker $USER`
3. 重新登录