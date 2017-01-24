---
layout:     post
title:      "蓝桥杯 基础练习 矩阵乘法"
subtitle:   ""
date:       2017-1-24
author:     "ZingLix"
header-img: "img/post-lanqiao.jpg"
catalog: true
tags:
    - 蓝桥杯
---

# 问题描述
给定一个N阶矩阵A，输出A的M次幂（M是非负整数）<br>例如：<br>A =<br>1 2<br>3 4<br>A的2次幂<br>7 10<br>15 22

# 输入格式
第一行是一个正整数N、M（1<=N<=30, 0<=M<=5），表示矩阵A的阶数和要求的幂数

接下来N行，每行N个绝对值不超过10的非负整数，描述矩阵A的值

# 输出格式
输出共N行，每行N个整数，表示A的M次幂所对应的矩阵。相邻的数之间用一个空格隔开

| 样例输入        | 样例输出           | 
|:-------------:|:-------------:| 
| 2 2<br>1 2<br>3 4    | 7 10<br>15 22 | 

# 解答
根据矩阵乘法定义用二维数组循环即可完成。

{% highlight c++ %}
#include <stdio.h>


void multiply(int mat[30][30], int ans[30][30], int n) {
	int x;
	int tmp[30][30];
	for (int i = 0; i < n; i++) {
		for (int j = 0; j < n; j++) {
			x = 0;
			for (int a = 0; a < n; a++) {
				x += mat[i][a] * ans[a][j];
			}
			tmp[i][j] = x;
		}
	}
	for (int i = 0; i < n; i++) {
		for (int j = 0; j < n; j++) {
			ans[i][j] = tmp[i][j];
		}
	}
}

int main() {
	int mat[30][30], ans[30][30] = {0};
	int n, m;
	scanf("%d %d", &n, &m);
	for (int i = 0; i < 30; i++) {
		ans[i][i] = 1;
	}
	for (int i = 0; i < n; i++) {
		for (int j = 0; j < n; j++) {
			scanf("%d", &mat[i][j]);
		}
	}

	for (int i = 0; i < m; i++) {
		multiply(mat, ans, n);
	}

	for (int i = 0; i < n; i++) {
		for (int j = 0; j < n; j++) {
			printf("%d ", ans[i][j]);
		}
		printf("\n");
	}
	return 0;
}
{% endhighlight %}