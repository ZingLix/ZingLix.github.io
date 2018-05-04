---
layout:     post
title:      "STL解析 —— vector"
subtitle:   "Standard Template Library —— vector"
date:       2018-4-19
author:     "ZingLix"
header-img: "img/post-8.jpg"
catalog: true
tags:
    - STL
---

vector 类似于传统的数组，是一种顺序容器，差别在于 vector 没有容量限制，在尾部新增元素有很好的性能。由于以顺序的方式存储，其迭代器为 random_access_iterator，支持快速随机访问，可以在 $$ O(1) $$ 的时间取得元素。

## 底层数据结构

vector 底层数据结构为线性连续空间，但如果总正好是占用所有元素所需的空间，那么当频繁新增元素时，会频繁的申请新内存，导致效率降低，所以 vector 会申请比实际容量更大的空间以减少申请新内存的次数，以占用更大的存储空间换取更高的效率。

![](/img/in-post/STL-Vector/1.png)

`_start`指向数据开始处，`_end`指向数据结尾处，`_tail`指向所申请内存的末端。

当元素空间不足时，容器会重新申请一块两倍于原来空间大小的空间。不在原有空间之后再申请内存，因为无法保证之后的内存是否已被其他变量占用。因此当触发空间重新分配时，操作效率会有所降低，而且原有的**所有迭代器都会失效**。

## 迭代器

因为 vector 是线性连续结构，所以其迭代器就是一个传统指针，对于`+ - * ->`等操作符默认具备，所以无需更多修改。

``` cpp
typedef T value_type;
typedef value_type* iterator;
```

这样当声明 `vector<int>::iterator itr` 时，`itr` 就是一个 `int*` 型的指针。

## 构造 & 析构函数

构造函数用到了两个辅助函数。

``` cpp
template <class T, class Alloc>
typename vector<T, Alloc>::iterator vector<T, Alloc>::allocate_and_fill(size_type n, const T& x) {
    iterator address = allocator::allocate(n);
    uninitialized_fill_n(address, n, x);
    return address;
}
```

这个函数用于配置空间并填满内容。

``` cpp
template <class T, class Alloc>
void vector<T, Alloc>::fill_initialize(size_type n, const T& value) {
    _start = allocate_and_fill(n, value);
    _end = _start + n;
    _tail = _end;
}
```

这个函数调用前者处理数据相关的事，然后初始化头尾指针。

```cpp
vector() :_start(nullptr), _end(nullptr), _tail(nullptr) {}
vector(size_type n, const T&value) { fill_initialize(n, value); }
vector(int n, const T& value) { fill_initialize(n, value); }
explicit vector(size_type n) { fill_initialize(n, T()); }
```

这样构造函数直接调用前面的函数就可以接受各种形式的参数。

相对来说析构函数较为简单，只要将所有元素析构，并将内存还给系统即可。

```cpp
~vector() {
    destroy(_start, _end);
    allocator::deallocate(_start, _tail - _start);
}
```

## 插入元素 insert

插入元素的思路是将插入点之后的元素全部后移，在腾出的新空间内构造新元素。实际实现时会根据插入点之后已有元素和新增元素数量的差别选择效率更高的做法。

```cpp
template <class T, class Alloc>
void vector<T, Alloc>::insert(iterator pos, size_type n, const T& value) {
    if (n > 0) {
        if (static_cast<size_type>(_tail - _end) >= n) {
            auto elems_after = _end - pos;
            iterator old_end = _end;
            if (elems_after > n) {
                uninitialized_copy(_end - n, _end, _end);
                _end += n;
                std::copy_backward(pos, old_end - n, old_end);
                std::fill(pos, pos + n, value);
            }
            else {
                uninitialized_copy(_end, n - elems_after, value);
                _end += n - elems_after;
                uninitialized_copy(pos, old_end, _end);
                _end += elems_after;
                std::fill(pos, old_end, value);
            }
        }
        else {
            insert_aux(pos, n, value);
        }
    }
}
```

如果备用空间不够就会换用`insert_aux`，其思路是先扩充空间，将插入点之前的拷贝过去，然后构造新增元素，再将原数据后半部分拷贝过去。

``` cpp
template <class T, class Alloc>
void vector<T, Alloc>::insert_aux(iterator pos, const T& value) {
    insert_aux(pos, 1, value);
}

template <class T, class Alloc>
void vector<T, Alloc>::insert_aux(iterator pos, size_type n, const T& value) {
    const size_t old_size = size();
    const size_t new_size = old_size == 0 ? 1 : old_size * 2;
    auto new_start = allocator::allocate(new_size);
    auto new_end = uninitialized_copy(_start, pos, new_start);
    while (n--) {
        construct(new_end, value);
        ++new_end;
    }
    new_end = uninitialized_copy(pos, _end, new_end);
    destroy(_start, _end);
    deallocate();
    _start = new_start;
    _end = new_end;
    _tail = _start + new_size;
}
```

## 添加元素 push_back

添加元素的逻辑很简单，如果还有备用空间，那就再最后构造新元素并修改尾指针，否则就重新配置空间。

``` cpp
template <class T, class Alloc>
void vector<T, Alloc>::push_back(const T& x) {
    if (_end == _tail) {
        insert_aux(end(), x);
    }
    else {
        construct(_end, x);
        ++_end;
    }
}
```

向最后添加元素等同于向最后添加元素，所以直接调用 `insert_aux(end(),x)` 来完成扩充空间和构造新元素的操作。

## 删除元素 pop_back

删除元素相对来说较为简单，因为不必考虑内存扩充的问题，只需要直接释放最后一个元素并调整尾指针即可。

``` cpp
template <class T, class Alloc>
void vector<T, Alloc>::pop_back() {
    --_end;
    destroy(_end);
}
```

## 清除元素 erase

`erase`提供两种版本，第一个接受一个迭代器，删除迭代器所指元素，思路是将后面元素前移，直接将要删除的元素覆盖，然后释放最后一个冗余元素。

``` cpp
template <class T, class Alloc>
typename vector<T, Alloc>::iterator vector<T, Alloc>::erase(iterator pos) {
    if (pos + 1 != _end) {
        std::copy(pos + 1, _end, pos);
    }
    --_end;
    destroy(_end);
    return pos;
}
```

第二个版本接受两个迭代器，将两个迭代器中间所有元素都删除,思路与之前类似。

``` cpp
template <class T, class Alloc>
typename vector<T, Alloc>::iterator vector<T, Alloc>::erase(iterator first, iterator last) {
    iterator i = std::copy(last, _end, first);
    destroy(i, _end);
    _end = _end - (last - first);
    return first;
}
``` 
## 其他常用操作

### 获得头尾迭代器

``` cpp
iterator begin() { return _start; }
iterator end() { return _end; }
```

### 获得大小和容量

``` cpp
size_type size() const { return static_cast<size_type>(_end - _start); }
size_type capacity() const { return static_cast<size_type>(_tail - _start); }
```

### 检查是否为空

``` cpp
bool empty() { return _start == _end; }
```

### [ ]操作符

实现与数组相同的操作方式，类似于`at()`但不提供越界检查。

``` cpp
ref operator[](size_type n) { return *(_start + n); }
```

> [View all code on Github](https://github.com/ZingLix/LixSTL/blob/master/LixSTL/src/vector.hpp)