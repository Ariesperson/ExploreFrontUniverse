import tpl from './modal.tpl';
import './modal.scss';

let that;
export default {
    data() {
        return {
            visible: true,
        };
    },
    props: {
        title: {
            type: String,
            default: '提示',
        },
        content: {
            type: String,
            default: '',
        },
        confirmBtnText: {
            type: String,
            default: '确认',
        },
        cancelBtnText: {
            type: String,
            default: '取消',
        },
        confirmCb: {
            type: Function,
            default: () => {
                that.visible = false;
            },
        },
        cancelCb: {
            type: Function,
            default: () => {
                that.visible = false;
            },
        },
        showClose: {
            type: Boolean,
            default: true,
        },
        showCancel: {
            type: Boolean,
            default: true,
        },
    },
    template: tpl,
    mounted() {
        that = this;
    },
    methods: {
        confirm() {
            this.confirmCb();
        },
        cancel() {
            this.cancelCb();
        },
        closeModal() {
            this.visible = false;
        },

    },
};