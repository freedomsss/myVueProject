<template>
  <el-upload
    v-loading="loading"
    class="avatar-uploader"
    :action="uploadUrl"
    :headers="headers"
    :show-file-list="false"
    :on-success="handleAvatarSuccess"
    :on-error="handleAvatarError"
    :before-upload="beforeAvatarUpload">
    <img v-if="imageUrl" :src="imageUrl" class="avatar">
    <i v-else class="el-icon-plus avatar-uploader-icon"></i>
  </el-upload>
</template>
<script>
import { baseUrl, getToken } from '../../lib/asyncUtil';

const requestHeaders = {
  'Accept': 'application/json',
};
const uploadPath = '/admin/system/headImgUpload';
export default {
  name: 'Upload',
  props: {
    uploadCallBack: {
      type: Function,
    },
    fileType: {
      type: String,
      default: 'image',
    },
    imageUrl: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      uploadUrl: `${baseUrl}${uploadPath}`,
      loading: false,
      headers: {
        ...requestHeaders,
        ...(getToken() && { 'X-User-Token': getToken() }),
      },
    };
  },
  methods: {
    handleAvatarSuccess(res, file) {
      this.loading = false;
      if (res.code === 0) {
        const callBackData = {
          file,
          urls: res.data,
        };
        this.uploadCallBack(callBackData);
        return;
      }
      this.$requestStatus(res);
    },
    handleAvatarError(err, file) {
      this.loading = false;
      this.$message.error(err);
    },
    beforeAvatarUpload(file) {
      const isRightType = file.type.indexOf(this.fileType) !== -1;
      const isLt3M = file.size / 1024 / 1024 < 3;
      if (!isRightType) {
        this.$message('文件格式不正确');
        return false;
      }
      if (!isLt3M) {
        this.$message('文件大小不得超过3M');
        return false;
      }
      this.loading = true;
      return true;
    },
  },
};
</script>
<style lang="less" scoped>
@avatar_size: 178px;
.avatar-uploader{
  width: @avatar_size;
  height: @avatar_size;
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  text-align: center;
  &:hover {
    border-color: #409EFF;
  }
  .avatar-uploader-icon {
    font-size: 28px;
    color: #8c939d;
    width: @avatar_size;
    height: @avatar_size;
    line-height: @avatar_size;
    text-align: center;
  }
  .avatar {
    max-width: 100%;
    max-height: 100%;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
}
</style>
