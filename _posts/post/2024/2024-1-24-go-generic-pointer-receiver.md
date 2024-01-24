---
layout: post
title: "Go 在使用泛型时无法与 Pointer Receiver 共存的解决方法"
subtitle: "How to use pointer receiver and generics in Go"
date: 2024-1-24
author: "ZingLix"
header-img: "img/post-18.jpg"
catalog: true
tags:
  - Go
---

## 问题描述

在使用 Go 的泛型时，如果泛型类型存在 constraint，而传入的类型在实现这个 constraint 时使用的是 pointer receiver，那么就会遇到 `XXX does not satisfy XXX (method XXX has pointer receiver)` 的报错，就比如下面这个例子希望用 `Create` 函数完成所有创建 `Person` 的操作

```go
type Person interface {
	SetID(id int)
}

type Student struct {
	ID int
}

func (p *Student) SetID(id int) {
	p.ID = id
}

func Create[T Person](id int) *T {
	var person T
	person.SetID(id)
	return &person
}
```

这里 `Student` 用 `(p *Student)` 实现了 `Person`，然而如果用 `Create[Student](id)` 这种方式调用时，编译会遇到这个报错

```
Student does not satisfy Person (method SetID has pointer receiver)
```

## 问题解释

问题就在于这段代码中的 `(p *Student)`

```go
func (p *Student) SetID(id int) {
	p.ID = id
}
```

在 Go 中会认为是 `*Student` 实现了 `SetID` 方法，或者说实现了 `Person` interface，而不是 `Student`，因此提示 `Student` 并不满足 `Person`。

那一个办法是把实现 interface 传入的改成 value receiver

```go
func (p Student) SetID(id int) {  // 传入的 p 类型去掉了 *
	p.ID = id
}
```

这样可以通过编译且正常运行，但问题是变成了值传递后，`SetID` 并不会作用于传入的那个变量，这个函数也形同虚设。

另一个解决方案是可以把调用函数时改成 `Create[*Student](1)`，加上这个 `*`，报错也会随之消除。但问题就解决了吗？

再仔细看这个函数在传入类型后会变成什么样

```go
// T -> *Student

func Create[T Person](id int) *T {
	var person T // var person *Student
	person.SetID(id)
	return &person
}
```

这里暂且不论原本的返回类型 `*T` 会变成 `**Student` 的问题，这个很容易通过调整返回值类型解决。

核心问题在于第二行我们声明了一个 `*Student` 类型的指针，但实例化在哪？我们创建了一个空指针，所以在运行时会遇到 `runtime error: invalid memory address or nil pointer dereference`。同时由于语言限制，我们手上的 `T*` 并不能转成 `T` 然后让我们完成实例化。

那么能不能传入 `T`，然后转成指针再调用 interface 的方法呢？

```go
func Create[T Person](id int) *T {
	person := new(T) 
	person.SetID(id)    // 报错
	return &person
}
```

然而编译器又给了一个错误 `person.SetID undefined (type *T is pointer to type parameter, not type parameter)`，这个问题在于 `SetID` 是定义给 `Student` 的，不是给 `Student*` 用的。

很遗憾，由于 Go 语言层面的缺陷，在仅使用 `T` 这一个参数时并不能完成我们想要的东西，如果有办法，请通过网页最下方的邮件告诉我，不甚感激。

## 解决方案

问题在于用 `T` 编译器不认 constraint，用 `T*` 又拿不到 `T` 进行实例化，那么只能去掉 `T` 的限制，同时再传入带有限制的 `T*`。思路如此，具体实现来说需要定义这么一个 interface

```go
type PersonPtr[T any] interface {
	*T
	Person
}
```

这个定义了一个指针 interface，第一行这里暂时先去掉了 constraint，允许传入任意类型 `T`，然后通过第二行使得这个 interface 允许的类型是且只能是 `*T`，让我们能从 `T` 拿到指针，再通过第三行去保证实现了 `Person` 这个 interface。

那我们就可以进一步修改函数，将传入的类型改为 `PersonPtr`

```go
func Create[Ptr PersonPtr[T]](id int) *T {
	var ptr Ptr = new(T)
	ptr.SetID(id)
	return ptr
}
```

但这仍然不够，编译器会提示 `undefined: T`，因为我们没有定义 `T`，所以必须在函数的泛型列表中加上 `T`，这个函数只能变为

```go
func Create[T any, Ptr PersonPtr[T]](id int) *T {
	var ptr Ptr = new(T)
	ptr.SetID(id)
	return ptr
}
```

调用时就变成了 

```go
stu := Create[Student, *Student](1)
```

通过这个 trick，虽然很丑，但我们终于实现了 Go 中的泛型与 pointer receiver 的共存...

## 总结

珍爱生命，远离 Go 的泛型！
