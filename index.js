let apiPromiseCache = {}

const isFunction = function (target) {
  return Object.prototype.toString.call(target) === '[object Function]'
}

function clearCache (cacheKey) {
  delete apiPromiseCache[cacheKey]
}

function ApiService (options) {
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
    } = apiConfig

    const api = apiService[apiName] = {}

    api.loading = false

    api.request = function (requestConfig = {}) {
      const {
        path = {},
        query = {},
        body = {}
      } = requestConfig

      const url = isFunction(url) ? url(path) : url

      requestConfig = Object.assign(requestConfig, {
        url,
        method,
        params: query,
        data: body
      })

      const cacheKey = `${requestConfig.url}__${JSON.stringify(query)}__${JSON.stringify(body)}`
      const {
        cache,
        cacheTime,
        debounce
      } = Object.assign({}, apiConfig, requestConfig)

      return new Promise((resolve, reject) => {
        // 防抖
        if (api.loading && debounce) return resolve({data: {}})

        api.loading = true

        const requestPromise = apiPromiseCache[cacheKey] || http.request(requestConfig)

        requestPromise
          .then((...arg) => {
            if (cache && !apiPromiseCache[cacheKey]) {
              apiPromiseCache[cacheKey] = requestPromise

              if (cacheTime) {
                setTimeout(() => clearCache(cacheKey), cacheTime)
              }
            }

            resolve(...arg)
          }, reject)
          .finally(() => api.loading = false)
      })
    }

    api.clearCache = function () {
      let newCache = {}

      for (const cacheKey of Object.keys(apiPromiseCache)) {
        if (!cacheKey.includes(url)) {
          newCache[cacheKey] = apiPromiseCache[cacheKey]
        }
      }

      apiPromiseCache = newCache
    }
  }

  return observerbel ? observerbel(apiService) : apiService
}

ApiService.clearAllCache = function () {
  apiPromiseCache = {}
}

export default ApiService
