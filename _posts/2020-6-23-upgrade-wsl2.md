---
layout: post
title: "升级 WSL2 Ubuntu 至 20.04 LTS"
subtitle: "Upgrade WSL2 to Ubuntu 20.04 LTS"
date: 2020-6-23
author: "ZingLix"
header-img: "img/post-17.jpg"
catalog: true
tags:
  - WSL
---

最近 Ubuntu 20.04 正式发布了，但是 WSL 里装的还是 18.04，所以肯定要升级一下啦~

> 18.04 可以很方便的升级到 20.04，但如果你现在用的还是 16.04 最好是先升级至 18.04 再升至 20.04 以避免一些奇奇怪怪的事情发生

## 更新现有环境

为了能够让现有的环境和升级后的差异尽可能小，从而避免一些更新失败的情况的发生，最好是先更新一下现有的环境。

```
sudo apt update
sudo apt upgrade
```

然后你可能还会想要卸载一些没用的包。

```
sudo apt --purge autoremove
```

## 开始升级

`do-release-upgrade` 指令可以帮助我们升级 Ubuntu 版本，但是如果直接运行你会发现他提醒你没有更新的版本，这时我们就需要

```
sudo do-release-upgrade -d
```

来进行强制升级。不出意外的话接下来就是漫长的等待，中间可能会问你是否同意重启，最后也会以一个重启来结尾，不过用的是 WSL，所以实际表现会是进程分离、Host is down 之类的提醒，再开一个终端就好了。

最后运行一下 `lsb_release -a` 就可以看到我们已经用上了 Focal 了！

![](/img/in-post/WSL/5.png)