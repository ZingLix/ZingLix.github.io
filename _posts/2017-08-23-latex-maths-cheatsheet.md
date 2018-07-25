---
  layout: "post"
  title: "Latex 数学符号 汇总"
  date: "2017-08-23"
  subtitle:   "Latex Math Symbol Cheat Sheet"
  author:     "ZingLix"
  header-img: "img/post-20.jpg"
  catalog: true
  tags:
      - Latex
---

Latex 的一大优点就是其可以写出优美的数学公式，本博客也使用 MathJax 来得到 Latex 中数学公式的效果。但是由于其有自己的语法，所以写了这篇文章以整理数学公式相关的内容。

由于本文中公式较多，所以可能需要些许渲染的时间。

## 常见公式

|名称|代码|效果|
|:---:|:---:|:---:|
|上下标|`_1^2X_3^4`|$$_1^2X_3^4$$|
|组合数|`\mathrm{C}_n^r`|$$\mathrm{C}_n^r$$|
|排列数|`\mathrm{P}_n^r`|$$\mathrm{P}_n^r$$|
|上划线|`\overline{abc}`|$$\overline{abc}$$|
|下划线|`\underline{abc}`|$$\underline{abc}$$|
|求和|`\sum_{k=1}^N k^2`|$$\sum\limits_{k=1}^N k^2$$|
|求积|`\prod_{i=1}^N x_i`|$$\prod\limits_{i=1}^N x_i$$|
|极限|`\lim_{n \to \infty}n`|$$\lim\limits_{n \to \infty}n$$|
|根号|`\sqrt[n]{x}|`|$$\sqrt[n]{x}$$|
|上括号|`\overbrace{a+b+\cdots+z}^26`|$$\overbrace{a+b+\cdots+z}^{26}$$|
|下括号|`\underbrace{a+b+\cdots+z}_26`|$$\underbrace{a+b+\cdots+z}_{26}$$|
|向量|`\overrightarrow{AB}`|$$\overrightarrow{AB}$$


## 分数

分数最普通的形式为`\frac{x}{y}`，也可以用`\tfrac{x}{y}`来得到较小的分数。

$$\frac{x}{y}\ \ \tfrac{x}{y}$$

用`\frac{x}{1+\frac{y}}`可以得到连分数，但是使用`\cfrac`代替可以得到更大的分数。

$$ \frac{2}{c + \frac{2}{d + \frac{2}{4}}} \ \  \cfrac{2}{c + \cfrac{2}{d + \cfrac{2}{4}}} \ \   $$

## 矩阵

矩阵首尾以`\begin{matrix}`和`\end{matrix}`标记，各元素以`&`分隔，以`\\`换行。
```
\begin{matrix}
a_{11} & \cdots & a_{1n}  \\
\vdots & \ddots & \vdots  \\
a_{n1} & \cdots & a_{nn}
\end{matrix}
```
如上则是一个矩阵的代码，可以得到如下的效果。

$$
\begin{matrix}
a_{11}      & \cdots & a_{1n}      \\
\vdots & \ddots & \vdots \\
a_{n1}      & \cdots & a_{nn}
\end{matrix}
$$

此外对于`{matrix}`中 matrix 可以替换成如下内容，以得到不同的边框。

|替换内容|效果|替换内容|效果|
|:---:|:---:|:---:|:---:|
|vmatrix|$$\begin{vmatrix}a & b \\c & d\end{vmatrix}$$|Vmatrix|$$\begin{Vmatrix}a & b \\c & d\end{Vmatrix}$$|
|bmatrix|$$\begin{bmatrix}a & b \\c & d\end{bmatrix}$$|Bmatrix|$$\begin{Bmatrix}a & b \\c & d\end{Bmatrix}$$|
|pmatrix|$$\begin{pmatrix}a & b \\c & d\end{pmatrix}$$|smallmatrix|$$\begin{smallmatrix}a & b \\c & d\end{smallmatrix}$$|

## 分段函数 & 方程组

首尾以`\begin{cases}`和`\end{cases}`标记，各元素以`&`分隔，以`\\`换行。
```
f(x) =
\begin{cases}
x,  & x\ge0 \\
-x, & x<0
\end{cases}
```
可以得到如下效果。

$$
f(x) =
\begin{cases}
x,  & x\ge0 \\
-x, & x<0
\end{cases}
$$

如下所示，可以对上面的稍加修改，
```
\begin{cases}
x+y=1 \\
3x+4y=5 \\
\end{cases}
```

便可以得到方程组的形式。

$$
\begin{cases}
x+y=1 \\
3x+4y=5 \\
\end{cases}
$$

## 多行等式

首尾以`\begin{align}`和`\end{align}`标记，各元素以`&`分隔，以`\\`换行。

```
\begin{align}
(x+y)^3 & = (x+y)^2(x+y)
& = (x+y)(x+y)(x+y)
\end{align}
```
实际效果如下。

$$
\begin{align}
(x+y)^3 & = (x+y)^2(x+y)\\
& = (x+y)(x+y)(x+y)\\
\end{align}
$$

## 空格

|功能|代码|效果|宽度|
|:---:|:---:|:---:|:---:|
|2个quad空格|`\qquad`|$$A\qquad B$$|$$2m$$|
|quad空格|`\quad`|$$A\quad B$$|$$m$$|
|大空格|`\ `|$$A\ B$$|$$\frac{m}{3}$$|
|中等空格|`\;`|$$A\;B$$|$$\frac{2m}{7}$$|
|小空格|`\,`|$$A\,B$$|$$\frac{m}{6}$$|
|没有空格|` `|$$AB$$|$$0$$|
|紧贴|`\!`|$$A\!B$$|$$-\frac{m}{6}$$|

## 括号

用`\left`和`\right`来控制左右括号。

功能|	语法|显示|
|:---:|:---:|:---:|
小括号|`\left( \frac{a}{b} \right)`|$$\left( \frac{a}{b} \right)$$
中括号|`	\left[ \frac{a}{b} \right]`|$$ \left[ \frac{a}{b} \right]$$
大括号|`\left\{ \frac{a}{b} \right\}`|$$ \left\{ \frac{a}{b} \right\}$$
角括号|`\left \langle \frac{a}{b} \right \rangle`|$$ \left\langle \frac{a}{b} \right \rangle$$
双竖线|`\left\Vert \frac{a}{b} \right\Vert`	|$$\left\Vert \frac{a}{b} \right\Vert$$
绝对值|`\left\| \frac{a}{b} \right \|`|	$$ \left\| \frac{a}{b} \right \|$$
向下取整|`\left \lfloor \frac{a}{b} \right \rfloor`	|$$ \left \lfloor \frac{a}{b} \right \rfloor$$
向上取整|`\left \lceil \frac{c}{d} \right \rceil`	|$$ \left \lceil \frac{c}{d} \right \rceil$$
斜线与反斜线|`\left / \frac{a}{b} \right \backslash	`|$$ \left / \frac{a}{b} \right \backslash$$
上下箭头|`\left \uparrow \frac{a}{b} \right \downarrow`	| $$\left \uparrow \frac{a}{b} \right \downarrow$$
上下箭头|`\left \Uparrow \frac{a}{b} \right \Downarrow`|$$\left \Uparrow \frac{a}{b} \right \Downarrow$$

括号同时可以用`\big \Big \bigg \Bigg`修饰。

```
\Bigg( \bigg[ \Big\{ \big\langle\left| \frac{a}{b} \right| \big\rangle \Big\} \bigg] \Bigg)
```

如上代码可以得到如下效果。

$$
\Bigg( \bigg[ \Big\{ \big\langle\left| \frac{a}{b} \right| \big\rangle \Big\} \bigg] \Bigg)
$$

## 微积分

|代码|效果|代码|效果|代码|效果|
|:---:|:---:|:---:|:---:|:---:|:---:|
|`\nabla`|$$\nabla$$|`\partial{x}`|$$\partial{x}$$|`\mathrm{d}x`|$$\mathrm{d}x$$|
|`\dot{x}`|$$\dot{x}$$|`\ddot{y}`|$$\ddot{y}$$|`\frac{\mathrm{d}y}{\mathrm{d}x}`|$$\frac{\mathrm{d}y}{\mathrm{d}x}$$
|`f\prime(x)`|$$f\prime(x)$$|`\int_{-N}^{N}`|$$\int_{-N}^{N}$$|`\iint_{-N}^{N}`|$$\iint_{-N}^{N}$$|
|`\iiint_{-N}^{N}`|$$\iiint_{-N}^{N}$$|`\iiiint_{-N}^{N}`|$$\iiint_{-N}^{N}$$|`\oint_{C}`|$$\oint_{C}$$|

## 特殊字体

|名称|代码|效果|
|:---:|:---:|:---:|
|黑板粗体|`\mathbb{ONLY\ UPPERCASE}`|$$\mathbb{ONLY\ UPPERCASE}$$|
|正粗体|`\mathbf{abcDEFGHI012}`|$$\mathbf{abcDEFGHI012}$$|
|斜粗体|`\boldsymbol{abcDEFGHI012}`|$$\boldsymbol{abcDEFGHI012}$$|
|斜体数字|`\mathit{0123456789}`|$$\mathit{0123456789}$$|
|罗马体|`\mathrm{012} \mbox{abc} \operatorname{ABC}`|$$\mathrm{012} \mbox{abc} \operatorname{ABC}$$|
|哥特体|`\mathfrak{abcDEFGHI012}`|$$\mathfrak{abcDEFGHI012}$$|
|手写体|`\mathcal{abcDEFGHI012}`|$$\mathcal{abcDEFGHI012}$$|
|希伯来字母|`\aleph\beth\gimel\daleth`|$$\aleph\beth\gimel\daleth$$|

## 字符标记

|代码|效果|代码|效果|代码|效果|
|:---:|:---:|:---:|:---:|:---:|:---:|
|`\acute{a}`|$$\acute{a}$$|`\grave{a}`|$$\grave{a}$$|`\hat{a}`|$$\hat{a}$$|
|`\tilde{a}`|$$\tilde{a}$$|`\breve{a}`|$$\breve{a}$$|`\check{a}`|$$\check{a}$$|
|`\bar{a}`|$$\bar{a}$$|`\ddot{a}`|$$\ddot{a}$$|`\dot{a}`|$$\dot{a}$$|

## 常见函数

|代码|效果|代码|效果|代码|效果|
|:---:|:---:|:---:|:---:|:---:|:---:|
|`\sin`|$$\sin$$|`\cos`|$$\cos$$|`\tan`|$$\tan$$|
|`\sec`|$$\sec$$|`\csc`|$$\csc$$|`\cot`|$$\cot$$|
|`\arcsin`|$$\arcsin$$|`\arccos`|$$\arccos$$|`\arctan`|$$\arctan$$|
|`\sinh`|$$\sinh$$|`\cosh`|$$\cosh$$|`\tanh`|$$\tanh$$|
|`\coth`|$$\coth$$|`\lim`|$$\lim$$|`\limsup`|$$\limsup$$|
|`\liminf`|$$\liminf$$|`\min`|$$\min$$|`\max`|$$\max$$|
|`\inf`|$$\inf$$|`\sup`|$$\sup$$|`\exp`|$$\exp$$|
|`\ln`|$$\ln$$|`\lg`|$$\lg$$|`\log`|$$\log$$|
|`\log_{10}`|$$\log_{10}$$|`\ker`|$$\ker$$|`\deg`|$$\deg$$|
|`\gcd`|$$\gcd$$|`\Pr`|$$\Pr$$|`\det`|$$\det$$|
|`\hom`|$$\hom$$|`\arg`|$$\arg$$|`\dim`|$$\dim$$|
|`\bmod`|$$\bmod$$|`\equiv`|$$\equiv$$|

## 集合

|代码|效果|代码|效果|代码|效果|
|:---:|:---:|:---:|:---:|:---:|:---:|
|`\forall`|$$\forall$$|`\exists`|$$\exists$$|`\emptyset`|$$\emptyset$$|
|`\in`|$$\in$$|`\ni`|$$\ni$$|`\notin`|$$\notin$$|
|`\subset`|$$\subset$$|`\subseteq`|$$\subseteq$$|`\supset`|$$\supset$$|
|`\supseteq`|$$\supseteq$$|`\bigcap`|$$\bigcap$$|`\cup`|$$\cup$$|
|`\bigcup`|$$\bigcup$$|`\biguplus`|$$\biguplus$$|`\setminus`|$$\setminus$$|
|`\smallsetminus`|$$\smallsetminus$$|`\sqsubset`|$$\sqsubset$$|`\sqsubseteq`|$$\sqsubseteq$$|
|`\sqsupset`|$$\sqsupset$$|`\sqsupseteq`|$$\sqsupseteq$$|`\sqcap`|$$\sqcap$$|
|`\sqcup`|$$\sqcup$$|`\bigsqcup`|$$\bigsqcup$$|`\cap`|$$\cap$$
|`\varnothing`|$$\varnothing$$|`\cap`|$$\cap$$

## 逻辑运算符

|代码|效果|代码|效果|代码|效果|
|:---:|:---:|:---:|:---:|:---:|:---:|
|`\land`|$$\land$$|`\wedge`|$$\wedge$$|`\bigwedge`|$$\bigwedge$$|
|`\bar{q}`|$$\bar{A}$$|`\to`|$$\to$$|`\lor`|$$\lor$$|
|`\vee`|$$\vee$$|`\bigvee`|$$\bigvee$$|`\lnot`|$$\lnot$$|
|`\neg`|$$\neg$$|`\And`|$$\And$$

## 关系运算符

|代码|效果|代码|效果|代码|效果|
|:---:|:---:|:---:|:---:|:---:|:---:|
|`\sim`|$$\sim$$|`\approx`|$$\approx$$|`\simeq`|$$\simeq$$|
|`\cong`|$$\cong$$|`\dot=`|$$\dot=$$|`\gtrapprox`|$$\gtrapprox$$|
|`<`|$$<$$|`\le`|$$\le$$|`\ll`|$$\ll$$|
|`\gg`|$$\gg$$|`\ge`|$$\ge$$|`>`|$$>$$|
|`\equiv`|$$\equiv$$|`\not\equiv`|$$\not\equiv$$|`\ne`|$$\ne$$|
|`\mbox{or}`|$$\mbox{or}$$|`\neq`|$$\neq$$|`\propto`|$$\propto$$|
|`\lessapprox`|$$\lessapprox$$|`\lesssim`|$$\lesssim$$|`\eqslantless`|$$\eqslantless$$|
|`\leqslant`|$$\leqslant$$|`\leqq`|$$\leqq$$|`\geqq`|$$\geqq$$|
|`\geqslant`|$$\geqslant$$|`\eqslantgtr`|$$\eqslantgtr$$|`\gtrsim`|$$\gtrsim$$|

## 几何符号

|代码|效果|代码|效果|代码|效果|
|:---:|:---:|:---:|:---:|:---:|:---:|
|`\Diamond`|$$\Diamond$$|`\Box`|$$\Box$$|`\triangle`|$$\triangle$$|
|`\angle`|$$\angle$$|`\perp`|$$\perp$$|`\mid`|$$\mid$$|
|`\nmid`|$$\nmid$$|`\|`|$$\|$$|`45^\circ`|$$45^\circ$$|

## 希腊字母

|代码|效果|代码|效果|代码|效果|代码|效果|
|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
|`\alpha`|$$\alpha$$|`\theta`|$$\theta$$|`o`|$$o$$|`\tau`|$$\tau$$|
|`\beta`|$$\beta$$|`\vartheta`|$$\vartheta$$|`\pi`|$$\pi$$|`\upsilon`|$$\upsilon$$|
|`\gamma`|$$\gamma$$|`\iota`|$$\iota$$|`\varpi`|$$\varpi$$|`\phi`|$$\phi$$|
|`\delta`|$$\delta$$|`\kappa`|$$\kappa$$|`\rho`|$$\rho$$|`\varphi`|$$\varphi$$|
|`\epsilon`|$$\epsilon$$|`\lambda`|$$\lambda$$|`\varrho`|$$\varrho$$|`\chi`|$$\chi$$|
|`\varepsilon`|$$\varepsilon$$|`\mu`|$$\mu$$|`\sigma`|$$\sigma$$|`\psi`|$$\psi$$|
|`\zeta`|$$\zeta$$|`\nu`|$$\nu$$|`\varsigma`|$$\varsigma$$|`\omega`|$$\omega$$|
|`\eta`|$$\eta$$|`\xi`|$$\xi$$|
|`\Gamma`|$$\Gamma$$|`\Lambda`|$$\Lambda$$|`\Sigma`|$$\Sigma$$|`\Psi`|$$\Psi$$|
|`\Delta`|$$\Delta$$|`\Xi`|$$\Xi$$|`\Upsilon`|$$\Upsilon$$|`\Omega`|$$\Omega$$|
|`\Theta`|$$\Theta$$|`\Pi`|$$\Pi$$|`\Phi`|$$\Phi$$|

## 箭头

|代码|效果|代码|效果|代码|效果|
|:---:|:---:|:---:|:---:|:---:|:---:|
|`\leftarrow`|$$\leftarrow$$|`\rightarrow`|$$\rightarrow$$|`\nleftarrow`|$$\nleftarrow$$|
|`\nrightarrow`|$$\nrightarrow$$|`\leftrightarrow`|$$\leftrightarrow$$|`\nleftrightarrow`|$$\nleftrightarrow$$|
|`\longleftarrow`|$$\longleftarrow$$|`\longrightarrow`|$$\longrightarrow$$|`\longleftrightarrow`|$$\longleftrightarrow$$|
|`\leftarrow`|$$\leftarrow$$|`\rightarrow`|$$\rightarrow$$|`\nleftarrow`|$$\nleftarrow$$|
|`\nrightarrow`|$$\nrightarrow$$|`\leftrightarrow`|$$\leftrightarrow$$|`\nleftrightarrow`|$$\nleftrightarrow$$|
|`\longleftarrow`|$$\longleftarrow$$|`\longrightarrow`|$$\longrightarrow$$|`\longleftrightarrow`|$$\longleftrightarrow$$|
|`\Leftarrow`|$$\Leftarrow$$|`\Rightarrow`|$$\Rightarrow$$|`\nLeftarrow`|$$\nLeftarrow$$|
|`\nRightarrow`|$$\nRightarrow$$|`\Leftrightarrow`|$$\Leftrightarrow$$|`\nLeftrightarrow`|$$\nLeftrightarrow$$|
|`\Longleftarrow`|$$\Longleftarrow$$|`\Longrightarrow`|$$\Longrightarrow$$|`\Longleftrightarrow`|$$\Longleftrightarrow$$|
|`\Leftarrow`|$$\Leftarrow$$|`\Rightarrow`|$$\Rightarrow$$|`\nLeftarrow`|$$\nLeftarrow$$|
|`\nRightarrow`|$$\nRightarrow$$|`\Leftrightarrow`|$$\Leftrightarrow$$|`\nLeftrightarrow`|$$\nLeftrightarrow$$|
|`\Longleftarrow`|$$\Longleftarrow$$|`\Longrightarrow`|$$\Longrightarrow$$|`\Longleftrightarrow`|$$\Longleftrightarrow$$|
|`\uparrow`|$$\uparrow$$|`\downarrow`|$$\downarrow$$|`\updownarrow`|$$\updownarrow$$|
|`\Uparrow`|$$\Uparrow$$|`\Downarrow`|$$\Downarrow$$|`\Updownarrow`|$$\Updownarrow$$|
|`\nearrow`|$$\nearrow$$|`\searrow`|$$\searrow$$|`\swarrow`|$$\swarrow$$|
|`\nwarrow`|$$\nwarrow$$|`\uparrow`|$$\uparrow$$|`\downarrow`|$$\downarrow$$|
|`\updownarrow`|$$\updownarrow$$|`\Uparrow`|$$\Uparrow$$|`\Downarrow`|$$\Downarrow$$|
|`\Updownarrow`|$$\Updownarrow$$|`\nearrow`|$$\nearrow$$|`\searrow`|$$\searrow$$|
|`\swarrow`|$$\swarrow$$|`\nwarrow`|$$\nwarrow$$|`\rightharpoonup`|$$\rightharpoonup$$|
|`\rightharpoondown`|$$\rightharpoondown$$|`\leftharpoonup`|$$\leftharpoonup$$|`\leftharpoondown`|$$\leftharpoondown$$|
|`\upharpoonleft`|$$\upharpoonleft$$|`\upharpoonright`|$$\upharpoonright$$|`\downharpoonleft`|$$\downharpoonleft$$|
|`\downharpoonright`|$$\downharpoonright$$|`\rightleftharpoons`|$$\rightleftharpoons$$|`\leftrightharpoons`|$$\leftrightharpoons$$|
|`\rightharpoonup`|$$\rightharpoonup$$|`\rightharpoondown`|$$\rightharpoondown$$|`\leftharpoonup`|$$\leftharpoonup$$|
|`\leftharpoondown`|$$\leftharpoondown$$|`\upharpoonleft`|$$\upharpoonleft$$|`\upharpoonright`|$$\upharpoonright$$|
|`\downharpoonleft`|$$\downharpoonleft$$|`\downharpoonright`|$$\downharpoonright$$|`\rightleftharpoons`|$$\rightleftharpoons$$|
|`\leftrightharpoons`|$$\leftrightharpoons$$|`\curvearrowleft`|$$\curvearrowleft$$|`\circlearrowleft`|$$\circlearrowleft$$|
|`\Lsh`|$$\Lsh$$|`\upuparrows`|$$\upuparrows$$|`\rightrightarrows`|$$\rightrightarrows$$|
|`\rightleftarrows`|$$\rightleftarrows$$|`\Rrightarrow`|$$\Rrightarrow$$|`\rightarrowtail`|$$\rightarrowtail$$|
|`\looparrowright`|$$\looparrowright$$|`\curvearrowleft`|$$\curvearrowleft$$|`\circlearrowleft`|$$\circlearrowleft$$|
|`\Lsh`|$$\Lsh$$|`\upuparrows`|$$\upuparrows$$|`\rightrightarrows`|$$\rightrightarrows$$|
|`\rightleftarrows`|$$\rightleftarrows$$|`\Rrightarrow`|$$\Rrightarrow$$|`\rightarrowtail`|$$\rightarrowtail$$|
|`\looparrowright`|$$\looparrowright$$|`\curvearrowright`|$$\curvearrowright$$|`\circlearrowright`|$$\circlearrowright$$|
|`\Rsh`|$$\Rsh$$|`\downdownarrows`|$$\downdownarrows$$|`\leftleftarrows`|$$\leftleftarrows$$|
|`\leftrightarrows`|$$\leftrightarrows$$|`\Lleftarrow`|$$\Lleftarrow$$|`\leftarrowtail`|$$\leftarrowtail$$|
|`\looparrowleft`|$$\looparrowleft$$|`\curvearrowright`|$$\curvearrowright$$|`\circlearrowright`|$$\circlearrowright$$|
|`\Rsh`|$$\Rsh$$|`\downdownarrows`|$$\downdownarrows$$|`\leftleftarrows`|$$\leftleftarrows$$|
|`\leftrightarrows`|$$\leftrightarrows$$|`\Lleftarrow`|$$\Lleftarrow$$|`\leftarrowtail`|$$\leftarrowtail$$|
|`\looparrowleft`|$$\looparrowleft$$|`\mapsto`|$$\mapsto$$|`\longmapsto`|$$\longmapsto$$|
|`\hookrightarrow`|$$\hookrightarrow$$|`\hookleftarrow`|$$\hookleftarrow$$|`\multimap`|$$\multimap$$|
|`\leftrightsquigarrow`|$$\leftrightsquigarrow$$|`\rightsquigarrow`|$$\rightsquigarrow$$

此外还有几个可以在箭头上下方写字的箭头。

|代码|效果|
|:---:|:---:|
|`\xleftarrow[下方公式]{上方公式}`|$$A\xleftarrow[下方公式]{上方公式}B$$|
|`\xrightarrow[下方公式]{上方公式}`|$$A\xrightarrow[下方公式]{上方公式}B$$|
|`\underrightarrow{演示}`|$$A\underrightarrow{演示}B$$|
|`\underleftarrow{演示}`|$$A\underleftarrow{演示}B$$|
|`\underleftrightarrow{演示}`|$$A\underleftrightarrow{演示}B$$|

## 其他各类符号

|代码|效果|代码|效果|代码|效果|
|:---:|:---:|:---:|:---:|:---:|:---:|
|`\ldots`|$$\ldots$$|`\cdots`|$$\cdots$$|`\vdots`|$$\vdots$$|
|`\ddots`|$$\ddots$$|`\aleph`|$$\aleph$$|`\prime`|$$\prime$$|
|`\infty`|$$\infty$$|`\hbar`|$$\hbar$$|`\Box$`|$$\Box$$|
|`\imath`|$$\imath$$|`\jmath`|$$\jmath$$|`\surd`|$$\surd$$|
|`\flat`|$$\flat$$|`\triangle`|$$\triangle$$|`\ell`|$$\ell$$|
|`\top`|$$\top$$|`\natural`|$$\natural$$|`\clubsuit`|$$\clubsuit$$|
|`\wp`|$$\wp$$|`\bot`|$$\bot$$|`\sharp`|$$\sharp$$|
|`\diamondsuit`|$$\diamondsuit$$|`\Re`|$$\Re$$|`\|`|$$\|$$|
|`\backslash`|$$\backslash$$|`\heartsuit`|$$\heartsuit$$|`\Im`|$$\Im$$|
|`\spadesuit`|$$\spadesuit$$|`\mho`|$$\mho$$

> 主要根据  [维基百科](https://zh.wikipedia.org/zh-hans/Help:%E6%95%B0%E5%AD%A6%E5%85%AC%E5%BC%8F) 制作
