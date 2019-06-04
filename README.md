# axios-api-service

解决问题：

1、在接口还未响应时再次调用接口时会做出拦截，不会发起请求

2、结合Vue可创建接口loading的响应式状态

3、接口缓存 适用于get请求

## Install
```shell
npm install axios-api-service -S
```

## Quick Start
``` javascript
import Vue from 'vue'
import axios from 'axios'
import axiosApiService from 'axios-api-service'

const http = axios.create({
  baseUrl: 'mokeUrl'
})

const apiConfig = {
  login: {
    url: 'xxxx',
    method: 'get',
    // 是否开启缓存
    cache: true,
    // 缓存时间 默认为无限制
    cacheTime: 3000
  },
  // 支持 RESTful API 风格
  logout: {
    url (path) {
      // path 参数在调用api的时候传入
      return `/xxx/${path.xxx}`
    },
    // 开启防抖
    debounce: true,
    method: 'get'
  }
}

const apiService = axiosApiService({
  http,
  Vue,
  apiConfig
})

//use 返回promise
apiService.login.request(<config>)

// 当前api的loading状态
console.log(apiService.login.loading) // true

// 手动清除api缓存
apiService.login.clearCache()
```

## API

### config:

属性  |  说明  |  类型  |  默认值
:-------: | -------  |  :-------:  |  :-------:
query  |  url带参  |  Object  |  --
body  |  http请求体带参  |  Object  |  --
path  |  动态url（RESTful API风格）  |  Object  |  --
debounce  |  当前请求是否防抖（防止重复提交）  |  Boolean  |  --

config 可配置 axios 的其他配置 例如 headers

作者wx: ckang1229

