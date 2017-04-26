---
layout:     post
title:      "蓝桥杯 真题 2016 最大比例"
subtitle:   ""
date:       2017-1-19
author:     "ZingLix"
header-img: "img/post-lanqiao.jpg"
catalog: true
tags:
    - 蓝桥杯
---

## 问题描述

X星球的某个大奖赛设了M级奖励。每个级别的奖金是一个正整数。
并且，相邻的两个级别间的比例是个固定值。
也就是说：所有级别的奖金数构成了一个等比数列。比如：
16,24,36,54
其等比值为：3/2

现在，我们随机调查了一些获奖者的奖金数。
请你据此推算可能的最大的等比值。

## 输入格式
第一行为数字 N (0<N<100)，表示接下的一行包含N个正整数
第二行N个正整数Xi(Xi<1 000 000 000 000)，用空格分开。每个整数表示调查到的某人的奖金数额

## 输出格式
一个形如A/B的分数，要求A、B互质。表示可能的最大比例系数

测试数据保证了输入格式正确，并且最大比例是存在的。
 
| 样例输入        | 样例输出           | 
|:-------------:|:-------------:| 
| 3<br>1250 200 32| 25/4 | 
| 4<br>3125 32 32 200    | 5/2 | 
| 3<br>549755813888 524288 2    | 4/1 | 


## 解答

整体思路就是先排序，利用最大公因数找到最大的比例，然后根据其数据范围，枚举所有可能的比例。其中需要关注的就是有关开方的精度问题。

{% highlight c++ %}


#include <stdio.h>

#include <stdlib.h>

#include <algorithm>

#include <math.h>

long long gcd(long long a, long long b)
{
	long long c;
	while (a != 0) {
		c = a; a = b%a;  b = c;
	}
	return b;
}

int test(long long dat[], long long up,long long down, int n) {
	int flag = 1;
	double tmp = (double)dat[0]*down/up;
	for (int i = 0; i < n; ) {
		if (dat[i] == dat[i + 1]) {
			i++;
			continue;
		}
		tmp = tmp*up/down;
		if (tmp - dat[i]<0.0000001&&tmp - dat[i]>-0.0000001) {
			i++;
		}
		else if (tmp > dat[i]) {
			flag = 0;
			break;
		}
	}
	return flag;
}

bool cmp(double a, int b) {
	if (abs(fmod(a, 1)) < 0.000001 || abs(fmod(a, 1)) > 0.999999)return 1;
	return 0;
}

bool kk(double a) {
	int x = a;
	double y = a - x;
	if (y<0.00001&&y >= -0.00001) {
		return 0;
	}
	return 1;
}

long long change(double a) {
	if (abs(fmod(a, 1)) < 0.000001) {
		return (long long)a;
	}
	else {
		return (long long)a + 1;
	}
}

int main() {
	int n;
	long long dat[100];
	scanf("%d", &n);
	for (int i = 0; i < n;i++) {
		scanf("%lld", &dat[i]);
	}
	std::sort(dat, dat + n);
	double p = 0, tmp;
	int mark = 0;
	for (int i = 0; i < n-1; i++) {
		tmp = (double)dat[i + 1] / dat[i];
		if (tmp > p) {
			p=tmp;
			mark = i;
		}
	} 
	long long g = gcd(dat[mark], dat[mark + 1]);
	long long up = dat[mark + 1] / g;
	long long down = dat[mark] / g;
	for (int i = 1; i <= 40; i++) {
		double upd = pow(up, 1.0 / i);
		double downd = pow(down, 1.0 / i);
		if (!cmp(upd,(int)upd)||!cmp(downd,(int)downd)) {
			continue;
		}
		if (test(dat, change(upd),change(downd), n)) {
			printf("%lld/%lld", change(upd), change(downd));
			break;
		}
	}
	return 0;
}

{% endhighlight %}





