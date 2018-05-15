---
layout:     post
title:      "STL解析 —— queue"
subtitle:   "Standard Template Library —— queue"
date:       2018-5-15
author:     "ZingLix"
header-img: "img/post-8.jpg"
catalog: true
tags:
    - STL
---

队列（queue）是一种先进先出（First In First Out, FIFO）的数据结构。

![](/img/in-post/STL-queue/1.png)

如上图所示，可以在最后添加元素，或者删除位于最前面的元素，而且只有对于首尾两个元素的访问权，所以并不可以对 queue 进行遍历的操作。

综上，queue 提供如下关于操作元素的操作：

- `push`：在最后添加元素
- `pop`：删除最前面的元素
- `front`：获得最前面的元素
- `back`：获得最后面的元素

## STL 中的 queue

同 stack 和 priority_queue 一样同为容器适配器，即利用其他容器对其接口封装实现。根据 queue 特性，要求容器提供如下操作：

- `back`
- `front`
- `push_back`
- `pop_front`

在 STL 中 `deque` 和 `list` 满足这些要求。

另外由于不可以对 queue 遍历，所以**不提供迭代器**。

## 声明 & 实现

模板参数中可以通过`Container`来指定容器，否则就以`deque`作为默认容器。内部以一个`Container`类型的数据成员作为容器，在其上封装各种操作。

``` cpp
template<class T, class Container = deque<T>>
class queue
{
public:
	using container_type = Container;
	using value_type =typename Container::value_type;
	using size_type = typename Container::size_type;
	using reference = typename Container::reference;
	using const_reference = typename Container::const_reference;

protected:
	Container c;

public:
	explicit queue(const Container& cont) :c(cont) {}
	explicit queue(Container&& cont = Container()) :c(cont) {}
	queue(const queue& other) :c(other.c) {}
	queue(queue&& other) noexcept :c(std::move(other.c)) {}

	~queue(){}

	queue& operator=(const queue& other) {
		c = other;
		return *this;
	}
	queue& operator=(queue&& other) noexcept {
		c = std::move(other);
		return *this;
	}

	reference front() { return c.front(); }
	reference back() { return c.back(); }

	const_reference front() const { return c.front(); }
	const_reference back() const { return c.back(); }

	bool empty() { return c.empty(); }
	size_type size() { return c.size(); }

	void push(const value_type& value) { c.push_back(value); }
	void push(value_type&& value) { c.push_back(value); }
	void pop() { c.pop_front(); }
};
```

> [View all code on Github](https://github.com/ZingLix/LixSTL/blob/master/LixSTL/src/queue.hpp)