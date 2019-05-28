const isFunction = function (target) {
  return Object.prototype.toString.call(target) === '[object Function]'
}

const clearCache = function (cacheKey) {
  delete apiPromiseCache[cacheKey]
}

const apiPromiseCache = {}

export default function ApiService (options) {
  const {
    apiConfig: config,
    http,
    Vue
  } = options

  let apiService = {}
  const observerbel = Vue ? (Vue.observebel || (target => new Vue({data: target}))) : null

  for (const [apiName, apiConfig] of Object.entries(config)) {
    const {
      url,
      method,
      cache: useCache,
      cacheTime
    } = apiConfig

    const cacheKey = apiName
    const loadingKey = `${apiName}Loading`
    const api = apiService[apiName] = {}

    api[loadingKey] = false

    api.request = function ({path = {}, query = {}, body = {}, ...config} = {}) {
      const requestConfig = {
        ...config,
        url: isFunction(url) ? url(path) : url,
        method,
        params: query,
        data: body
      }

      return new Promise((resolve, reject) => {
        // 如果正在请求 则return
        if (api[loadingKey]) return resolve({data: {}})

        api[loadingKey] = true

        const requestPromise = apiPromiseCache[cacheKey] || http.request(requestConfig)

        requestPromise.then((...arg) => {
          resolve(...arg)

          // 成功后缓存promise
          if (useCache && !apiPromiseCache[cacheKey]) {
            apiPromiseCache[cacheKey] = requestPromise

            if (cacheTime) {
              setTimeout(api.clearCache, cacheTime)
            }
          }
        }, reject).finally(() => api[loadingKey] = false)
      })
    }

    api.clearCache = clearCache.bind(null, cacheKey)
  }

  return observerbel ? observerbel(apiService) : apiService
}
