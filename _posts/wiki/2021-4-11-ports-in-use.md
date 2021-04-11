---
layout: post
title: "Linux 下检查端口占用"
subtitle: ""
date: 2021-4-10
author: "ZingLix"
header-style: 'text'
knowledge: true
hidden: true
tags:
  - Linux_kb
---

```
sudo netstat -tulpn | grep LISTEN
sudo lsof -i -P -n | grep LISTEN
sudo ss -tulpn | grep LISTEN
sudo lsof -i:<port>
```