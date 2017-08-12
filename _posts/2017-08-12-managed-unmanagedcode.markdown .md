---
layout: "post"
title: "托管代码和非托管代码区别"
date: "2017-08-12 12:35"
subtitle:   "Managed & Unmanaged Code"
date:       2017-8-12
author:     "ZingLix"
header-img: "img/post-9.jpg"
catalog: true
tags:
    - .NET
---

最近研究了一番 C++/CLI 和 .NET 相关的东西，经常看到什么托管代码、非托管代码，这是在微软 .NET Framework 环境下的术语。

## 托管代码

托管代码（Managed Code）是在程序运行过程中，由公共语言运行时（Common Language Runtime, CLR）运行的代码。CLR 可以提供诸如垃圾回收、异常处理、类型安全、数组边界等等的检查从而保证代码的安全，所以程序是在受控的环境下运行。 CLR 同时负责提取托管代码，编译成机器代码并执行的功能。典型的托管代码有 C# 、 Visual Basic。

## 非托管代码

相对的，非托管代码（Unmanaged Code）是直接交由操作系统运行的代码。所有不是托管代码的都是非托管代码。没有 CLR 提供的服务，所以内存回收等事情就需要由程序员来控制。典型的非托管代码有 C 和 C++ 。

## 中间语言

中间语言（Intermediate Language）是编译高级 .NET 语言所产生的代码，其独立于任何一个运行时顶层的任何一个语言。在生成中间语言后，就交由 CLR 启用实时（JIT）编译过程。

## 总结

我认为对于 Managed Code 的翻译，受控代码可能更为直观，因为对于 Manage Code 都在受控环境下运行，都受到微软的控制。相对的，如 C++ 等 Unmanaged Code ，都并不受到微软的控制。

此外两者实际执行也有所不同，主要在于受控代码运行在运行时上，非受控代码则直接由操作系统载入内存。

- $$ Managed Code\xrightarrow{编译} 中间代码 \xrightarrow{\text{CLR}} 机器代码 $$
- $$ Unmanaged Code \xrightarrow{\text{操作系统}} 机器代码 $$
