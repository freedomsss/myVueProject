/* eslint-disable no-param-reassign */

import { doPost, doGet, doPostForm, doPut, doDelete } from './asyncUtil';
import requestStatus from './requestStatus';
import config from './config';

const install = (Vue) => {
  // eventBus
  Vue.prototype.$bus = new Vue();
  Vue.prototype.$http = {
    get: doGet,
    post: doPost,
    postForm: doPostForm,
    put: doPut,
    delete: doDelete,
  };
  // 上传图片显示本地图片
  Vue.prototype.$imageReader = (file) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    if (window.URL) { // mozilla(firefox)
      return window.URL.createObjectURL(file);
    } else if (window.webkitURL) { // webkit or chrome
      return window.webkitURL.createObjectURL(file);
    }
    return window.createObjectURL(file);
  };
  Vue.prototype.$requestStatus = requestStatus;
  Vue.prototype.config = config;
};
export default install;
