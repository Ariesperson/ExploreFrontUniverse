<template>
  <div class="setting-comp">
    <div class="setting-comp-menu">
      <span
        v-for="item in tabs"
        :key="item.id"
        :class="{ actived: activedTab === item.id }"
        @click="tabClick(item)"
        >{{ item.name }}</span
      >
    </div>
    <div class="setting-comp-container">
      <div class="setting-comp-content">
        <div class="setting-title setting-accout">账号信息</div>
        <div class="user-info">
          <div class="user-avatar">
            {{ userInfo.userName && userInfo.userName.substr(-2) }}
          </div>
          <div class="user-base-info">
            <div class="user-name">{{ userInfo.userName }}</div>
            <div class="user-mobile">{{ userInfo.mobile }}</div>
          </div>
        </div>
        <div class="password-secure setting-line">
          <span>密码安全</span>
          <button
            class="setting-line-value"
            size="small"
            text="修改密码"
            @click="showModPWPop"
          ></button>
        </div>
        <div class="password-secure-notice">
          修改成功后需要重新登录,请谨慎操作
        </div>

        <div class="setting-title setting-notice">消息通知</div>
        <div class="notice-switch setting-line">
          <span>新消息声音</span>
          <div class="setting-line-value" style="padding: 0">
            <switch
              :value="!setting.partner_voice_close_status"
              @changed="voiceChange"
            />
          </div>
        </div>
        <div class="setting-line" v-show="!setting.partner_voice_close_status">
          <span></span>
          <div
            :class="{
              'setting-line-value': true,
              'voice-play': true,
              playing: isPlaying,
            }"
            @click="playVoice"
          >
            <span>{{ !isPlaying ? "预览声音" : "播放中" }}</span>
            <i
              :class="
                !isPlaying ? 'x-icon-action-bofang' : 'x-icon-action-zanting'
              "
            ></i>
          </div>

          <popover
            x="popover"
            trigger="click"
            title="请检查浏览器设置"
            width="350"
            @shown="showWebPop"
          >
            <span slot="reference" class="not-play-audio">
              <span>无法播放声音</span>
              <i class="x-icon-notice-help1" style="font-size: 14px"></i>
            </span>
            <!-- <button slot="reference" text="无法播放声音" status="ghost" iconRight="x-icon-notice-help1"/> -->
            <main>
              <div style="color: #333"></div>
              <div style="font-size: 12px; margin-top: 8px">
                chrome：点击浏览器地址栏左侧小锁（<img
                  src="https://img.dmallcdn.com/dshop/202109/0f3ed04e-58fb-44ee-98a9-916cc0694246"
                  width="16"
                />）图标（查看网站设置）→点击【网站设置】→找到【声音】→设置为【允许】。
              </div>
              <div style="font-size: 12px; margin-top: 8px">
                火狐：点击浏览器地址栏左侧盾牌（<img
                  src="https://img.dmallcdn.com/dshop/202109/1b4fb031-eae4-43c5-9cab-e31fef1f2b0f"
                  width="16"
                />）图标→点击【保护设置】→找到【权限设置】中的【自动播放】→设置为【允许】。
              </div>
            </main>
          </popover>
        </div>

        <!-- <div class="setting-title setting-appearance">外观</div> -->
        <!-- <div class="setting-line">
          <span>内容密度</span>
          <div class="dropdown setting-line-value">
            <dropdown
              text="常用命令"
              type="link"
              icon="x-icon-action-setting"
              @command="sizeChange"
              :data="sizeList"
            >
              <div class="size-select">
                <i :class="['size-icon', activedSize.icon]"></i>
                <span>{{ activedSize.label }}</span>
                <i class="x-icon-directive-downarrow"></i>
              </div>
            </dropdown>
          </div>
        </div> -->
        <div class="setting-title setting-freshman">新手引导</div>
        <div class="setting-line">
          <div class="setting-line-fresh">
            <div>
              <span class="line-fresh-title">重置新手引导</span>
              <button text="重置" size="small" @click="resetFresh"></button>
            </div>
            <div class="line-fresh-content">重新了解多点飞拓框架功能</div>
          </div>
        </div>
      </div>
    </div>
    <pop
      x="modifyPassword"
      title="修改密码"
      height="450px"
      width="540px"
      :wrapperClosable="false"
    >
      <form
        x="modPwForm"
        clear-button="{{false}}"
        confirm-button="{{false}}"
        bindconfirm="modPassword"
        layout="vertical"
      >
        <!--input readonly阻止浏览器默认填充-->
        <input
          type="text"
          not-cabinx-tag
          autocomplete="off"
          readonly
          style="height: 0px; width: 0px; border: 0px"
        />
        <input
          type="password"
          not-cabinx-tag
          autocomplete="off"
          readonly
          style="height: 0px; width: 0px; border: 0px"
        />
        <item
          node="input"
          name="oldPassword"
          label="原密码"
          :type="showOriginText ? 'text' : 'password'"
          autocomplete="new-password"
          placeholder="请输入原密码"
        >
          <actions>
            <i
              @click="switchOrigin"
              :class="[
                { 'x-icon-action-eyes-close1': !showOriginText },
                { 'input-eye': true },
                { 'x-icon-action-eyes-open1': showOriginText },
              ]"
            ></i>
          </actions>
        </item>
        <item
          node="input"
          name="newPassword"
          label="新密码"
          :type="showNewText ? 'text' : 'password'"
          autocomplete="new-password"
          placeholder="请输入新密码"
        >
          <actions>
            <i
              @click="switchNew"
              :class="[
                { 'x-icon-action-eyes-close1': !showNewText },
                { 'input-eye': true },
                { 'x-icon-action-eyes-open1': showNewText },
              ]"
            ></i>
          </actions>
        </item>
        <item
          node="input"
          name="newPassword1"
          label="确认新密码"
          :type="showSureText ? 'text' : 'password'"
          autocomplete="new-password"
          placeholder="请输入确认密码"
        >
          <actions>
            <i
              @click="switchSure"
              :class="[
                { 'x-icon-action-eyes-close1': !showSureText },
                { 'input-eye': true },
                { 'x-icon-action-eyes-open1': showSureText },
              ]"
            ></i>
          </actions>
        </item>
      </form>
      <div class="setting-comp-password-error">{{ passwordErrorTxt }}</div>
      <actions>
        <button bindclick="hideModPWPop" text="取消"></button>
        <button
          target="modPwForm.confirm"
          text="确定"
          status="primary"
        ></button>
      </actions>
    </pop>
  </div>
</template>
<script>
import "./settingComp.scss";
import Ajax from "@/common/http.js";
import md5 from "@/common/md5.js";
import apimix from "@/common/api/apimix.js";

const COOKIE = require("cabincore/common/cookie/cookie");

const sizeList = [
    {
        label: "宽松（视觉效果最佳）",
        value: "large",
        icon: "x-icon-action-xinximidu-kuansong",
    },
    {
        label: "标准（推荐）",
        value: "normal",
        icon: "x-icon-action-xinximidu-biaozhun",
    },
    {
        label: "紧凑（可显示更多内容）",
        value: "small",
        icon: "x-icon-action-xinximidu-jincou",
    },
];

export default XComponent({
    name: "SettingComp",
    API: ["getData"],
    data: {
        userInfo: {},
        activedTab: "",
        tabs: [
            { id: 1, name: "账号信息" },
            { id: 2, name: "消息通知" },
            // { id: 3, name: "外观" },
            { id: 4, name: "新手引导" },
        ],
        passwordErrorTxt: "",
        isPlaying: false,
        sizeList,
        setting: {
            partner_voice_close_status: 0,
            partner_style_size: "normal",
        },
        activedSize: {},
        showOriginText: false, // 原密码输入框内容是否展示
        showNewText: false, // 新密码是否展示文本
        showSureText: false, // 确认密码是否展示文本
    },
    mounted() {
        const partner_style_size = COOKIE.get("partner_style_size");
        const partner_voice_close_status = +COOKIE.get(
            "partner_voice_close_status",
        );
        this.setting = {
            partner_voice_close_status: partner_voice_close_status || 0,
            partner_style_size: partner_style_size || "small",
        };
        this.activedSize = sizeList.find((item) => item.value === partner_style_size) || sizeList[2];
        this.getUserInfo();
    },
    methods: {
        showWebPop() {
            // 埋点查看无法播放声音
            window.xPartner_clickTrack(
                "x_partner_center_checkNoVoice",
                "个人中心-查看无法播放声音",
            );
        },
        // 切换原密码是否显示出来
        switchOrigin() {
            this.showOriginText = !this.showOriginText;
        },
        // 切换新密码是否显示出来
        switchNew() {
            this.showNewText = !this.showNewText;
        },
        // 切换确认密码是否显示出来
        switchSure() {
            this.showSureText = !this.showSureText;
        },
        getUserInfo() {
            Ajax.get("getUserInfo").then((res) => {
                if (res && res.data) {
                    this.userInfo = res.data;
                }
            });
        },
        // 重置新人引导
        resetFresh() {
            CabinX.confirm(
                {
                    title: "确认提示",
                    text: "您确认要重置新手引导吗?重置后将返回首页进行新手引导",
                },
                (val) => {
                    // todo: 业务逻辑
                    if (val) {
                        const freshStatus = JSON.parse(
                            localStorage[`xPartnerFresh_${this.userInfo.userId}`],
                        );
                        freshStatus.main = false;
                        freshStatus.expand = false;
                        freshStatus.collect = false;
                        localStorage[`xPartnerFresh_${this.userInfo.userId}`] = JSON.stringify(freshStatus);
                        window.xPartnerTabController.activeTab({
                            path: "#index/dmall_fit_jichu_partner_front/homepage",
                            name: "首页",
                        });
                        // 新人引导回首页,导航栏置顶
                        document.querySelector("#first-menu-id_-1").scrollIntoView();
                    }
                },
            );
        },
        tabClick(item) {
            this.activedTab = item.id;

            // 埋点左侧tab
            switch (item.id) {
                case 1:
                    window.xPartner_clickTrack(
                        "x_partner_center_userInfoTab",
                        "个人中心-账号信息tab",
                    );
                    break;
                case 2:
                    window.xPartner_clickTrack(
                        "x_partner_center_noticeTab",
                        "个人中心-消息通知tab",
                    );
                    break;
                case 3:
                    window.xPartner_clickTrack(
                        "x_partner_center_appearance",
                        "个人中心-外观tab",
                    );
                    break;
                case 4:
                    window.xPartner_clickTrack(
                        "x_partner_center_freshIntro",
                        "个人中心-新人引导tab",
                    );
                    break;

                default:
                    break;
            }
        },
        showModPWPop() {
            this.xComponents.modifyPassword.show();
        },
        hideModPWPop() {
            this.xComponents.modifyPassword.hide();
            this.passwordErrorTxt = "";
        },
        modPassword() {
            const res = this.xComponents.modPwForm.getData();
            this.passwordErrorTxt = this.checkPassword(res);
            if (!this.passwordErrorTxt) {
                Ajax.post(
                    "updatePassword",
                    {
                        newPassword: md5(res.newPassword),
                        oldPassword: md5(res.oldPassword),
                    },
                    true,
                ).then((rs) => {
                    if (rs && rs.code === "0000") {
                        // 埋点密码修改成功
                        window.xPartner_clickTrack(
                            "x_partner_center_changePass",
                            "个人中心-修改密码",
                        );
                        CabinX.notice({
                            text: "密码修改成功,请用新密码重新登录",
                            status: "success",
                        });
                        this.hideModPWPop();
                        this.backOut();
                    } else {
                        this.passwordErrorTxt = rs.message;
                    }
                });
            }
        },
        checkPassword(res) {
            let txt = "";
            const reg = /^(?![A-Za-z]+$)(?![A-Z0-9]+$)(?![A-Z\W_]+$)(?![a-z0-9]+$)(?![a-z\W_]+$)(?![0-9\W_]+$)[a-zA-Z0-9\W_]{8,}$/;

            switch (true) {
                case !res.oldPassword:
                    txt = "请输入原密码";
                    break;
                case !res.newPassword:
                    txt = "请输入新密码";
                    break;
                case !res.newPassword1:
                    txt = "请输入确认密码";
                    break;
                case res.newPassword.trim() !== res.newPassword1.trim():
                    txt = "两次输入不一致，请重新输入";
                    break;
                case !reg.test(res.newPassword.trim()):
                    txt = "密码长度请不少于8位，且需包含以下至少任意3种：大写字母、小写字母、数字、特殊字符";
                    break;
                default:
                    txt = "";
                    break;
            }

            return txt;
        },
        // 退出登录
        backOut() {
            const returnUrl = window.location.href;
            const { logout } = apimix;
            const url = `${
                logout.host + logout.url
            }/?redirectURL=${returnUrl}&sysSource=${3}`;
            window.location.href = url;
        },
        voiceChange(val) {
            // 埋点消息声音开关
            if (val) {
                window.xPartner_clickTrack(
                    "x_partner_center_openVoice",
                    "个人中心-开启提示音",
                );
            } else {
                window.xPartner_clickTrack(
                    "x_partner_center_closeVoice",
                    "个人中心-关闭提示音",
                );
            }

            this.setting.partner_voice_close_status = ~~!val;
            COOKIE.add(
                "partner_voice_close_status",
                this.setting.partner_voice_close_status,
            );
        },
        playVoice() {
            if (this.isPlaying) {
                return;
            }

            this.isPlaying = true;
            const audio = new Audio(
                `${apimix.EVT}static.dmall.com/kayak-project/x_partner/dist/x_partner/assets/voices/voice.wav`,
            );
            audio
                .play()
                .then((res) => {
                    console.log(res);
                })
                .catch((error) => {
                    console.log(error);
                    this.isPlaying = false;
                });
            audio.addEventListener("ended", () => {
                this.isPlaying = false;
            });
            // 埋点预览声音
            window.xPartner_clickTrack(
                "x_partner_center_previewVoice",
                "个人中心-预览提示音",
            );
        },
        sizeChange(data) {
            if (this.activedSize.value === data.value) {
                return;
            }

            this.activedSize = data;
            this.setting.partner_style_size = data.value;
            COOKIE.add("partner_style_size", this.setting.partner_style_size);

            let changeText = "";
            // 埋点切换到宽松/标准/紧凑Size
            switch (data.value) {
                case "large":
                    changeText = '布局已切换至"宽松模式"';
                    window.xPartner_clickTrack(
                        "x_partner_center_sizeToLarge",
                        "个人中心-切换尺寸到宽松",
                    );
                    break;
                case "normal":
                    changeText = '布局已切换至"标准模式"';

                    window.xPartner_clickTrack(
                        "x_partner_center_sizeToNormal",
                        "个人中心-切换尺寸到标准",
                    );

                    break;
                case "small":
                    changeText = '布局已切换至"紧凑模式"';

                    window.xPartner_clickTrack(
                        "x_partner_center_sizeToSmall",
                        "个人中心-切换尺寸到紧凑",
                    );
                    break;

                default:
                    break;
            }
            CabinX.notice({
                text: changeText,
                status: "success",
            });
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        },
        getData() {
            return { ...this.setting };
        },
        backLogin() {
            const returnUrl = window.location.origin;
            kayak.router.go(
                `${apimix.EVT}sso.dmall.com/?redirectURL=${encodeURIComponent(
                    returnUrl,
                )}#full/sso/ssologin`,
            );
        },
    },
});
</script>
