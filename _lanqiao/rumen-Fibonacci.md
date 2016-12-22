---
layout:     post
title:      "蓝桥杯 入门训练 Fibonacci数列"
subtitle:   ""
date:       2016-12-22
author:     "ZingLix"
header-img: "img/post-lanqiao.jpg"
catalog: true
tags:
    - 蓝桥杯
---

# 问题描述

Fibonacci数列的递推公式为：Fn=Fn-1+Fn-2，其中F1=F2=1。

当n比较大时，Fn也非常大，现在我们想知道，Fn除以10007的余数是多少。

# 输入格式
输入包含一个整数n。
# 输出格式
输出一行，包含一个整数，表示Fn除以10007的余数。

说明：在本题中，答案是要求Fn除以10007的余数，因此我们只要能算出这个余数即可，而不需要先计算出Fn的准确值，再将计算的结果除以10007取余数，直接计算余数往往比先算出原数再取余简单。

| 样例输入        | 样例输出           | 
|:-------------:|:-------------:| 
| 10     | 55 | 
| 22 | 7704     | 

# 数据规模与约定
1 <= n <= 1,000,000。

# 解答

这真的就是入门训练，水题一个。。。直接上代码

{% highlight c++ %}

#include <stdio.h>


int main() {
	int n=1, n_1 = 1, n_2 = 0;
	int i,tmp;
	scanf("%d", &i);
	for (int j = 2; j < i; j++) {
		tmp = n + n_1;
		n_2 = n_1;
		n_1 = n;
		n = tmp;
		if (n > 10007) n %= 10007;
	}
	printf("%d", n);
	return 0;
}

{% endhighlight %}
