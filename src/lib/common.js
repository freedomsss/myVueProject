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
  Vue.prototype.$requestStatus = requestStatus;
  Vue.prototype.config = config;
};
export default install;
