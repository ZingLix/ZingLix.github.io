---
layout: post
title: "Go 语法快速上手"
subtitle: "Grammar Cheatsheet of Go"
date: 2020-5-18
author: "ZingLix"
header-img: "img/post-22.jpg"
catalog: true
tags:
  - Go
  - CheatSheet
---

> 本文并不是一篇面向新手的入门文章，而是面向于有一定编程经验而且希望快速上手 Go 语言的人
>
> 阅读本文章最好了解 C、C++、Java 等语言之一的语法
> 
> 由于我也处于尝试转向 Go 的过程中，本文中难免会有错误，接受一切纠错以及志同道合的人来交流，你可以在网站最下方找到我的联系方式

## 变量

变量需要显式的声明，完整的语法如下。

```go
var a int = 8
```

在提供初始化的值的时候，类型可以省略，不提供时则需要显式的写出类型。利用 `:=` 可以省略 `var`。`const` 替代 `var` 以表示常量。

```go
var a = 8     // 省略类型
var a int     // 无初始值
a := 8        // 简略写法，与第一行语义相同
const a = 8   // 常量
a, b := 1,2   // 多变量声明
_ := 8        // 可用 _ 表示一个匿名变量
```

Go 语言中不存在未初始化的说法，**声明时即使未指定初始值，也会用默认值进行初始化**。

## 数据类型

### 基础类型

Go 是一门强类型的静态语言，但是提供了自动的类型推导，内建的基础类型如下。

```go
int     // 有符号整数，32位为 int32, 64位为 int64
int8  int16  int32  int64
uint    // 无符号整数
uint8 uint16 uint32 uint64 uintptr
float32 float64  // 浮点数
byte    // 字节，与 uint8 相同
bool    // 布尔类型，true/false
string
```

### 内置类型

#### Array

Array 指具有指定固定长度的序列对象，即数组，类型为 `[N]type`，表明是长度为 `N` 元素类型为 `type` 的数组。

```go
var arr [10]int  // 长度为 10 类型为 int 的数组

arr[0] = 10      // 数组元素赋值，下标从 0 开始

arr := [...]int{0, 1}  // 初始化，长度可省略交由编译器计算
```

#### Slice

Slice 是没有固定长度的序列对象，称为切片，类型为 `[]type`，表明是元素类型为 `type` 的切片。

```go
// 初始化
slice := make([]int, length, capacity)  // make 为内置函数, capacity可省略
slice := []int{}

// 切片，语法与 Python 一致
slice[3:10]
slice[:8]

slice = append(slice, 4)  //添加元素，append 为内置函数，返回新的切片对象
```

#### Map

Map 为映射类型，类型为 `map[type1]type2`，表明是从 `type1` 映射到 `type2` 的 `map`。

```go
m := make(map[string]int)  // 初始化
m := map[string]int{
    "k1": 1,
    "k2": 2,
}

m["key"] = 0   // 赋值
m["new_key"]   // 如果是个不存在的 key, 那么会返回默认值

ele, exist := m["key"] // 可以用这种方式检查是否存在，不存在 ele 就会是默认值
```

### 结构体

Go 中不存在类，只有结构体。

```go
// 结构体声明，内部元素大写则外部可见，小写则不可见
type Complex struct{
    Real, Imag float32
}

complex = Complex{        // 这种方式未赋值的元素会以默认值初始化
    Real: 3, Imag: 4,
}
complex = Complex{3, 4}   // 这种赋值必须为所有元素赋值
complex.Real = 10         // 更新元素
```

Go 中没有继承的概念，通过组合的方式实现嵌套复用等目标。为结构体编写方法见 [函数](#函数) 一章。

### 接口

接口指只写明需要的方法，如下

```go
// 声明接口
type Number interface{
    add() int
}

// 使用接口
func add(n1 Number, n2 Number) int{
    return n1.add(n2)
}
```

如果接口为空，那么可以匹配任意的结构体。

## 运算符

Go 中的运算符如下。

```go
// 算术运算符
= - * / % ++ --  
// 关系运算符
== != > < >= <=
// 逻辑运算符
&& || !
// 位运算符
& | ^ >> <<
// 赋值运算符
+= -= *= //等等
// 指针相关运算符
& *
```
上述列出的所有运算符与 C 语言的运算符含义一致。值得注意的是自增自减操作符 `++` 与 `--` 不再像 C 语言中能够在语句中使用，只能单独使用，避免了歧义。

## 控制流

### if

判断即 `if` 语法如下

```go
if a % 2 == 0 {
    return true
}else{
    return false
}
```

除了 if 后不再需要括号之外，与 C 语言一致。此外，`if` 还可以在判断前加一句定义，如下

```go
if a:=10; a % 2==0{
    return true
}
```

### switch

`switch` 语法与 C 语言一致，不过每一个 `case` 默认 break，也就是说不会连续运行多个 `case`。

```go
// 同样可以先定义变量
switch a := getVal(); a {
    case 1:
        return a*2
    // 多条件匹配
    case 2, 4:
        return a*3
    default:
        return a*5
}

// 还可以进行判断
switch{
    case a>10:
        return a / 2
    default:
        return a / 3
}
```

### 循环

Go 中将 C 语言的三种循环简化了一种，均使用 `for` 关键词。

```go
// 完整形式
for i:=0; i<10; i++ {
    // ...
}

// 三个部分可以省略
for ; i<10; {
    // ...
}

// 上述情况可以省略分号，成为 while 形式
for i<10 {
    // ...
}

// 三个部分都省略后就成了 while(true)
for {

}

// 使用 range 简化遍历数组、切片等
for i, ele := range arr {
    // i 为下标， ele 为数组内元素 arr[i]
    // _, ele := range arr 这样用 _ 就能忽略其中一个
}
```

## 函数

函数的形式如下。

```go
// 定义
func fn_name(val type, val2 type2) (ret_type, ret_type2){
    // 函数体...
    // 支持多返回值
    return 0, "return"
}

// 调用
fn_name(v1, v2)  
```

可以为结构体编写函数，类似于成员函数。

```go
// 通过在该位置指明元素类型即可
func (c Complex) add(c2 Complex) Complex{
    return ...
}

// 也可以用指针，用来区分不同的传送参数的方式
func (c *Complex) add(c2 Complex) Complex{
    return ...
}
// 以上两种方法，前者会传递一个拷贝，不影响原值但是拷贝成本通常较高，
// 后者传递一个指针，可以直接操作原值，而且仅传输一个指针成本很低

// 调用，不区分函数接收的是不是指针
c.add(c2)
```

Go 还提供了函数类型，即闭包。闭包可以直接获得外部的变量，但是会成为一个新的变量，也就是说闭包内对外部变量的修改仅在闭包内有效，并不会真正影响到外部的变量。

```go
f := func(v int) int{
    return v+10
}

func test(f func() int){
    return f()+10
}
```

### defer

`defer` 关键词的含义是将该句话推迟到函数返回时执行，多个 `defer` 按照后进先出的顺序执行。

```go
func test(){
    mutex.Lock()
    defer mutex.Unlock()
    // 这里仍在保护区内
    return  // 这句话之前才会解锁
}
```

利用该语句实现了类似于 RAII 的效果，避免了因为函数体过长，文件忘记释放、互斥量忘记解锁这种情况的发生。

## 指针

Go 依旧保留了指针这一概念，整体与 C 语言一致，但是少了很多比较 tricky 的用法。主要是 `&` 与 `*` 两个操作符，分别对应了取地址和取地址上值的功能。

```go 
c := Complex{3,4} 
ptr = &c   // 指向 c 的指针

c. Real      // 3
(*ptr).Real  // 3, * 用来获得指针指向的内容
ptr.Real     // 3, 这里依旧不区分是否为指针
```

## 包管理

通过 `import` 关键词可以导入其他的包，例如

```go
import (
    "fmt"
    "math/rand"
    alias "another/rand"  // 冲突可以用这种方法换个名字
)
```

而每个源文件也必须用 `package` 指明自己被导入时的标识符。

```go
package main
```

导入之后就可以用该包名使用内部的函数了。

```go
import "fmt"
fmt.Println("yeah!")
```

## 协程

协程 (Goroutine) 是 Go 语言的一个关键特性，可以以极为方便的方式运行一个新的协程，这里协程的表现类似于线程。

### 创建

```go
// 正常调用一个函数，会等待运行结束
do_something()
// 用协程运行该函数，表现相当于新建一个线程运行该函数，不等待结果
go do_something()
```

### 同步

这里采用一个 Channel 的对象在不同协程间传递消息。

```go
ch := make(chan int)    // 消息类型为 int 的 Channel
ch <- 10                // 向 channel 中发送值 10，如果没读取就会阻塞
<- ch                   // 从 channel 中读取值，没有值就会阻塞
v, ok := <- ch          // 同时检查 channel 是否关闭
close(ch)               // 关闭 channel
func f(ch chan<- int)   // 只可以输入的 channel
ch := make(chan int,10) // 带缓冲的channel
```