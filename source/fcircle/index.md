---
menu_id: more
layout: page
title: 朋友圈
banner: https://p.268682.xyz/pic?img=ua
banner_info:
  avatar: https://wsrv.nl/?url=github.com%2FKemeow0815.png
  title: 朋友圈
  subtitle: 这里记录这朋友们的文章
rightbar: follow
---

<!-- <div id="friend-circle-container">与主机通讯中……</div>

<script defer src="/blog/js/fcircle-pjax.js"></script> -->
<div id="friend-circle-lite-root"></div>
<script>
    if (typeof UserConfig === 'undefined') {
        var UserConfig = {
            // 填写你的fc Lite地址
            private_api_url: 'https://fc-lite.268682.xyz/',
            // 点击加载更多时，一次最多加载几篇文章，默认20
            page_turning_number: 24,
            // 头像加载失败时，默认头像地址
            error_img: 'https://pic.imgdb.cn/item/6695daa4d9c307b7e953ee3d.jpg',
        }
    }
</script>
<link rel="stylesheet" href="/blog/css/fclite.min.css">
<script defer src="/blog/js/fclite.min.js"></script>