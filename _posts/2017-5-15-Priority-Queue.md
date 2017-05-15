---
layout:     post
title:      "学习笔记：优先队列"
subtitle:   ""
date:       2017-5-15
author:     "ZingLix"
header-img: "img/post-5.jpg"
catalog: true
tags:
    - 数据结构
    - 优先队列
---

优先队列(Priority Queue)是一种先进先出的数据结构，其中每个元素被赋予优先级，其中优先级最高的最先被删除。其中优先级若以值来代表，值越大优先级越高，这种被称为最大优先队列。同理可得最小优先队列，本文以最大为例。由于最大堆中根节点值最大，而优先队列要找的是值最大的元素，所以优先队列可以用堆来实现。

## 基本操作&原型
由于用最大堆来实现，所以由堆继承而得，关于堆的实现可以[在此](/2017/05/15/Heap/)查看。
下面给出原型：
{% highlight c++ %}
class PriorityQueue :public Heap {
public:
	PriorityQueue(vector<int> vec);
	void insert(int x);
	int max();
	int pop_max();
	void increase_key(int i, int k);
};
{% endhighlight %}
其中构造函数将vec中所有元素放入队列中，由于非核心算法，具体代码不在此展现，可以在[GitHub](https://github.com/ZingLix/Data-Structures-and-Algorithm/tree/master/Heap)上查看。

除此之外四个操作为优先队列的基本操作：
- Insert(int x) 将元素x插入优先队列中。

- max() 返回优先级最高的元素值

- pop_max() 返回优先级最高的元素值并将其移出队列

- increase_key(int i, int k) 提高优先级，将i号元素优先级提高至k

## max 返回最大值
由于根节点即为最大值，所以只需返回根节点的值。
{% highlight c++ %}
int PriorityQueue::max()
{
	return Heap::heap[0];
}
{% endhighlight %}

## pop_max 去除最大值
最大值位于根节点，只需将其与最后一个元素互换，即可将其从容器中去除，同时对新的根节点重新维护次根性质即可使新堆成为最大堆。同时利用临时变量tmp记录最大值最后返回即可。
![ExtractMax.gif](\img\in-post\Heap\ExtractMax.gif)
{% highlight c++ %}
int PriorityQueue::pop_max()
{
	int tmp = Heap::heap[0];
	Heap::heap[0] = Heap::heap[Heap::GetSize()-1];
	Heap::heap.pop_back();
	Heap::MaxHeapify(0);
	return tmp;
}
{% endhighlight %}


## increase_key 提高优先级
由于使提高优先级，新值必大于原值，所以新位置必定上移。将第i号元素赋值为k后，不断与父节点比较，若大于父节点便上移，直至小于上层元素。下面插入操作实现的动画可以看作对于新增元素提高优先级的操作。
{% highlight c++ %}
void PriorityQueue::increase_key(int i, int k)
{
	Heap::heap[i] = k;
	while (i > 0 && Heap::heap[Heap::parent(i)] < Heap::heap[i]) {
		swap(Heap::heap[Heap::parent(i)], Heap::heap[i]);
		i = Heap::parent(i);
	}
}
{% endhighlight %}

## insert 插入
插入可以利用increase_key来实现。可以想象为在堆中新增一个新元素赋值为负无穷，然后提高其优先级即可。
![Insert.gif](\img\in-post\Heap\Insert.gif)
在具体实现中跳过赋值为负无穷环节，直接赋值为新值并提高优先级。
{% highlight c++ %}
void PriorityQueue::insert(int x)
{
	Heap::heap.push_back(x);
	this->increase_key(Heap::GetSize() - 1, x);
}
{% endhighlight %}

> 图片和gif来自 [visualgo.net](https://visualgo.net/)
> 
> 源代码均以上传至[GitHub](https://github.com/ZingLix/Data-Structures-and-Algorithm/tree/master/Heap)