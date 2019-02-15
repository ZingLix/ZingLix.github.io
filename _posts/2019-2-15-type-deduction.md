---
layout: post
title: "现代 C++ 中的类型推导"
subtitle: "Type Deduction in Modern C++"
date: 2019-2-15
author: "ZingLix"
header-img: "img/post-14.png"
catalog: true
tags:
  - C++
---

## 模板类型推导

如下是一个普通的函数模板

```cpp
template<typename T>
void func(ParamType p);
```

当我们以 `func(x)` 方式调用时，编译器会帮我们自动推导出 `T` 和 `ParamType` 两个类型，且两者可能并不一样，因为 `ParamType` 可能会带有 `const` 或者 `&` 引用修饰符。

### 参数类型为引用或指针

```cpp
template<typename T>
void func(T& p);
```

这种情况不包括通用引用（Universal Reference, `&&`），推导时遵循：

1. 如果传递的参数 `x` 是引用，那么忽视引用部分
2. 之后匹配参数 `ParamType` 并决定 `T`

例如对于如下的不同参数

```cpp
int x = 0;
const int cx = x;
const int& rx = x;

f(x);   //ParamType 为 int&, T 为 int
f(cx);  //ParamType 为 const int&, T 为 const int
f(rx);  //ParamType 为 const int&, T 为 const int
```

这一情况以最为自然的方式进行推导，没有什么特殊的情况。

### 参数类型为通用引用

```cpp
template<typename T>
void func(T&& p);
```

通用引用（Universal Reference）存在于模板参数中（`T&&`），遵循如下规则：

- 如果参数 `x` 为左值，那么 `T` 和 `ParamType` 都被推导成左值引用。
- 如果参数 `x` 为右值，那么可套用上一条规则，即最为常规的情况。

```cpp
f(x);       //x 为左值，ParamType 为 int&，T 为 int&
f(cx);      //cx 为左值，ParamType 为 const int&，T 为 const int&
f(rx);      //rx 为左值，ParamType 为 const int&，T 为 const int&
f(0);       //0 为右值，ParamType 为 int&&, T 为 int
```

这一条有一些诡异的是虽然用了 `&&` 右值引用，但是推导时却会推导出左值引用，也因此 Meyers 提出了 **通用引用** 这一概念。通用引用存在于如下两个上下文中

```cpp
template<typename T>
void f(T&& param);

auto&& rx = x;
```

这两个的相似点在于都使用了类型推导，在未知确切类型时使用 `&&` 就是通用引用，类型推导适用上述规则，而对于具体的类型则为普通的右值引用。

> 值得一提的是例如 vector 的 `push_back(T&&)` 虽然参数是用到了类型推导的右值引用，但是实际上当 vector 被实例化的时候这一函数就已被实例化，也就是说当你在使用该函数时函数签名是确定的，实际上并未使用到类型推导，也就不是通用引用。但对于 `emplace_back(Args&&... args)` 只有当你调用函数给出参数后该函数才能被实例化，所以此处用到了类型推导，是全局引用。

通用引用存在两重含义，其一是最基础的右值引用，其二则代表了左值或右值引用。这一特性使得代码中虽然看似 `T&&` 但是既可以绑定到左值又可以绑定到右值。

尽管通用引用这一概念看上去很好，对于理解也没有任何偏差。但实际上这一概念并不存在于 C++ 标准中，真正导致这样推导的原因在于 **引用折叠（Reference Collapsing）**。默认情况下 C++ 并不允许 `int& &x` 这样的到引用的引用，但是在模板推导中则允许，并有如下规则

- 到右值引用的右值引用折叠成右值引用
- 其他所有情况折叠左值引用

在模板参数中给的是右值引用，此时只有当我们给出的参数为右值引用时才会折叠成右值引用，其他情况都折叠成了左值引用。这也就解释了为什么要在模板推导中才有通用引用这一说法，而且为什么两种引用都能绑定。这一特性是实现[完美转发](/2019/02/15/move-and-forward/#完美转发)等功能的关键，也有效的减少了这种类型的代码量。

### 其他情况

此时模板参数既非指针又非引用，那么就是值传递。

```cpp
template<typename T>
void func(T param);
```

此时无论如何都会传递出一个新的复制出的对象，因此推导规则为：

- 如果是参数 `x` 为引用，那么舍弃引用部分
- 如果参数 `x` 为 const 或 volatile，也将其舍弃 

因此对于之前的 `x`、`cx`、`rx` 推导结果 `ParamType` 和 `T` 都是 int。值得注意的是对于指向常量的引用和指向常量的指针，其本身的确不是常值，即此指针可以指向其他东西，但是指向的内容仍是常值不可改变。

当传递参数是数组或者函数时，推导会将其退化成指针（指向数组第一个元素的指针或函数指针），除非是目标是引用。

## `auto` 类型推导

`auto` 拥有与模板相同的推导规则，如下两个是相同的情况。

```cpp
const auto x = 12;

template<typename T>
void func(const T p);
func(12);
```

在 `auto` 类型推导中 `auto` 扮演了 `T` 的角色，修饰符扮演了 `ParamType` 的角色，给出的初始化值即传递给函数的参数。

唯一不同的是对于 `std::initializer_list` 的处理，在 `auto` 中用 `=` 可以显式初始化成 `initializer_list`。不使用 `=` 从 C++17 开始不用等号则只保留对只含单个变量的初始化值列表的推导，推导成该元素的类型（初始化值列表视作该元素的构造函数参数）。传递给函数模板的初始化值列表则不会通过编译。

```cpp
auto a = {1, 2}; // 结果为 std::initializer_list<int>
auto b = {1};    // 结果为 std::initializer_list<int>
//auto c{1, 2};    // 结果为 std::initializer_list<int>，C++17 起错误
auto d{1};       // C++17 起结果为 int ，之前为 initializer_list<int>

template<typename T>
void f1(T param);
template<typename T>
void f2(std:initializer_list<T> list);

f1({1,2,3});    //错误！无法推导
f2({1,2,3});    //推导成 void f2(std:initializer_list<int>)
```

从 C++14 开始 `auto` 还可以推导函数的返回值类型，或者用在 lambda 表达式时，应用的是 **模板类型推导** 规则，所以如下代码不能通过编译。

```cpp
auto f(){
    return {1, 2};    //无法通过编译
} 
```

## `decltype` 类型推导

`decltype` 几乎可以得到所给的实际类型，不会退化和修改，而且用于表达式和变量均可。在使用 `auto` 的时候会对类型进行修改，与 `decltype` 配合就可以实现让编译器推导并得到精确的类型。

```cpp
const int& cx = x;
auto x1 = cx;            //类型为 int
decltype(auto) x2 = cx;  //类型为 const int &
```

若参数是类型为 `T` 的表达式，且

- 如果表达式的值类别为亡值，则结果为 `T&&` ；
- 如果表达式的值类别为左值，则结果为 `T&` ；
- 如果表达式的值类别为纯右值，则结果为 `T` 。

用括号包含一个变量时视作是一个结果为左值的表达式，因此对于一个类型为 `int` 的变量 `x`，`decltype(x)` 结果为 `int`，而 `decltype((x))` 结果则为 `int&`。
