<script setup lang="ts">
import { onLaunch, onShow, onHide } from "@dcloudio/uni-app";
onLaunch(() => {
  wx.cloud.init({
    env: 'your-cloud-env-id',
    traceUser: true,
  })
});
onShow(() => {
});
onHide(() => {
});
</script>
<style lang="scss">
@import 'uview-plus/index.scss';
page {
  background-color: #0A1628;
  color: #FFFFFF;
}
</style>
