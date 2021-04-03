---
layout: post
title: "std::move() 与 std::forward()"
subtitle: "移动语义与完美转发"
date: 2019-2-15
author: "ZingLix"
header-img: "img/post-15.png"
catalog: true
tags:
  - C++
---

## 移动语义

移动语义是 C++11 中新引入的一个概念，目的是当一个对象赋值给另一个对象后，自身不再被使用的情况。原本需要的操作是先调用新对象的复制构造函数再将原对象销毁，而有了移动语义后，则是将原对象的资源“移动”给新对象，例如 `std::vector` 将指向数组的指针赋值给新对象，而非申请一块新的内存再将原地址内容复制过去，这样就以避免昂贵的复制操作。在用到了临时对象（右值）时的赋值时这一语义尤为关键。

在传统 C++ 中引用只可以绑定到左值上，但在移动语义中需要区别左值引用，所以 C++11 中引入了 `&&` 来表示一个到右值的引用，并且可以延长对象的生命期。

```cpp
std::string s1 = "Test";
//std::string&& r1 = s1;         // 错误：不能绑定到左值
std::string&& r1 = s1 + s1;      // okay ：右值引用延长生存期
r1 += "Test";                    // okay ：能通过到非 const 的引用修改
```

### std::move

虽然说有了右值引用，但是产生了一个问题，该如何调用右值版本的函数？右值是一个没有名字的将亡的对象，而对于 `int&& rx = 12` 来说 `12` 才是那个右值，而 `rx` 只是引用了 `12`，其本身仍是个左值。因此标准库中提供了 `std::move()` 这一设施以实现转型。

```cpp
func(int& rx);
func(int&& rx);

int x = 12;
int& lrx = x;
int&& rrx = 12;

func(12);           //调用 func(int&&)
func(lrx);          //调用 func(int&)
func(rrx);          //调用 func(int&)
func(std::move(x)); //调用 func(int&&)
```

用 `std::move()` 就可以无条件的将左值参数转型成右值引用，但是这一函数本身并没有移动对象，而只是进行了转型。下面是可能的实现。

```cpp
template <typename T>
decltype(auto) move(T&& param)
{
   using return_type = std::remove_reference<T>::type&&;
   return static_cast<return_type>(param);
}
```

可以看到只是类型的改变，而没有任何与移动有关的操作，甚至都没有运行时的性能损耗，真正负责移动的是那个函数。运用 `std::move()` 只是为了让编译器正确重载到移动的版本上。

## 完美转发

之前提到右值是没有名字的，所以在下面的情况下

```cpp
template<typename ...Args>
void func_wrapper(Args&&... args){
    log("do something...");
    func(args...);
    //or
    func(std::move(args)...);
}
```

我希望对外的函数 `func_wrapper` 能够先做一些事例如写日志再转调用真正实现的函数。但问题是函数模板既接受左值引用，又接受右值引用，那么在转调用的时候该如何确定参数类型呢？如果直接转调用，那么都是左值（即使传入右值，参数被推导成右值引用，右值引用被认为是左值），如果全部使用 `std::move` 那么传入左值也被移动。如果为两种引用都写一个版本，不利于维护不说，如果本身这个函数就接受任意个数量的参数也无法实现。

### std::forward

这就引出了 `std::forward` 完美转发，以实现有条件的转型，传入左值则转发成左值，传入右值则转发成右值。

```cpp
template<typename ...Args>
void func_wrapper(Args&&... args){
    log("do something...");
    func(std::forward<Args>(args)...);
}
```

在[这里](/2019/02/15/type-deduction/#参数类型为通用引用)提到了引用折叠是如何影响参数推导的。模板类型推导时除了右值到右值的引用折叠成右值引用外，其他的一律折叠成左值引用。这正是实现 `std::forward` 的关键。

```cpp
template<typename T>
T&& forward(remove_reference_t<T>& param){
    return static_cast<T&&>(param);
}
```

值得注意的是在使用转发的是必须自己显式的给出类型 `T`，因为这一信息帮助识别引用类型。

以下述函数为例

```cpp
template<typename T>
void f1(T&& param){
    f2(std::forward<T>(param));
}
```

当传入左值引用时，会被替换成 `void f1(int&& &param)`，其中 `T` 为 `int&`，此时 `std::forward` 被替换为

```cpp
int& && forward(remove_reference_t<int&>& param){
    return static_cast<int& &&>(param);
}
//折叠并计算后
int& forward(int& param){
    return static_cast<int&>(param);
}
```

从而得到了左值引用的转发。当传入右值引用时替换成 `void f1(int&& param)`，其中 `T` 为 `int`，所以 `std::forward` 被替换成

```cpp
int&& forward(remove_reference_t<int>& param){
    return static_cast<int&&>(param);
}
//折叠并计算后
int&& forward(int& param){
    return static_cast<int&&>(param);
}
```

得到了右值引用的转发，从而实现了根据调用者给出的参数进行有条件的转型以实现了参数的完美转发。

## 总结

移动语义是新引入的概念，`std::move` 实现了向右值的无条件转型，`std::forward` 实现了只有右值引用才转型成右值的有条件转型，二者均没有运行时的额外消耗。

一般 `std::move` 用在右值引用上，`std::forward` 用在[通用引用](/2019/02/15/type-deduction/#参数类型为通用引用)上。