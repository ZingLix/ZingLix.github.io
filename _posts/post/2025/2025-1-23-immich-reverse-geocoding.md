---
layout: post
title: "Immich 反向地理编码原理和汉化思路"
subtitle: "Understanding Immich Reverse Geocoding and Localization Approach"
date: 2025-1-23
author: "ZingLix"
header-img: "img/post-13.png"
catalog: true
tags:
  - Immich
  - 开源
---

Immich 默认识别出来的照片位置都奇奇怪怪的，不仅仅是英文，还有一些不常见的名字，在照片分类搜索的时候非常麻烦。周末仔细研究了下 Immich 到底是怎么实现反向地理编码的，并想办法对其进行了汉化。

> 如果你到这里，是为了实现地名汉化的话，请直接前往 [这个项目](https://github.com/ZingLix/immich-geodata-cn)

## Immich 反向地理编码工作原理

为了能够实现汉化的目标，首先我们得先明白 Immich 是怎么在本地实现反向地理编码的。

### 反向编码

以下以 v1.124.2 为例，Immich 的反向地理编码都实现在 [`reverseGeocode`](https://github.com/immich-app/immich/blob/1311189fab958bea2177a92e1cc1b7ebb1822bd8/server/src/repositories/map.repository.ts#L108) 这个函数中，传入的是一个 `GeoPoint` 对象，实际上就是经度和纬度。

之后，根据经纬度，进行了如下的 SQL 查询

```sql
SELECT *
FROM geodata_places
WHERE 
    earth_box(ll_to_earth_public(${point.latitude}, ${point.longitude}), 25000) 
    @> ll_to_earth_public(latitude, longitude)
ORDER BY 
    earth_distance(
        ll_to_earth_public(${point.latitude}, ${point.longitude}), 
        ll_to_earth_public(latitude, longitude)
    )
LIMIT 1;
```

这其中

- `earth_box` 创建一个以给定点为中心的球体范围
- `ll_to_earth_public` 将地理坐标 (纬度和经度) 转换为三维球体上的点

`WHERE` 子句筛选出 **距离输入的目标点 25,000 米（25 公里）范围内** 的地理点，`ORDER BY` 子句根据距离从近到远排序。换句话说，就是找到了 `geodata_places` 库中，距离输入点最近的地理点。


找到了最近的点之后，取出这个点的 `{ countryCode, name: city, admin1Name }`，也就是 **国家码**、**名称**、**一级行政区名称**。整理一下顺序，将国家码转换成国家名，这就对应了我们在 Immich 中看到的照片位置中的 **国**、**省**、**市** 三级。至于这个表是如何构建的，后面我们再单独分析。

这里名称和一级行政区名称都是直接从数据库表中得到的，而国家名是从国家码转换得到的，这里用到了 [node-i18n-iso-countries](https://github.com/michaelwittig/node-i18n-iso-countries) 这个库的 `getName` 方法。但在 Immich 中，调用时的代码是 `getName(countryCode, 'en')`，将语言用 `'en'` 写死了，所以只能是英文，并没有加上任何 i18n 的机制。

而如果上面没有找到的话，就会再进行一次 SQL 查询

```sql
SELECT *
FROM naturalearth_countries
WHERE coordinates @> point(:longitude, :latitude)
LIMIT 1;
```

这段 SQL 就是在 `naturalearth_countries` 表中找到哪些记录的 coordinates 包含输入的坐标，也就是根据自然地球中国家的划分，确定坐标所在的国家。如果走到这一条，则不会再去确定更细粒度的省市两级划分。

**简而言之，Immich 就是在数据库里事先准备好了大量地名，然后用照片的坐标去匹配数据库里最近的地名，之后就以该地名作为照片的地名。找不到的话，就退化到只用国家信息，根据国家的区划划分。**

### 数据构建

接下来的一个大问题就是，数据库里的数据是从哪来的。

Immich 所有的反向地理编码数据都来的 [GeoNames](https://www.geonames.org/)，放在了 `/build/geodata` 文件夹下，每次发版都会从 [这里](https://download.geonames.org/export/dump/) 获取最新的数据。

文件夹中有这么几个文件：

- admin1CodesASCII.txt：一级行政区划列表（`id | name | name ascii | geoname id`）
- admin2Codes.txt：二级行政区划列表（`id | name | name ascii | geoname id`）
- cities500.txt：所有人口大于 500 的城市列表
- geodata-date.txt：数据更新时间
- ne_10m_admin_0_countries.geojson：自然地球国家划分，详细介绍可以 [看这](https://github.com/nvkelso/natural-earth-vector/tree/master)

Immich 导入的入口在 [`init`](https://github.com/immich-app/immich/blob/1311189fab958bea2177a92e1cc1b7ebb1822bd8/server/src/repositories/map.repository.ts#L41C1-L42C1) 函数中，这里会首先查看 `system-metadata` 中 key 为 `reverse-geocoding-state` 的值，里面记录了 `lastUpdate` 的时间，也就是上次导入数据的时间。会将这个时间与 `geodata-date.txt` 文件中的时间进行比较，如果文件中时间较新则说明有更新的数据则开始导入，否则就跳过避免重复导入。

具体导入的逻辑在 [`importGeodata`](https://github.com/immich-app/immich/blob/1311189fab958bea2177a92e1cc1b7ebb1822bd8/server/src/repositories/map.repository.ts#L207) 中，其中抛开建立表的逻辑，核心在于 [`loadCities500`](https://github.com/immich-app/immich/blob/1311189fab958bea2177a92e1cc1b7ebb1822bd8/server/src/repositories/map.repository.ts#L226C3-L226C11) 函数。

cities500.txt 中格式类似 csv，以 `\t` 作为分隔，通过如下规则转换成数据库中的内容

```js
id: Number.parseInt(lineSplit[0]),
name: lineSplit[1],
alternateNames: lineSplit[3],
latitude: Number.parseFloat(lineSplit[4]),
longitude: Number.parseFloat(lineSplit[5]),
countryCode: lineSplit[8],
admin1Code: lineSplit[10],
admin2Code: lineSplit[11],
modificationDate: lineSplit[18],
admin1Name: admin1Map.get(`${lineSplit[8]}.${lineSplit[10]}`) ?? null,
admin2Name: admin2Map.get(`${lineSplit[8]}.${lineSplit[10]}.${lineSplit[11]}`) ?? null,
```

这其中 `admin1Map` 和 `admin2Map` 就是通过读取 `admin1CodesASCII.txt` 和 `admin2Codes.txt` 中 `id` 到 `name` 的映射关系得到的。

再结合前面提到的反向编码逻辑，就是根据 `latitude` 和 `longitude` 找到最近的点，然后拿到他的 `countryCode`、`admin1Name` 和 `name`，这一信息就作为了照片的地理位置信息。

> 没错，admin2Name 根本没用上，admin2Codes.txt 也没用

## 汉化思路

Immich 将照片的地理位置信息分为了 **国**、**省**、**市** 三级。再捋一遍文件的作用，也就是

- 从 cities500.txt 中找到最近的点，拿到他的名称作为 **市**
- 根据这个点的 admin1Code 信息，去 admin1CodesASCII.txt 文件中找到 **省** 级别的名称
- 根据这个点的 countryCode，用 [node-i18n-iso-countries](https://github.com/michaelwittig/node-i18n-iso-countries) 转换成 **国** 级别名称

作用搞清楚了，接下来汉化的思路就好搞了

### 国

这一步骤主要依赖 [node-i18n-iso-countries](https://github.com/michaelwittig/node-i18n-iso-countries) 这个库，而 [代码](https://github.com/immich-app/immich/blob/1311189fab958bea2177a92e1cc1b7ebb1822bd8/server/src/repositories/map.repository.ts#L131) 中把转换的目标语言写死为了 `en`，那么没有办法改目标语言，就只能从这个库的数据入手。

这个库的数据来源也是通过静态文件的形式实现的，具体文件内容可以看 [这里](https://github.com/michaelwittig/node-i18n-iso-countries/tree/master/langs)。`en.json` 就是转换成 `'en'` 时候的数据来源，那我们只需要将其改写成中文即可，而中文的信息就在 `zh.json` 里，替换掉即可，就像 [这样](https://github.com/ZingLix/immich-geodata-cn/blob/main/i18n-iso-countries/langs/en.json)。

最后，将修改后的文件替换掉 Immich 镜像中的原始文件就可以了。

### 省

省的名称都在 admin1CodesASCII.txt 文件中，好在 [GeoNames](https://download.geonames.org/export/dump/) 提供了 alternateNamesV2.zip 这一文件，包含了许多地点的不同语言的名称，借助这一信息可以直接进行翻译，替换掉原来的名称即可。代码实现在 [这里](https://github.com/ZingLix/immich-geodata-cn/blob/432198c58216c1d7de75f8283ae35fd310abd8ae/geodata/translate.py#L119)。

### 市

cities500.txt 这个文件主要的目标就是翻译 name 字段，但观察这个文件后可以发现，它的粒度非常细，不仅仅到市一级，还可能是区或者县，还是很古老的名字，非常不适合使用。

为了解决这个问题，可以通过地图提供商的逆向地理编码 API 对这些地方进行重新识别，获得标准的一级、二级行政区划名称，这里分别实现了适用于 [国内采用高德的版本](https://github.com/ZingLix/immich-geodata-cn/blob/main/geodata/generate_geodata_amap.py) 和 [国外使用 LocationIQ 的版本](https://github.com/ZingLix/immich-geodata-cn/blob/main/geodata/generate_geodata_locationiq.py)。

另外，默认的 cities500.txt 文件由于数据量有限，部分地区数据点较少，就会导致 Immich 在反向地理编码的时候出错。而实际上，[GeoNames](https://download.geonames.org/export/dump/) 还提供了不同国家的完整地理点信息，比如 `CN.zip`，可以作为补充添加进 cities500.txt 以提升效果，实现在 [这里](https://github.com/ZingLix/immich-geodata-cn/blob/main/geodata/enhance_data.py)。但考虑到数据量庞大，所以只默认增加了直辖市，有需要的再增加。

## 总结

以上总结了 Immich 逆向地理编码的原理，以及分享了如何实现汉化的，代码都放在了这个 [仓库](https://github.com/ZingLix/immich-geodata-cn) 中，也有现成的东西可以用。
 