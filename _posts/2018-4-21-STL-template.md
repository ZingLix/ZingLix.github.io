---
layout:     post
title:      "STL解析 —— 模板在traits技法中的应用"
subtitle:   "Standard Template Library —— template in traits"
date:       2018-4-21
author:     "ZingLix"
header-img: "img/post-8.jpg"
catalog: true
tags:
    - STL
---

## 介绍

在STL的实现中，traits技法是最核心的技术之一，其实现大量的运用到了模板这一特性，在Modern C++中引入的变长模板参数等等都为其实现创造了方便。

以C++11标准中`std::pointer_traits`为例，如下是标准中非特化版本中成员类型和成员别名模板的定义。

|类型|定义|
|---|---|
|`pointer`|`Ptr`|
|`element_type`|若存在则为 `Ptr::element_type` 。否则若 `Ptr` 是模板实例化 `Template<T, Args...>` 则为 `T`|
|`differencenc_type`|若存在则为 `Ptr::difference_type` ，否则为 `std::ptrdiff_t`|
|`template <class U> using rebind`|若存在则为 `Ptr::rebind<U>` ，否则若 `Ptr` 是模板实例化 `Template<T, Args...>` 则为 `Template<U, Args...>`|


可以看到要求判断是否存在某一成员，然而其作为定义并不能用if语句实现，同时C++中也没有提供判断是否存在相关类型的函数，涉及到类型信息传递只能使用模板，特化某个情况下来达到目的。

## 声明

下面是`pointer_traits`非特化版本的声明，去除了与本文无关的内容，涉及到判断的转交由另一个模板来生成。

``` cpp
template<class Ptr>
struct pointer_traits
{
    using element_type = typename _element_type<Ptr>::type;
    using pointer = Ptr;
    using difference_type = typename _ptr_difference_type<Ptr>::type;

    template<class _Other>
    using rebind = typename _rebind_alias<Ptr, _Other>::type;
    // Other....
};
```

另外在这引入一个用于模板特化的声明，虽然它只是给void起了个别名，但是他前面有模板使其带有了类型信息。这可以看成一个trick，我们会在之后看到如何运用这个。

``` cpp
template<class... _Types>
using void_t = void;
```

## element_type

这个模板用来得到元素类型`element_type`，我们先来回忆下它的要求：若存在则为 `Ptr::element_type` 。否则若 `Ptr` 是模板实例化 `Template<T, Args...>` 则为 `T`。然后根据下面的实现来理解整个过程。

``` cpp
template<class T, class = void>
struct _element_type
{
	using type = typename _first_parameter<T>::type;
};

template<class T>
struct _element_type<T, void_t<typename T::element_type>>
{
	using type = typename T::element_type;
};
```

先假设我们传入的类型具有`T::element_type`，那么就会产生对应的`void_t<typename T::element_type>`，从而满足特化条件调用第二个生成模板，那么就可以使`type`为`T::element_type`。相反，如果不存在`T::element_type`，那么就会调用第一个非特化版本实例化模板。第一个版本会利用另一个模板提取出类型，将在下面讨论。

从上面的例子可以看到，`void_t`虽然本身无意义，但是我们使其带有了类型信息，那么编译器就会检查是否满足特化条件，从而可以用来判断是否存在某一元素类型，以达到生成不同版本的目的。

现在我们再回头来看之前提到的`_first_parameter<T>`。

``` cpp
template<class T>
struct _first_parameter;

template<template<class, class...> class T,
	class First, class... Other>
struct _first_parameter<T<First, Other...>>
{
	using type = First;
};
```

第一个声明并没有给出实现因为我们只要特定情况下的版本，那么如果实例化了直接报错即可，我们将重点放到第二个版本。第一个类型`T`是另一个模板`<class,class...>`，以满足要求中判断`Ptr`是否为`Template<T, Args...>`，第二个类型`First`为`T`模板中第一个类型，最后可变长模板以适应不同类型数量的情况。在`T`类型中并没有显示给出类型名，因为我们在特化条件中指明了`First`和`Other...`作为其类型，其他的交由编译器自行推导。

## ptr_difference_type

这个相比前者实现较为简单，但思想相同，依旧根据要求来实现：若存在则为 `Ptr::difference_type` ，否则为 `std::ptrdiff_t`。

``` cpp
template<class T, class = void>
struct _ptr_difference_type
{
	using type = ptrdiff_t;
};

template<class T>
struct _ptr_difference_type<T, void_t<typename T::difference_type>>
{
	using type = typename T::difference_type;
};
```

依旧是利用`void_t`来判断是否具有`T::difference_type`这一元素类型，从而调用特化和非特化两个版本使得`type`为不同的类型。

## rebind

这个别名模板用于重新绑定类型名，所以根据要求，如果已有`Ptr::rebind<U>`那么直接调用这个即可，如果没有就要将`Template<T, Args...>` 中`T`替换得到 `Template<U, Args...>`。

``` cpp
template<class T, class Other, class = void>
struct _rebind_alias
{
	using type = typename _replace_first_parameter<Other, T>::type;
};

template<class T, class Other>
struct _rebind_alias<T, Other, void_t<typename T::template rebind<Other>>>
{
	using type = typename T::template rebind<Other>;
};
```

同样用和之前一样的技巧利用`void_t`获得类型信息来对应不同的特化版本。我们再来仔细看第一个版本中`_replace_first_parameter`。

这个目的很简单，就是将模板中第一个类型替换。

``` cpp
template<class NewFirst, class T>
struct _replace_first_parameter;

template<class NewFirst, template<class, class...>class T,
	class OldFirst, class ... Other>
struct _replace_first_parameter<NewFirst, T<OldFirst, Other...>>
{
	using type = T<NewFirst, Other...>;
};
```

第一个版本不应被实例化，所以没有实现。第二个版本第一个参数为新的类型，之后的与之前获取`_first_element`技巧相同，这样我们就能直接使用类型名，达到目的。

## 后记

模板在C++中有关类型信息传递有着不可或缺的作用，在STL的实现中也大量被使用。在实现过程中，其实我们只是给出了相应的特化条件，具体的类型推导和调用不同版本都由编译器在编译期自行完成，没有运行时的额外开销。
