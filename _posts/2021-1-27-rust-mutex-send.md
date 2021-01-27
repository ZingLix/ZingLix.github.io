---
layout: post
title: "Mutex&lt;Rc&gt; 为什么不能在线程间传递？"
subtitle: "重新理解 Rust 中的 Sync 与 Send"
date: 2021-1-27
author: "ZingLix"
header-img: "img/post-28.jpg"
catalog: true
tags:
  - Rust
---

最近在用 Rust 写多线程程序的时候，一个编译器的错误让我感到了困惑。

## 问题

简单来说，我有一个结构体，内部有一个 `Rc` 的值，如下

```rust
struct A {
    val: Rc<u32>,
}
```

很显然，`Rc` 并不线程安全，所以加锁保护，并且用 `Arc` 在线程之间传递，所以写了如下的代码

```rust
fn main() {
    let mutex = Mutex::new(A { val: Rc::new(5) });
    let target = Arc::new(mutex);

    let t = thread::spawn(move || {
        target.lock();
        // do something...
    });

    t.join().unwrap();
}
```

然而却遭到了编译器的无情吐槽

```
error[E0277]: `std::rc::Rc<u32>` cannot be sent between threads safely
   --> src/main.rs:13:13
    |
13  |     let t = thread::spawn(move || {
    |             ^^^^^^^^^^^^^ `std::rc::Rc<u32>` cannot be sent between threads safely
    |
   ::: /home/zinglix/.rustup/toolchains/stable-x86_64-unknown-linux-gnu/lib/rustlib/src/rust/library/std/src/thread/mod.rs:593:8
    |
593 |     F: Send + 'static,
    |        ---- required by this bound in `std::thread::spawn`
    |
    = help: within `A`, the trait `std::marker::Send` is not implemented for `std::rc::Rc<u32>`
    = note: required because it appears within the type `A`
    = note: required because of the requirements on the impl of `std::marker::Send` for `std::sync::Mutex<A>`
    = note: required because of the requirements on the impl of `std::marker::Send` for `std::sync::Arc<std::sync::Mutex<A>>`
    = note: required because it appears within the type `[closure@src/main.rs:13:27: 16:6 target:std::sync::Arc<std::sync::Mutex<A>>]`
```

简单来说就是，`A` 中的 `Rc` 没有实现 `Send`，可这就让人很迷惑，我加锁就是为了让不线程安全的东西可以线程间共享，可它为什么还要我实现 `Send` 呢？

## 重新理解 Sync 与 Send

`Sync` 和 `Send` 是 Rust 多线程中十分重要的一个基础概念。

- `Sync` 表示 **在线程间共享** 是安全的。
- `Send` 表示 **传递给另一个线程** 是安全的。

`Sync` 说明不同线程可以同时使用同一个对象，例如同时读同一个常量。对于锁 `Mutex` 来说，因为几个线程可以同时对同一个锁上锁，只是锁的内部机制只会同时只允许一个线程获得锁，但这不重要，其对外的表现已满足 `Sync`。因此对于变量来说，通常套一层 `Mutex` 就可以让其可以在线程间共享。

`Send` 说明可以在线程间传递所有权，不同线程可以在不同时间使用同一个对象。线程 A 可以创建一个对象，然后传递 (send) 给线程 B，由于所有权机制，此后线程 B 就可以使用该对象而 A 不能，因为 A 中已将所有权传递给 B。不过如果对象实现了 `Clone`，那么就可以拷贝一份到另一个线程之中。`Mutex` 并没有实现 `Clone` trait，所以通常会使用 `Arc<Mutex>` 让多个线程同时拥有同一个锁。

所以很容易看出，既然同一时间使用是安全的（`Sync`），那么不同时间使用（`Send`）也一定是安全，毕竟不能传递给其他线程，那怎么几个线程同时使用呢？所以几乎没有对象会是满足 `Sync` 而不满足 `Send`。

## 回到问题

让我们去看一眼 `Mutex` 中的定义

```rust
#[stable(feature = "rust1", since = "1.0.0")]
unsafe impl<T: ?Sized + Send> Send for Mutex<T> {}
#[stable(feature = "rust1", since = "1.0.0")]
unsafe impl<T: ?Sized + Send> Sync for Mutex<T> {}
```

可以看到 `Mutex<T>` 确实可以为所有类型 `T` 添加上 `Sync` trait，但前提是 `T` 满足 `Send`。为什么？因为 `Mutex` 想要实现 `Sync` 就肯定需要满足 `Send` trait，那么其在传递时同样会传递 `T` 的所有权，因此 `T` 也需要满足 `Send`。

那么回到问题，重新观察编译器提示的错误，根本问题是 `Rc` 不满足 `Send`，所以 `Mutex` 不能实现 `Send`，然后就产生一系列不满足的问题，最终导致不能在线程间传递。

为什么 `Rc` 不满足 `Send`？`Send` 表示可以安全在线程间传递，然而对于 `Rc` 来说，如果我在当前线程有多个该 `Rc` 的拷贝，然后将一个传递给另一个线程，那么多个线程就都拥有了这个对象，然而 `Rc` 中的引用计数操作不是线程安全的，所以 `Rc` 不满足 `Send`，这也就说明 `Rc` 在整个生命周期内都只能被一个线程拥有。

那用 `Mutex<Rc>` 加锁之后，就不会多个线程同时操作这个 `Rc`，为什么也不行呢？表面上的原因在于 `Mutex` 要求 `T` 实现 `Send`。更进一步，设想一下可以实现，那么完全可以在获得锁之后，复制一份 `Rc`，然后将这份拷贝带出锁的作用范围，那么又可以几个线程同时修改引用计数了，你设想中的锁形同虚设，而 Rust 成功救你于水火之中:upside_down_face:。

> 嗯？你说 `Mutex<Arc>` 也会出这个问题？`Arc` 拷贝是线程安全的，并不会出问题。
>
> 什么？你说复制一份然后就可以多线程同时修改了？从锁中复制一份 `Arc` 带出来，然而 `Arc` 并不会给你 mut ref，并没有办法修改它。真想修改？再套个 `Mutex` 吧 :blush:

## 总结

根本问题出在 `Rc` 并不能安全地在线程间传递，所以换成 `Mutex<Arc>` 就可以了 :upside_down_face:
