---
layout: post
title: “学习笔记：数据结构-链表”
date: 2016-11-30 16:28:26 +08:00
author:     "ZingLix"
header-img: "img/post-2.jpg"
catalog: true
tags:
    - 数据结构
---

# 什么是链表

百度百科定义：一种物理存储单元上非连续、非顺序的存储结构，数据元素的逻辑顺序是通过链表中的指针链接次序实现的。链表由一系列结点（链表中每一个元素称为结点）组成，结点可以在运行时动态生成。

说白了其实就是一个结构，里面存有数据，再加上一个指向下一个结构的指针。
![QQ截图20161130164727.png](https://ooo.0o0.ooo/2016/11/30/583e9235cd279.png)
此图为不具有头结点的链表形式。
![QQ截图20161130170001.png](https://ooo.0o0.ooo/2016/11/30/583e9528cb615.png)
此图为具有头节点的链表形式。区别仅在于第一个结点是否存有信息，这里采用具有头节点的形式

# 实现

## 原型声明
```
struct Node;
typedef Node* PtrToNode;
typedef PtrToNode List;
typedef PtrToNode Position;

int IsEmpty(List L);
int IsLast(Position P);
Position Find(int X, List L);
Position FindPrevious(int X, List L);
void Delete(int X, List L);
void DeleteList(List L);
```

## 定义
```
struct Node
{
	int x;
	Position Next;
};
```

分别用 x来纪录数据，用Next纪录下一个结点地址。

## 判断是否为空
```
int IsEmpty(List L)
{
	return L->Next == NULL;
}
```

## 判断是否为最后一个结点
```
int IsLast(Position P)
{
		return P->Next == NULL;
}
```

## 寻找
```
Position Find(int X, List L)
{
	Position P = L->Next;
	while (P != NULL&&P->x != X) {
		P = P->Next;
	}
	return P;
}
```

传入参数x为要寻找的值，L为链表头节点，返回该结点指针。采用顺序查找，从头节点一一向后寻找。

## 寻找前驱元
```
Position FindPrevious(int X, List L)
{
	Position P = L;
	while (P->Next->x != X&&P != NULL) {
		P = P->Next;
	}
	return P;
}
```
传入参数x为要寻找的值，L为链表头节点，返回前驱元指针。

## 删除节点
```
void Delete(int X, List L){
	Position P = FindPrevious(X, L);
	if (P != NULL) {
		Position Tmp = P->Next;
		P->Next = Tmp->Next;
		free(Tmp);
	}
}
```
通过寻找前驱元，改变其指向的下一个结点地址，并释放要删除的结点内存，从而达到删除目的。
![QQ截图20161130171745.png](https://ooo.0o0.ooo/2016/11/30/583e995036717.png)

## 删除链表
```
void DeleteList(List L){
	Position P = L->Next,Tmp;
	L->Next = NULL;
	while (P != NULL) {
		Tmp = P->Next;
		free(P);
		P = Tmp;
	}
}
```
从头节点开始一个个向后释放内存。


[源代码戳此](https://github.com/ZingLix/Data-Structures-and-Algorithm/tree/master/List)