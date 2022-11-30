import "./recurMenu.scss";
import recurMenu from "./recurMenu.tpl";

export default {
    name: "recurMenu",
    inject: ["rootMenu"],
    props: {
        list: {
            type: Array,
            default() {
                return [];
            },
        },
        level: {
            type: Number,
            default: 1,
        },
        parent: {
            type: Object,
        },
        collection: {
            type: Object,
        },
        className: {
            type: String,
            default: "menu-level-1",
        },

    },
    template: recurMenu,
    component: {
        "recur-menu": recurMenu,
    },
    data() {
        return {
            collectionMap: null, // 我的收藏的map数据,从根menu组件获取
            currentItemId: null, // 当前hover的Itemid
            localList: [], // 从Props接收到list处理后赋值到data中
        };
    },
    created() {},
    mounted() {
        this.handlePropList();
    },
    watch: {
        // 当hover到第一个可收藏菜单时,判断是否完成收藏的新人引导
        currentItemId() {
            this.rootMenu.judgeFresh('collect');
        },
    },
    methods: {
        handlePropList() {
            const { list } = this;

            list.forEach((item) => {
                if (this.rootMenu.collectionMap.has(item.id)) {
                    this.$set(item, 'isCollected', true);
                } else {
                    this.$set(item, 'isCollected', false);
                }
            });
            this.localList = list;
        },
        handleItemClick(item) {
            this.$root.$emit("item-click", item);
        },
        handleItemOver(item) {
            if (item.router) {
                this.currentItemId = item.id;
                if (this.rootMenu.collectionMap.has(item.id)) {
                    this.$set(item, "isCollected", true);
                } else {
                    this.$set(item, "isCollected", false);
                }
            }
        },

        handleItemLeave() {
            this.currentItemId = null;
        },

        // collectionItem:{
        //   *    children: null
        //        id: 27622
        //        level: 1
        //        name: "磅秤管理"
        //        pData: {icon: 'x-icon-universally-a-1zhanweifu', name: '磅秤系统', url: '', id: 1113, level: 0}
        //        pid: 1113
        //        url: "#index/steelyard_page/steelyardManager"
        // }
        addToCollection(item) {
            const pData = this.rootMenu.showMenu;
            const source = {
                children: null,
                id: item.id,
                level: 1,
                name: item.name,
                pData: {
                    icon: pData.icon,
                    name: pData.name,
                    url: "",
                    id: pData.id,
                    level: 0,
                },
                pid: pData.id,
                url: item.router,
            };
            const flag = this.$root.$emit("addToCollection", source);
            if (flag) {
                this.$set(item, "isCollected", true);
            }
        },

        deleteCollection(item) {
            const flag = this.$root.$emit("deleteCollection", item);
            if (flag) {
                this.$set(item, 'isCollected', false);
            }
        },
    },
};
