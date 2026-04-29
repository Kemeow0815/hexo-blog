---
title: 代码块样式测试
tags:
  - 测试
  - 代码块
categories: 测试文章
description: 测试 macOS 风格的代码块样式
abbrlink: ed02a91f
date: 2026-04-25 17:00:00
---

# 代码块样式测试

本文用于测试新添加的 macOS 风格代码块样式。

## JavaScript 代码示例

```javascript
// 主题切换功能
const switchToTheme = (theme, message) => {
  applyTheme(theme)
  window.localStorage.setItem('Stellar.theme', theme)
  utils.dark.mode = theme === 'auto' 
    ? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light") 
    : theme;
  utils.dark.method.toggle.start();
  hud?.toast?.(message)
}

console.log('Hello, Stellar!')
```

## Python 代码示例

```python
# 简单的 Python 示例
def greet(name):
    """打招呼函数"""
    print(f"Hello, {name}!")
    
if __name__ == "__main__":
    greet("Kemeow0815")
```

## CSS 代码示例

```css
/* macOS 风格圆点按钮 */
.highlight::before {
  content: '';
  position: absolute;
  left: 12px;
  top: 12px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: #ff5f56;
  box-shadow: 20px 0 #ffbd2e, 40px 0 #27c935;
}
```

## HTML 代码示例

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <title>测试页面</title>
</head>
<body>
  <h1>Hello World</h1>
</body>
</html>
```

## YAML 配置示例

```yaml
# Stellar 主题配置
inject:
  head:
    - '<link rel="stylesheet" href="/css/custom-codeblock.css">'
    
style:
  prefers_theme: auto
  smooth_scroll: true
```

## Shell 命令示例

```bash
# Hexo 常用命令
hexo clean
hexo generate
hexo server
hexo deploy
```

## Java 代码示例

```java
public class HelloWorld {
    public static void main(String[] args) {
        System.out.println("Hello, Stellar!");
    }
}
```

## C++ 代码示例

```cpp
#include <iostream>
using namespace std;

int main() {
    cout << "Hello, World!" << endl;
    return 0;
}
```

## Go 代码示例

```go
package main

import "fmt"

func main() {
    fmt.Println("Hello, Stellar!")
}
```

## Rust 代码示例

```rust
fn main() {
    println!("Hello, Stellar!");
}
```

## PHP 代码示例

```php
<?php
echo "Hello, Stellar!";
?>
```

## SQL 查询示例

```sql
SELECT * FROM users 
WHERE status = 'active' 
ORDER BY created_at DESC;
```

## Ruby 代码示例

```ruby
class HelloWorld
  def self.greet
    puts "Hello, Stellar!"
  end
end
```

## 测试说明

现在代码块应该显示：

1. ✅ **三个 macOS 圆点按钮**（红、黄、绿）
2. ✅ **"优雅借鉴"文字**在圆点右侧
3. ✅ **鼠标悬停时变色**效果
4. ✅ **作者签名**在右下角
5. ✅ **精美的语法高亮**

如果看不到圆点，请检查：
- CSS 文件是否正确加载
- 浏览器缓存是否已清除
- 代码块是否使用了正确的语言标记

---

**测试时间**: 2026-04-25  
**测试者**: Kemeow0815
