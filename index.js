const isFunction = function (target) {
  return Object.prototype.toString.call(target) === '[object Function]'
}

export default function ApiService (options) {
  const {
    apiConfig,
    http,
    Vue
  } = options

  let apiService = {}
  const observerbel = Vue ? (Vue.observebel || (target => new Vue({data: target}))) : null

  for (const [apiName, getApiConfig] of Object.entries(apiConfig)) {
    const loadingKey = `${apiName}Loading`
    const api = apiService[apiName] = {}

    api[loadingKey] = false

    api.request = function ({path = {}, query = {}, body = {}, ...config} = {}) {
      const {
        url,
        method,
        cache
      } = isFunction(getApiConfig) ? getApiConfig(path) : getApiConfig

      const requestConfig = {
        ...config,
        url,
        method,
        params: query,
        data: body
    }

      return new Promise((resolve, reject) => {
        // 如果正在请求 则return
        if (api[loadingKey]) return resolve({data: {}})

        api[loadingKey] = true

        http.request(requestConfig).then(resolve, reject).finally(() => api[loadingKey] = false)
      })
    }
  }

  return observerbel ? observerbel(apiService) : apiService
}
