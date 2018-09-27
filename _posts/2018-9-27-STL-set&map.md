---
layout:     post
title:      "STL 解析 —— 关联容器"
subtitle:   "set、map、multiset & multimap"
date:       2018-9-27
author:     "ZingLix"
header-img: "img/post-31.jpg"
header-mask: 0.1
catalog: true
tags:
    - STL
---

关联容器中最为常用的是 map，是一个存储键值对（key-value）的数据结构，提供 key 可以在 $$O(logN)$$ 的时间内得到 value，因此称为 **关联容器** （Associative containers）。除了 map 外，关联容器中还有 set，行为与 map 类似但是只存储键。这两个不允许键重复，所以标准库为还提供了允许键重复的 multiset 和 multimap。

## 红黑树

可以看出这四个容器行为类似，因为他们底层都是通过 **红黑树** 实现的。之所以选择红黑树是因为红黑树是一种平衡二叉搜索树，意味着它可以自动排序，且红黑树在所有树中提供了相对最好的平均性能。

### 定义

``` cpp
template<class Value,class Compare,class Alloc=allocator<Value>>
class rb_tree
{
public:
    using value_type = Value;
    using pointer = value_type * ;
    using const_pointer = const pointer;
    using reference = value_type & ;
    using const_reference = const reference;
    using link_type = rb_tree_node * ;
    using size_type = size_t;
    using iterator = _rb_tree_iterator<value_type, reference, pointer>;

public:
    iterator insert(const value_type& x);
    pair<iterator,bool> insert_unique(const value_type& x);
    iterator find(value_type val);
    size_type erase(value_type val);
};
```

> 红黑树的实现过于复杂，我并不想在本文中过多阐述，有兴趣可以去 [Github](https://github.com/ZingLix/LixSTL/blob/master/LixSTL/src/container/rb_tree.hpp) 上查看完整源码。

尽管这只是简单的定义，但是表现了红黑树实现关联容器的核心。

- 模板参数：
    - `Value`：红黑树中存储的数据类型
    - `Compare`：比较函数，用于比较键的大小
    - `Alloc`：空间配置器，STL 容器必有的用于分配内存的类
- 成员函数（重载版本未列出）：
    - `insert`：插入元素
    - `insert_unique`：适用于不允许键重复的插入版本，返回值为一个 pair，携带了是否插入成功的信息
    - `find`：查找元素
    - `erase`：移除元素

> 有些实现版本将 `Value` 分为了 `Key` 和 `Value`，这里出于方便理解简化

### 迭代器设计

由于二叉平衡树的自动排序特性，因此红黑树本身是有序的，所以关联容器虽然不是顺序的但依旧可以有迭代器。

``` cpp
template<class T,class Ref,class Ptr>
struct _rb_tree_iterator
{
    using iterator_category = bidirectional_iterator_tag;
    using difference_type = ptrdiff_t;

    using value_type = T;
    using reference = Ref;
    using pointer = Ptr;
    using iterator = _rb_tree_iterator<T, T&, T*>;
    using const_iterator = _rb_tree_iterator<T, const T&, const T*>;
    using self = _rb_tree_iterator<T, Ref, Ptr>;
    using link_type = _rb_tree_node<T>*;

    link_type node;

    _rb_tree_iterator():node(nullptr) {}
    _rb_tree_iterator(link_type& x) { node = x; }
    _rb_tree_iterator(const iterator& it) { node = it.node; }

    void increment();
    void decrement();

    T& operator*();
    T operator->();
    self operator++();
    self operator++(int);
    self operator--();
    self operator--(int);
    bool operator==(const self& x) const;
    bool operator!=(const self& x) const;
};
```

迭代器中除了携带了结点指针以及 traits 相关信息，最为核心的就是 `increment()` 和 `decrement()` 两个函数，分别利用树的性质实现了中序遍历的向后和向前移动，从而实现了之后自增自减操作符。

``` cpp
void increment() {
    if (node->right != nullptr) {
        node = node->right;
        while (node->left != nullptr) node = node->left;
    }
    else {
        link_type p = node->parent;
        while (node == p->right) {
            node = p;
            p = p->parent;
        }
        if (node->right != p) node = p;
    }
}

void decrement() {
    if (node->color == _rb_tree_red && node->parent->parent == node) {
        node = node->right;
    }
    else if (node->left != nullptr) {
        node = node->left;
        while (node->right != nullptr) node = node->right;
    }
    else {
        link_type p = node->parent;
        while (node == p->left) {
            node = p;
            p = p->parent;
        }
        node = p;
    }
}
```

## set & multiset

红黑树本身就提供了增删改查等功能，所以实现 set 时只需要转调用对应的函数即可。

``` cpp
template<class Key, class Compare = std::less<Key>,
    class Allocator = std::allocator<Key>> 
class set{
public:
    using key_type = Key;
    using value_type = Key;
    using key_compare = Compare;
    using value_compare = Compare;

protected:
    using rbtree = rb_tree<key_type, key_compare, Allocator>;
    rbtree t;

public:
    iterator begin()  { return t.begin(); }
    iterator end()  { return t.end(); }
    bool empty() const { return t.empty(); }
    size_type size() { return  t.size(); }
    pair insert(const value_type& val) {return t.insert_unique(val);}
    iterator erase(const_iterator pos) {return t.erase(pos);}
};
```

set 中每个元素就是红黑树上一个结点，利用 `Compare` 比较键的大小即可。multiset 与 set 唯一的区别就是在插入元素的时候调用的是允许重复的版本。

## map & multimap

map 相比 set 可以实现键值对的映射，这里用到 pair 这一容器。

``` cpp
template<class T1, class T2> 
struct pair{
    using first_type = T1;
    using second_type = T2;

    T1 first;
    T2 second;
}
```

pair 可以看成一个键值对，通过 `first` 和 `second` 就可以访问其中的两个元素。将 pair 作为红黑树的结点类型，`first` 作为键，`second` 作为值，通过比较 `first`，找到对应的 pair，返回 `second` 就实现了键值的映射。

``` cpp
template<class Key, class T,
    class Compare = std::less<Key>,
    class Allocator = allocator<std::pair<const Key, T>>>
    class map
{
public:
    using key_type = Key;
    using mapped_type = T;
    using value_type = std::pair<const Key, T>;
    using key_compare = Compare;

    iterator begin() { return t.begin(); }
    iterator end() { return t.end(); }
    bool empty() { return t.empty(); }
    size_type size() { return t.size(); }
    iterator erase(iterator pos) {
        return t.erase(pos);
    }
    iterator erase(iterator pos) {
        return t.erase(pos);
    }
    iterator find(const Key& key) {
        return t.find(key);
    }
};
```

同样的，multimap 相比 map 只是将 `insert_unique` 换成 `insert` 以支持重复的键。

由于红黑树任何一个结点都是独立的，修改其中一个结点不会影响到其他的元素在内存中的位置，所以对于关联容器插入删除都不会导致任何迭代器失效，除了指向被删除元素的迭代器。