/*
 * Copyright (c) molikai-work (2024)
 * molikai-work 的特定修改和新增部分
 * 根据 MIT 许可证发布
 */

// 网站的启动日期
const startDate = new Date("2024-06-21");

// 获取当前时间
const currentTime = new Date();

// 获取年、月、日
const year = currentTime.getFullYear();
const month = currentTime.getMonth() + 1;
const day = currentTime.getDate();

// 获取小时、分钟
let hours = currentTime.getHours();
let minutes = currentTime.getMinutes();

// 判断上午/下午
let meridiem = "上午";
if (hours >= 12) {
  meridiem = "下午";
  hours = hours - 12;
}

// 格式化小时和分钟
hours = String(hours).padStart(2, "0");
minutes = String(minutes).padStart(2, "0");

// 获取当前日期
const currentDate = new Date();

// 计算时间差（以毫秒为单位）
const timeDiff = currentDate.getTime() - startDate.getTime();

// 将时间差转换为天数
const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));

// 打印控制台输出
console.log('%c' + `
Hello World!

` + '%c刷新截止时间：' + `
%c${year}%c年%c${month}%c月%c${day}%c日%c ${meridiem}%c ${hours}%c:%c${minutes}

%c网站运行时间起始于%c 2024-03-17
%cexample%c 短链，已经运行了 %c${daysDiff}%c 天。%c

` + `
Copyright 2023-Presen %cexample.%c All rights reserved.
由 %cX-DR/Short%c 的产品提供，二次修改在 %cmolikai-work/short%c，%cCloudflare%c 提供计算服务。

`
, 'color: lightcyan;', 

'color: green;', 
'color: lightgreen;', 'color: green;', 'color: lightgreen;', 'color: green;', 'color: lightgreen;', 'color: green;', 'color: lightgreen;', 'color: lightgreen;', 'color: green;', 'color: lightgreen;', 
'color: green;' , 'color: lightgreen;', 
'color: lightgreen;', 'color: green;', 'color: lightgreen;', 'color: green;', 

'color: grey;', 'color: lightcyan;', 'color: grey;', 
'color: lightcyan;', 'color: grey;', 'color: lightcyan;', 'color: grey;', 'color: lightcyan;', 'color: grey;');
