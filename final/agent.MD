重做整个风格。

响应式断点区间划分
手机：< 768px
平板：768px – 1023px
电脑：≥ 1024px

完全删除现在的topbar的style.css，它们很混乱，
统一除了map页面所有的topbar的样式：
电脑：
    都使用 左中右，
    左边是back，中间是页面标题，右边是logo
平板：
    topbar变厚
    左上back，右上logo，这两个并列一行
    标题在下面一行
手机：
    和平板一样

map页面
（map页面的topbar厚度和其他页面的topbar的电脑模式高度相同，但是map页面的topbar厚度不变）
地图大小随设备越小变越小

电脑：
    左边标题，右边logo
    导航按钮和现在一样悬浮在地图右上角
平板：
    左边标题，右边logo
    导航按钮和现在一样悬浮在地图右上角
手机：
    logo悬浮在topbar下面的地图上，地图的右上角，topbar的右下方
    导航按钮放到屏幕最下方，悬浮在地图上，注意按钮到屏幕左右边缘的距离，现在只有左边是正常的，右边紧贴着右边屏幕边缘
    


Responsive design that adapts to different screen sizes and devices
