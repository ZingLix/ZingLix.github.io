---
layout:     post
title:      "The Witness 谜题求解器"
subtitle:   "The Witness Solver"
date:       2017-7-21
author:     "ZingLix"
header-img: "img/post-tw.jpg"
catalog: true
tags:
    - 项目
---

> [Github and English Version Here](https://github.com/ZingLix/TheWitnessSolver)

## 介绍

The Witness（中文译名：见证者）是一款解密类的游戏，谜题主要形式是一笔画，如下图所示。

![1.jpg](/img/in-post/WitnessSolver/1.jpg)

一笔画中有许多不同的形状，代表不同的规则。这个程序被设计用来解答这一谜题。

由于这是我第一个 WPF/C# 程序，代码仍有诸多不足，正在努力改善。


## 规则

| 形状     | 位置  |  规则 |
| ----------------- |:-------:|:-------------:|
| 六边形      | 点、边 | 必须经过|
| 八角星      |   方块    | 在路径分隔的每个区域中相同颜色两两配对|
| 正方形| 方块    |  在路径分割的每个区域中只能有同种颜色|
| 三角形|       方块    | 所处方块四周通过次数与三角数量相同|
| 俄罗斯方块|       方块     | 路径分隔区域形状与俄罗斯方块形状相同，多个则进行组合|
| 除错器 |      边、方块    | 可对应消除所处区域一个未满足的条件|

## 下一步
* UI重新设计
* 代码重构

## 版权
LGPL Licenses.
