---
layout:     post
title:      "蓝桥杯 基础练习 阶乘计算"
subtitle:   ""
date:       2017-1-18
author:     "ZingLix"
header-img: "img/post-lanqiao.jpg"
catalog: true
tags:
    - 蓝桥杯
---

## 问题描述

　　输入一个正整数n，输出n!的值。其中n!=1*2*3*…*n。

## 算法描述

　　n!可能很大，而计算机能表示的整数范围有限，需要使用高精度计算的方法。使用一个数组A来表示一个大整数a，A[0]表示a的个位，A[1]表示a的十位，依次类推。

　　将a乘以一个整数k变为将数组A的每一个元素都乘以k，请注意处理相应的进位。

　　首先将a设为1，然后乘2，乘3，当乘到n时，即得到了n!的值。

## 输入格式
　　输入包含一个正整数n，n<=1000。

## 输出格式
　　输出n!的准确值。
 
| 样例输入        | 样例输出           | 
|:-------------:|:-------------:| 
| 10    | 3628800 | 


## 解答

这题关键在于大数运算，尤其是进位这一部分，题目中也给出了相关解决办法。

{% highlight c++ %}


#include <iostream>

using namespace std;

int multiply(int ans[], int num,int x) {
	int tmp = 0;
	for (int i = 0; i < x; i++) {
		tmp = (ans[i] * num + tmp);
		ans[i] = tmp % 10;
		tmp /= 10;
	}
	int p = 0;
	while (tmp != 0) {
		ans[x + p] = tmp % 10;
		tmp /= 10;
		p++;
	}
	return p;
}

int main() {
	int ans[10000] = {0};
	ans[0] = 1;
	int n,x=1;
	cin >> n;
	for (int i = 1; i <= n; i++) {
		x+=multiply(ans, i, x);
	}
	for (int i = x - 1; i >= 0; i--) {
		cout << ans[i];
	}
	return 0;
}

{% endhighlight %}



