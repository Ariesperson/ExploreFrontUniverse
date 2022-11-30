import recurMenu from "./recurMenu.js";
import tpl from "./menuItem.tpl";
import "./menuItem.scss";

export default {
    name: "menuItem",
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
        title: {
            type: String,
        },
    },
    template: tpl,
    data() {
        return {
            activeNotice: null,
            collectionCols: [], // 瀑布流的分组数据
            currentAnchorId: null, // 当前选中锚点的itemId
        };
    },
    components: {
        "recur-menu": recurMenu,
    },
    created() {
        this.toWaterfallData(this.list);
    },
    mounted() {},
    watch: {
        list(val) {
            this.toWaterfallData(val);
        },
    },
    methods: {
        toWaterfallData(source) {
            // 瀑布流布局将collectionList分三列数据
            let collectionCol1 = [];
            let collectionCol2 = [];
            let collectionCol3 = [];
            let i = 0;
            while (i < source.length) {
                collectionCol1.push(source[i++]);
                collectionCol2.push(source[i++]);
                collectionCol3.push(source[i++]);
            }
            // 去除空数据
            collectionCol1 = collectionCol1.filter((item) => item);
            collectionCol2 = collectionCol2.filter((item) => item);
            collectionCol3 = collectionCol3.filter((item) => item);
            this.collectionCols = [collectionCol1, collectionCol2, collectionCol3];
        },

        // 锚点到对应二级菜单
        anchorToItem(item) {
            if (this.currentAnchorId === item.id) {
                this.currentAnchorId = null;
                return;
            }
            this.currentAnchorId = item.id;
            this.$nextTick(() => {
                document
                    .querySelector(".collection-cols__list__title--active")
                    .scrollIntoView();
            });
        },
    },
};
