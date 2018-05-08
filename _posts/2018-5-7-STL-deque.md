---
layout:     post
title:      "STL解析 —— deque"
subtitle:   "Standard Template Library —— deque"
date:       2018-5-7
author:     "ZingLix"
header-img: "img/post-8.jpg"
catalog: true
tags:
    - STL
---

vector 是 STL 中常用的一个容器，它可以在尾部快速添加和移除元素，但是在头部进行相关操作效率便十分糟糕。deque （双端队列）用于弥补 vector 的不足，在首尾两端都可以快速添加和删除，当然底层结构也有区别。

## 底层数据结构

与 vector 连续空间不同，deque 没有所谓容量的概念，因为它是动态地由多个连续空间组合而成。

![](/img/in-post/STL-deque/1.png)

deque 的结构类似于一个二维数组，左侧 `map` 指向一个指针数组，其中每个节点( node )都指向一块连续内存空间（缓冲区）用于存储数据，后面我们可以看到如何利用 `map` 使得我们可以将多个分开的空间从逻辑上看作一个连续空间。

在 deque 中还需要有 `start` 和 `finish` 两个迭代器用于指示开始与结束的位置，以及一个 `map_size` 用来记录 `map` 内可容纳多少指针。

## deque 声明

``` cpp
template <class T, class Alloc=allocator<T>, size_t Bufsiz=0>
class deque
{
public:
    // traits 相关
    using value_type = T;
    using allocator_type = Alloc;
    using size_type = size_t;
    using difference_type = ptrdiff_t;
    using reference = value_type & ;
    using pointer =typename allocator_traits<Alloc>::pointer;
    using iterator = __deque_iterator<T, T&, T*, Bufsiz>;

    const static size_type INI_MAP_SIZE = 8;

protected:
    using map_pointer = pointer * ;
    using data_allocator = Alloc;
    // 将Alloc重新绑定为pointer的分配器
    using map_allocator = typename allocator_traits<Alloc>::template 
        rebind_alloc<pointer>;
    
    iterator start;
    iterator finish;
    map_pointer map;
    size_type map_size;
    Alloc alloc_;    //存储一个分配器实例，可忽略
}
```

### 内存分配策略

在模板参数中还提供了一个`Bufsiz`用于自定义缓冲区大小，所以在这里引入一个函数用于获取缓冲区大小。0 表示未指定，`sz`为元素大小，在这种情况下一个缓冲区512字节，所以能够存储`512/sz`个元素或者在元素过大时只有一个。当然这一策略并没有规定，例如 64 位 libstdc++ 上为对象大小 8 倍， 64 位 libc++ 上为对象大小 16 倍或 4096 字节的较大者。

``` cpp
inline size_t _deque_buf_size(size_t n, size_t sz) {
    return n != 0 ? n : (sz < 512 ? size_t(512 / sz) : size_t(1));
}
```

此外还有一个常量`INI_MAP_SIZE`用来指示初始化时中控器最小的大小。在本文实现中将其定义为 8 ，即表示即使只有一个元素，deque 中也有 8 个缓冲区，以提高扩充元素时的效率。

``` cpp
static size_type buffer_size() { return _deque_buf_size(Bufsiz, sizeof(T)); }
static size_type initial_map_size() { return INI_MAP_SIZE; }
```

此外 deque 有两种不同的分配内存策略，一种是在构造时便对所有中控器中指针都分配好缓冲区，另一种是仅分配用到的缓冲区。前者在添加元素时更少的遇到分配内存的情况，所以效率更高，但代价是闲置的内存会过多。这两种策略不同不影响到内存结构，本文采用后者。

## 迭代器

迭代器最为靠近底层数据结构，所以是使得我们能够造就 deque 是一个连续空间假象的关键。为了使得其看起来是连续的，我们只需要控制好需要调整缓冲区的情况即可。从上图可以看出，迭代器中有如下四个成员：

- `cur` ：用于指向迭代器所指元素。
- `first` & `last` ：指向当前缓冲区的头与尾。
- `node` ：指向中控器中指向本缓冲区的指针。

有了如上信息我们就可以掌握何时需要调整缓冲区。

### 声明

``` cpp
template<class T, class Ref, class Ptr, size_t Bufsiz>
struct __deque_iterator
{
    using iterator = __deque_iterator<T, T&, T*, Bufsiz>;
    using const_iterator = __deque_iterator<T, const T&, const T*, Bufsiz>;

    using iterator_category = random_access_iterator_tag;
    using value_type = T;
    using pointer = value_type * ;
    using reference = value_type & ;
    using size_type = size_t;
    using difference_type = ptrdiff_t;
    using map_pointer = T **;

    using self = __deque_iterator;

    T* cur;
    T* first;
    T* last;
    map_pointer node;

    // 获得缓冲区大小
    static size_type buffer_size() { return _deque_buf_size(Bufsiz, sizeof(T)); }
}
```

### 私有操作

`set_node` 操作用于将迭代器本身调整到新的节点，为了下面实现方便，这一函数并不应被外部使用。

``` cpp
void set_node(map_pointer new_node) {
    node = new_node;
    first = *node;
    last = first + difference_type(buffer_size());
}
```

### operator* & ->

用于得到迭代器所指元素。

``` cpp
reference operator*()const { return *cur; }
pointer operator->() const { return &(operator*()); }
```

### operator-

用于获得两个迭代器之间相差元素数量。

``` cpp
difference_type operator-(const self& x) {
    return difference_type(buffer_size())*(node - x.node - 1) + (cur - first) + (x.last - x.cur);
}
```

### operator++ & --

自增操作符用于指向下一个元素。当下一个元素是`last`，即到了一个缓冲区结尾便意味着需要调整到下一个缓冲区。自减操作符同理。

``` cpp
self& operator++() {
    ++cur;
    if(cur==last) {
        set_node(node + 1);
        cur = first;
    }
    return *this;
}

self operator++(int) {
    const self tmp = *this;
    ++*this;
    return tmp;
}

self& operator--() {
    if(cur==first) {
        set_node(node - 1);
        cur = last;
    }
    --cur;
    return *this;
}

self operator--(int) {
    const self tmp = *this;
    --*this;
    return tmp;
}
```

### operator+=

这一操作符是其他所有操作的关键，使得这一迭代器能够成为Random Access Iterator。如果移动数量使得仍在同一缓冲区内那么简单的增加`cur`即可，如果跨越缓冲区就须先算出偏移量，再调整`cur`以及`node`。

``` cpp
self& operator+=(difference_type n) {
    difference_type offset = n + (cur - first);
    if (offset >= 0 && offset < difference_type(buffer_size())) {
        cur += n;
    }else {
        difference_type node_offset = offset > 0 ? offset / difference_type
            (buffer_size()) : -difference_type((-offset - 1) / buffer_size()) - 1;
        set_node(node + node_offset);
        cur = first + (offset - node_offset * difference_type(buffer_size()));
    }
    return *this;
}
```

### operator+ & -

加减操作符只需要利用 += 就可以轻易实现。注意这里`operator-`与之前不同，前者是两个迭代器间相减得到相差的数量，而这里是减掉一个偏移量得到另一个迭代器。

``` cpp
self operator+(difference_type n) const {
    self tmp = *this;
    return tmp += n;
}

self operator-=(difference_type n)  { return (*this).operator+=(-n); }

self operator-(difference_type n)const {
    self tmp = *this;
    return tmp -= n;
}
```

### operator== & != & <

指向同一个元素，即`cur`相等即代表相等。比较操作符在同一缓冲区下比较`cur`，不同缓冲区则比较`node`。

``` cpp
bool operator==(const self& x)  { return cur == x.cur; }
bool operator!=(const self&x) { return !(*this == x); }
bool operator<(const self& x) { return (node == x.node) ? (cur < x.cur) : (node < x.node); }
```

## 构造函数

在明确内存结构后便可以很简单的构造出一个 deque 。首先分配出中控器，即大小为`map_size`的指针数组，并使`map`指向他，之后依次对其中用到的指针分配缓冲区即可。

``` cpp
// 分配节点
pointer allocate_node() {
    return data_allocator::allocate(buffer_size());
}

// 分配map及缓冲区
void create_map_and_nodes(size_type elements_num) {
    const size_type nodes_num = elements_num / buffer_size() + 1;
    // 如果数量大于默认数量会多分配两个节点以提高添加元素时效率
    map_size = initial_map_size() < nodes_num ? nodes_num + 2 : initial_map_size();
    map = map_allocator::allocate(map_size);
    // 使开始与结尾节点位于中控器中央，从而无论向前或向后添加元素都可应对
    map_pointer nstart = map + (map_size - nodes_num) / 2;
    map_pointer nfinish = nstart + nodes_num - 1;
    for(map_pointer cur = nstart;cur<=nfinish;++cur) {
        *cur = allocate_node();
    }
    start.set_node(nstart);
    finish.set_node(nfinish);
    start.cur = start.first;
    finish.cur = finish.first + elements_num % buffer_size();
}

//填充元素
void fill_initialize(size_type n,const value_type& val) {
    create_map_and_nodes(n);
    for (map_pointer cur = start.node; cur < finish.node; ++cur) {
        uninitialized_fill(*cur, *cur + buffer_size(), val);
    }
    uninitialized_fill(finish.first, finish.cur, val);
}
```

如上三个函数依次分工明确，所以构造函数可以简单的如下实现。

``` cpp
deque() :start(), finish(), map(nullptr), map_size(0),alloc_() {
    fill_initialize(0, value_type());
}

deque(int n, const value_type& val,
    const Alloc& alloc = Alloc()) :start(), finish(), map(nullptr), map_size(0), alloc_(alloc) {
    fill_initialize(n, val);
}

explicit deque(size_type count, const Alloc& alloc = Alloc()) :start(), finish(), map(nullptr), map_size(0), alloc_(alloc) {
    fill_initialize(count, value_type());
}
```

## 析构函数

先使得所有元素析构，之后将所有缓冲区释放，最后释放中控器即可。

``` cpp
~deque() {
    _clear();
}

void _clear() {
    if (map != nullptr) {
        for (map_pointer node = start.node + 1; node<finish.node; ++node) {
            auto p = *node;
            for (; p != *node + buffer_size(); ++p) {
                allocator_traits<Alloc>::destroy(alloc_, p);
            }
            data_allocator::deallocate(*node, buffer_size());
        }
        if (start.node != finish.node) {
            auto p = start.cur;
            for (; p != start.last; ++p) {
                allocator_traits<Alloc>::destroy(alloc_, p);
            }
            data_allocator::deallocate(start.first, buffer_size());
            p = finish.first;
            for (; p != finish.cur; ++p) {
                allocator_traits<Alloc>::destroy(alloc_, p);
            }
            data_allocator::deallocate(finish.first, buffer_size());
        }
        else {
            auto p = start.cur;
            for (; p != finish.cur; ++p) {
                allocator_traits<Alloc>::destroy(alloc_, p);
            }
            data_allocator::deallocate(start.first, buffer_size());
        }
        map_allocator::deallocate(map);
    }
}
```

## push

push 操作有两个版本`push_back`和`push_front`，对应于向后和向前插入元素，两者类似，所以只讨论`push_back`。

当`finish`的缓冲区还有空间时直接在最后构造即可，而当需要跳转缓冲区时则较为复杂。

``` cpp
void push_back(const value_type& t) {
    if (finish.cur != finish.last - 1) {
        allocator_traits<Alloc>::construct(alloc_, finish.cur, t);
        ++finish.cur;
    }
    else {
        push_back_aux(t);
    }
}
```

因为我们选择按需分配缓冲区，所以当最后已无处构造元素时，我们必须分配新的缓冲区。

``` cpp
void push_back_aux(const value_type& t) {
    value_type t_value = t;
    reserve_map_at_back();
    *(finish.node + 1) = allocate_node();
    allocator_traits<Alloc>::construct(alloc_, finish.cur, t_value);
    finish.set_node(finish.node + 1);
    finish.cur = finish.first;
}
```

在构造时还会遇到另一个情况，即中控器中已无空间再指向新的缓冲区，所以我们必须换一个新的`map`，所以在上面调用了`reserve_map_at_back()`以判断是否需要处理这一情况。

``` cpp
void reserve_map_at_back(size_type new_nodes_num=1) {
    if (new_nodes_num + 1 > map_size - (finish.node - map)) reallocate_map(new_nodes_num, false);
}
void reallocate_map(size_type new_nodes_num,bool add_front) {
    auto old_num_nodes = finish.node - start.node + 1;
    auto new_num_nodes = old_num_nodes + new_nodes_num;
    map_pointer new_nstart;
    if(map_size>2*new_num_nodes) {
        new_nstart = map + (map_size - new_num_nodes) / 2 + (add_front ? new_nodes_num : 0);
        if (new_nstart < start.node) {
            std::copy(start.node, finish.node + 1, new_nstart);
        } else {
            std::copy_backward(start.node, finish.node + 1, new_nstart + old_num_nodes);
        }
    } else {
        size_type new_map_size = map_size + max(map_size, new_nodes_num) + 2;
        const map_pointer new_map = map_allocator::allocate(new_map_size);
        new_nstart = new_map + (new_map_size - new_num_nodes) / 2 + (add_front ? new_nodes_num : 0);
        std::copy(start.node, finish.node + 1, new_nstart);
        map_allocator::deallocate(map, map_size);
        map = new_map;
        map_size = new_map_size;
    }
    start.set_node(new_nstart);
    finish.set_node(new_nstart + old_num_nodes - 1);
}
```

重新分配时对于已有元素不需要做任何动作，我们只需要将新的`map`中对应位置指向原来的缓冲区,并调整`start`和`finish`中的`node`。相对而言， vector 面对这一情况需要将原来的元素全部拷贝到新的内存中，所以 deque 效率更高。

`push_front` 类似地向前调整`start`，并注意到上述两个情况即可。

## pop

与 push 一样，pop 也有`pop_front`和`pop_back`两个版本，这里以`pop_front`为例。

``` cpp
void pop_front() {
    if (start.cur != start.last - 1) {
        allocator_traits<Alloc>::destroy(alloc_, start.cur);
        destroy(start.cur);
        ++start.cur;
    }
    else {
        pop_front_aux();
    }
}
```

不涉及跨越缓冲区，那么直接析构元素即可。然而当跨越缓冲区时说明最前的缓冲区已为空，根据我们按需分配的策略需要将其释放。

``` cpp
void pop_front_aux() {
    allocator_traits<Alloc>::destroy(alloc_, start.cur);
    deallocate_node(start.first);
    start.set_node(start.node +1);
    start.cur = start.first;
}
```

相对于 push 操作，pop 不必担心`map`不满足条件的情况。

## insert

insert 是另一重要操作，可以在`pos`前插入一个元素。

``` cpp
iterator insert(iterator pos,const value_type& x) {
    if(pos.cur==start.cur) {
        push_front(x);
        return start;
    }else if(pos.cur==finish.cur) {
        push_back(x);
        iterator tmp = finish;
        return --tmp;
    }else {
        return insert_aux(pos, x);
    }
}
```

为了保证效率，在头尾的操作交由 push 完成，其他再涉及拷贝。

``` cpp
iterator insert_aux(iterator pos,const value_type& x) {
    size_type idx = pos - start;
    value_type x_copy = x;
    if(idx<size()/2) {
        push_front(front());
        iterator front1 = start;
        ++front1;
        iterator front2 = front1;
        ++front2;
        pos = start + idx;
        iterator pos1 = pos;
        ++pos1;
        copy(front2, pos1, front1);
    }else {
        push_back(back());
        iterator back1 = finish;
        --back1;
        iterator back2 = back1;
        --back2;
        pos = start + idx;
        copy_backward(pos, back2, back1);
    }
    *pos = x_copy;
    return pos;
}
```

其实`insert`的实现就是最为粗暴的将后面的元素后移，从而腾出新位置给新元素。为了提高效率，作了个判断以决定是前面的元素向前移动还是后面的元素向后移动。借助于迭代器的良好实现造就的连续空间假象，我们可以直接利用`copy`函数完成复制而不必关注于跳跃缓冲区。

## 后记

虽然 deque 在头部添加和删除元素效率上优于 vector，但是复杂度也远远超过 vector ，迭代器也并非普通的指针，所以不是特别需要 deque 的某一特性时，应尽量优先使用 vector 。

> [更多其它函数实现](https://github.com/ZingLix/LixSTL/blob/master/LixSTL/src/container/deque.hpp)