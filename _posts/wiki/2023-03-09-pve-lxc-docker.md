---
layout: post
title: "PVE 下 LXC 启动 Docker 失败解决方案"
subtitle: "attempted to load a profile while confined?"
date: 2023-3-9
author: "ZingLix"
header-style: 'text'
knowledge: true
hidden: true
tags:
  - PVE_kb
  - LXC_kb
  - Docker_kb
---

PVE 下通过 LXC 安装的 Ubuntu 启动 Docker 镜像时候提示 

```
docker: Error response from daemon: AppArmor enabled on system but the docker-default profile could not be loaded: 
running `/usr/sbin/apparmor_parser apparmor_parser -Kr /var/lib/docker/tmp/docker-default6944525` 
failed with output: apparmor_parser: Unable to replace "docker-default".  
Permission denied; attempted to load a profile while confined?
```

解决方式是在调整启动配置

PVE 设置中 `选项-功能` 中选中 `嵌套`

然后在宿主机中找到 `/etc/pve/lxc/100.conf`（注意把 `100` 替换成你的 LXC 容器 id），增加如下几句话，之后重启

```
lxc.apparmor.profile: unconfined
lxc.cgroup.devices.allow: a
lxc.cap.drop:
```
