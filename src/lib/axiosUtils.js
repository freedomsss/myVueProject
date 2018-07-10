/* eslint-disable no-param-reassign*/
import axios from 'axios';
import config from './config';
import { getToken, getUserInfo } from './getLoginInfo';

const instance = axios.create({
  baseURL: config.backendBaseUrl,
  timeout: 30000,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'phoneType': 'H5',
  },
});

// 添加请求拦截器
instance.interceptors.request.use(
  (axiosConfig) => {
    if (localStorage.getItem('openId')) {
      axiosConfig.headers['X-User-OpenId'] = localStorage.getItem('openId');
    }
    const token = getToken() || window.vm.$config.token;
    if (token) {
      axiosConfig.headers['X-User-Token'] = token;
    }
    return axiosConfig;
  },
  // 对请求错误做些什么
  error => Promise.reject(error),
);

// 添加响应拦截器
instance.interceptors.response.use(
  // 对响应数据做点什么
  (response) => {
    if (response.data.code === -1) {
      window.vm.$store.dispatch('removeUser');
      if (window.android && window.android.JSLogin) {
        window.android.JSLogin();
      } else {
        window.vm.$router.push({
          name: 'Login',
          params: {
            history: true,
          },
          query: {
            tokenInvalid: true,
          },
        });
        window.vm.$bus.$emit('showPopup', {
          name: 'tip',
          data: '登录失效，请重新登录！',
        });
      }
    }
    return response.data;
  },
  // 对响应错误做点什么
  (error) => {
    let errorMsg = null;
    if (error.response) {
      errorMsg = `网络异常[${error.response.status}]`;
    } else if (error.request) {
      // 超时
      if (error.request.readyState === 4 && error.request.status === 0) {
        errorMsg = '请求超时';
      } else {
        errorMsg = '请求失败';
      }
    }
    window.vm.$bus.$emit('showPopup', {
      name: 'tip',
      data: errorMsg || error,
    });
    return Promise.reject(error);
  },
);

instance.postTrace = (data) => {
  const mobile = getUserInfo('mobile');
  let postData = [];
  if (Array.isArray(data)) {
    postData = data.map((item) => {
      if (!item.userId) {
        item.userId = mobile;
      }
      item.type = 'H5';
      return item;
    });
    postData = data;
  } else {
    postData = [{
      ...data,
      userId: mobile,
      type: 'H5',
      time: data.time || Date.parse(new Date()) / 1000,
    }];
  }
  return axios.post(config.traceUrl, postData);
};

export default instance;
