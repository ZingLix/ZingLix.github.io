---
layout: "post"
title: "Jekyll 环境搭建"
date: "2017-08-31"
subtitle:   ""
author:     "ZingLix"
header-img: "img/post-9.jpg"
catalog: true
tags:
    - Jekyll
---

Jekyll 本地环境安装需要如下几个组件：
- [Ruby & Devkit](https://rubyinstaller.org/downloads/)
- [Gem](https://rubygems.org/pages/download)

## Ruby 环境搭建

首先打开之前下载的 Ruby 和 Devkit 安装文件，以默认设置安装即可，如要修改必须保证勾选添加环境变量。之后以命令行的形式（在此目录中 Shift + 右键以命令行或者 Powershell 运行）进入 Devkit 的解压目录中，运行如下命令：

```
ruby dk.rb init
ruby dk.rb install
```

如无报错就完成了 Ruby 的环境搭建。

## Gem 安装

打开之前下载的 Gem 文件进行解压缩，然后直接运行 Setup.rb 就可以开始安装 Gem 。安装完成后可以在命令行环境下运行 `gem -v` 来检查是否安装成功，输出版本号即可。

Gem 默认的源在国内下载速度堪忧，所以可以用如下指令换成 [Ruby China](http://gems.ruby-china.org/) 提供的源。

```
gem sources --add https://gems.ruby-china.org/ --remove https://rubygems.org/
```

之后可以用 `gem sources -l` 来检查是否只存在 `https://gems.ruby-china.org` 一个源。如果遇到 SSL 问题可以将链接中 https 换成 http 来避免，具体的参见官方给出的[解决方案](http://gems.ruby-china.org/)。

## Jekyll 安装

直接运行 `gem install jekyll` 就可以完成 Jekyll 所有依赖的安装，同样之后可以用 `jekyll -v` 来检查是否安装成功。

安装成功之后进入博客文件夹（与 _config.yml 同级目录）运行 `jekyll serve -w` ，之后访问 127.0.0.1:4000 来本地预览网页，在 _config.yml 中可以加一个 port （比如 port: 8888）属性来改变预览的端口。

在预览的时候可能仍会报错说缺少插件，比如 jekyll-paginate ，只需要再运行 `gem install jekyll-paginate` 安装此插件，再预览即可。
