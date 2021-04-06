---
layout:     post
title:      "STL解析 —— priority_queue"
subtitle:   "Standard Template Library —— priority_queue"
date:       2018-5-29
author:     "ZingLix"
header-img: "img/post-8.jpg"
catalog: true
tags:
    - STL
---

优先队列（priority queue）是一种队列，但是每次弹出的是优先级最高的元素，优先级可以有不同表现，比如在最小堆中是值最小的元素，而在最大堆中则是值最大的元素。关于其数据结构本身已有过[详细讨论](/2017/05/15/Priority-Queue/)。

## STL 中的优先队列

``` cpp
template<
    class T,
    class Container = std::vector<T>,
    class Compare = std::less<typename Container::value_type>
> class priority_queue;
```

以上是优先队列的声明。分别表示：

- `T`：所存储的数据类型
- `Container`：用于存储二叉堆的容器，默认是 vector 
- `Compare`：比较函数，默认是小于

STL 中的优先队列与通常一样，利用二叉堆来实现，内存结构为数组。又出于数组不可增长，所以采用 vector 作为默认底层容器。若要替换，则容器必须为顺序容器，且具有如下函数：

- `front`
- `push_back`
- `pop_back`

在 STL 中，除 vector 外，只有 deque 满足此要求。而因为是借由其他容器加以封装而实现的，所以 priority_queue 被分类至 **容器适配器** 。

## 函数实现

虽然说是二叉堆，但在实现中并不自己维护堆性质，而是调用 `<algorithm>` 中提供的[heap算法](/2018/05/27/stl-heap/)，从而使实现变得极为便捷。

### top

返回顶元素的引用。返回容器中第一个元素即可。

``` cpp
const_reference top() const { return c.front(); }
```

### push

将一个元素加入到队列中。将其插入到容器末尾，然后调用`push_heap`即可。

``` cpp
void push(const value_type& value) {
    c.push_back(value);
    push_heap(c.begin(), c.end(), comp);
}
```

### pop

移除顶元素。`pop_heap`会将顶元素移到容器末尾，并不删除，所以需要对容器`pop_back`。

``` cpp
void pop() {
    pop_heap(c.begin(), c.end(), comp);
    c.pop_back();
}
```

### emplace

构造一个新元素并插入到队列中。与 `push` 类似。

``` cpp
template< class... Args >
void emplace(Args&&... args) {
    c.emplace_back(std::forward<Args>(args)...);
    push_heap(c.begin(), c.end(), comp);
}
```

### empty & size

返回队列是否为空和大小。底层容器都具有相关的函数。

``` cpp
bool empty() { return c.empty(); }
size_type size() const { return c.size(); }
```
