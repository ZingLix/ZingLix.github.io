---
layout: post
title: "WSL2 的几个使用技巧"
subtitle: "WSL2 Tips"
date: 2020-4-18
author: "ZingLix"
header-img: "img/post-21.jpg"
catalog: true
tags:
  - WSL
---

## 从资源管理器访问 WSL2

WSL2 改善了文件系统，使得读写能力大大提升，但是 `/mnt` 挂载下的 Windows 文件貌似因为改用了网络协议下降了，最坑爹的是没办法监测文件的变动了，写前端的时候那些测试服务器本来会根据文件变动自动重新编译，现在因为无法监测改变这一功能就失效了。这也不是无解，解决的办法就是把项目文件移到 WSL 中。

借助于网络位置，虽然这些文件放进了 WSL 中，但却依旧可以拥有和 Windows 原生文件一样的感觉。

![](/img/in-post/WSL/2.png)

`\\wsl$\Ubuntu-18.04` 这一网络位置就代表了 WSL2 内部文件的地址，根据不同的发行版后缀可能会有所不同。也可以加上内部路径，例如 `\\wsl$\Ubuntu-18.04\home\zinglix\Project`，就可以实现一个到项目文件夹的快捷方式。

![](/img/in-post/WSL/3.png)

然后你就可以像操作 Windows 文件一样去操作所有的 Linux 文件，~~我靠，这还是两个不同的操作系统吗？~~ 再配合 VS Code 的 Remote WSL 插件，这种在 Windows 上用 Linux 的方式开发软件的使用体验太爽了。

## 取消 Windows 的路径

WSL2 默认会将 Windows 的 `$PATH` 附加到 WSL 的 `$PATH` 中，这样就可以了在 WSL 中直接用 Windows 的命令和程序了，这点很强，可是我用不到。反而是过多的程序导致我在 shell 中使用命令自动补全时产生了大量的无关程序，毕竟我只是想用比较纯粹的 Linux。

微软也是考虑到了这点，在 `/etc/wsl.conf` 中可以进行设置（如果没有这个文件就自己新建一个），里面加上

```
[interop]
appendWindowsPath = false
```

就不会再有 Windows 的程序来打扰啦 ~

## 释放 WSL 内存

毕竟是虚拟机，占用的内存有时候还是挺多的，好在最新的 Windows 中已经加上了内存自动回收，但是并不是即时生效的，如果希望立即释放可以在 Powershell 中运行如下命令。

```
wsl --shutdown
# or
wsl --terminate <distro-name>
```

可以直接关闭 WSL 或者其中一个发行版，因为是直接关闭，记得要检查下没有什么重要的任务在运行。

## 备份与导入

同样利用 Powershell 下的 `wsl` 命令进行管理。

```
wsl --export <distribution> <archive-file-name>
wsl --import <new-distribution> <install-location> <archive-file-name>
```

虽然导入的时候可以自己写发行版的名字，但是我在使用的时候如果与导出时候的名字不同会报错。