import wx from 'weixin-jsapi';
import { isWeixin } from './env';

export default function wxShare() {
  if (!isWeixin) {
    return;
  }
  const path = '/fbd/app/activity/share/FBD001/info';
  this.$http.get(path).then((res) => {
    if (res.code === 0) {
      const shareDetail = res.data;
      const shareData = {
        title: shareDetail.title,
        link: `${shareDetail.url}?userId=${this.$store.getters.userId}`, // 分享链接，该链接域名或路径必须与当前页面对应的公众号JS安全域名一致
        imgUrl: shareDetail.logoUrl, // 分享图标
        desc: shareDetail.content, // 分享描述
        success: () => {
          this.showShareResult('分享成功');
        },
        cancel: () => {
          this.showShareResult('分享取消');
        },
        error: (error) => {
          this.showShareResult(error);
        },
      };
      wx.ready(() => {
        // 微信朋友圈
        wx.onMenuShareTimeline(shareData);
        // 微信好友
        wx.onMenuShareAppMessage(shareData);
      });
    }
  });
}
