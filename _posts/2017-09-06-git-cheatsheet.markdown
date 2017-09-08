---
layout: "post"
title: "Git 操作总结"
date: "2017-09-06"
subtitle:   "Git Cheat Sheet"
author:     "ZingLix"
header-img: "img/post-md.jpg"
catalog: true
tags:
    - git
---

Git 是目前世界上最先进的分布式版本控制系统，Windows 环境下可以在[官网](https://git-scm.com/)下载安装，Ubuntu 等 Linux 环境下可以直接用 `sudo apt-get install git` 安装。

## 全局设置

用 Git 提交必须先声明自己的身份，可用如下指令设置：

```
git config --global user.name "Your Name"
git config --global user.email "email@example.com"
```

## 工作流

Git 的工作流有如下三个部分：

- 工作目录（Working Directory）：自己电脑上所操作的文件
- 暂存区（Stage）：暂时存放修改过的文件的区域
- 分支（HEAD）：这一版本的最终文件

以如下方式完成提交：

$$ 工作目录 \xrightarrow{add} 暂存区 \xrightarrow{commit} 分支 $$

在开发新功能的时候，Git 鼓励使用分支的方式。一般情况下会有 master 和 dev 两个分支，前者为稳定版本，后者为开发版本，当开发新功能时则新建一个分支，开发完成后在合并到前两个分支。

![](/img/in-post/git/1.jpg)

所以一般一次开发流程如下：

```
git checkout -b NewFeature #新建并切换至新分支
git add .                  #将修改后的文件提交至暂存区
git commit -m "message"    #提交代码
git checkout dev           #回到主分支
git pull origin dev        #拉取代码，避免已有其他提交
git merge NewFeature       #合并分支
git branch -d NewFeature   #删除新分支
git push origin dev        #推送至远程仓库
```

## 常用操作

|操作|指令|
|:---:|:---:|
|仓库初始化 | `git init`  |
|添加至暂存区   |`git add <file>`   |
|提交代码   | `git commit -m "message"`  |
|仓库状态   | `git status`  |
|改动查询   | `git diff`  |
|历史记录   | `git log`  |
|历史记录（简化）  | `git log --pretty=oneline`  |
|历史记录（分支图）   | `git log --graph`  |
|停止追踪某一文件   | `git rm --cached <file>`  |
|远程库信息   | `git remote`  |
|远程库信息（详细）   | `git remote -v`  |
|操作记录   | `git reflog`  |


## 撤销修改

### 删除未跟踪文件

```
git clean
```

这一指令默认只删除工作目录下未跟踪文件，可配合如下参数使用，常见的有如下几个：

- `-d` 删除未跟踪文件及目录
- `-i` 进入交互模式
- `-f` 强制执行，如果 clean.requireForce 设置为 true （默认情况）则需要配合此参数
- `-n` 查看会被删除的文件

这些指令可以配合使用，比如可以用 `git clean -df` 完成删除所有未跟踪文件的操作。

### 撤销未提交的修改

```
git checkout .
git reset --hard
```

两个指令其一都可以完成这一操作，操作对象为所有文件，如果针对单独一个文件可以用 `git checkout filename` 来操作。对于 `git reset` 指令中如果不加 `--hard` 就是默认的 `--soft` ，即回到之前版本但不修改文件。

### 撤销提交

```
git reset --hard <SHA>
```

这一指令可以将工作区还原到所指定的 SHA ，如果回到之前版本后悔也可以通过这一指令，也可以用 `HEAD^` 指定为前一个版本或者 `HEAD~10` 指定前十个版本 （ `HEAD` 代表当前当前版本）。

### 修改上一次提交信息

```
git commit --amend
```

这一指令接下来操作与普通提交相同，也可以用 `git commit --ament -m "message"` 来操作。

---

## 分支操作

### 常用指令

|操作|指令|
|:---:|:---:|
|查看分支   | `git branch`  |
|创建分支   | `git branch <branch>`  |
|切换分支   | `git checkout <branch>`  |
|创建并切换   | `git checkout -b <branch>`  |
|合并至当前分支|`git merge <branch>`|
|删除分支   | `git branch -d <branch>`  |
|强制删除   | `git branch -D <branch>`  |

### 冲突解决

当在两个分支中的修改在合并时遇到冲突就会提示 CONFLICT ，这时我们可以用 `git status` 查看冲突的位置，修改完成后再次提交即可。

---

## 远程仓库

远程库的使用主要分为设置、拉取和推送三个部分。

### 远程库设置

```
git remote add <name> <url>
```

远程仓库名字 `<name>` 默认为 `origin` ，但也可以自行命名。远程库地址 `<url>` 有 SSH 和 HTTPS 两种方式，其中 SSH 可以实现免密操作但是必须先设置密钥。

可以以如下方式添加多个远程仓库实现一次向多个仓库推送。

```
git remote add <name> <url1>
git remote set-url --add <add> <url2>
git push <name> --<name>
```

### 拉取

对于一个网络上的库，如果本地没有，则需要以克隆的方式拉取到本地。

```
git clone <url>
```

如果对于本地已经有的库，但是落后于远程库，需要更新，则可以用如下两个指令拉取。

```
git pull
git fetch
```

两者都可以完成这一任务，区别在于 `git pull` 会自动与本地完成 `merge` 这一操作，而 `git fetch` 则需要自己手动完成。

### 推送

```
git push <remote> <branch>
```

在第一次推送时可以加上 `-u` ，就可以和远程库绑定，以后只用 `git push` 就可以推送了。

---

## 标签

|操作|指令|
|:---:|:---:|
|查看所有标签   | `git tag`  |
|给当前版本设置标签   | `git tag <tag>`  |
|给之前某版本设置标签   | `git tag <tag> <SHA>`  |
|查看标签信息   | `git show <tag>`  |
|删除标签   | `git tag -d <tag>`  |
|推送标签   | `git push origin <tag>`  |
|推送所有标签   | `git push origin --tags`  |
|删除远程标签   | `git tag -d <tag>`<br>`git push origin :refs/tags/<tag>`  |

## 暂存工作目录

当我们工作到一半，必须切换到另一分支进行修改时，就需要用到 `git stash` 来暂存工作目录，以保存只进行到一半的工作。

|操作|指令|
|:---:|:---:|
|暂存当前工作目录   | `git stash`  |
|查看暂存工作目录   | `git stash list`  |
|恢复工作目录   |`git stash apply <stash>`   |
|删除工作目录   | `git stash drop <stash>`   |
|恢复并删除   | `git stash pop <stash>`   |

## 后记

Git 指令丰富，这篇文章也只是我作为一个初学者，总结了最常用的操作，之后有遇到其他操作我还会继续补充，当然最详细的解释在[官方文档](https://git-scm.com/docs/).
