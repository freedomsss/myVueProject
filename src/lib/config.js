// 生产环境地址
const configProduction = {
  backendBaseUrl: '', //后台地址
};
// 开发环境地址
const configDev = {
  backendBaseUrl: '',
};
const config = process.env.NODE_ENV === 'production' ? configProduction : configDev;
export default config;
