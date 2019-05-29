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
      cacheTime,
      debounce: aipDebounce
    } = apiConfig

    const cacheKey = apiName
    const api = apiService[apiName] = {}

    api.loading = false

    api.request = function (request = {}) {
      const {
        path = {},
        query = {},
        body = {}
      } = request

      const requestConfig = Object.assign(request, {
        url: isFunction(url) ? url(path) : url,
        method,
        params: query,
        data: body
      })

      return new Promise((resolve, reject) => {
        // 防抖
        if (api.loading && ('debounce' in request ? request.debounce : aipDebounce)) return resolve({data: {}})

        api.loading = true

        const requestPromise = apiPromiseCache[cacheKey] || http.request(requestConfig)

        if (useCache && !apiPromiseCache[cacheKey]) {
          apiPromiseCache[cacheKey] = requestPromise

          if (cacheTime) {
            setTimeout(api.clearCache, cacheTime)
          }
        }

        requestPromise.then(resolve, reject).finally(() => api.loading = false)
      })
    }

    api.clearCache = clearCache.bind(null, cacheKey)
  }

  return observerbel ? observerbel(apiService) : apiService
}
