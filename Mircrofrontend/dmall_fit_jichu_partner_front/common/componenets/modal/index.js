import modal from './modal';

const ModalConstructor = Vue.extend(modal);

const instance = new ModalConstructor({
    el: document.createElement("div"),
});

/**
 *
 *
 * @param {Object<options>}
 */
const handleModal = function (options) {
    const _options = options || {};
    const parentDom = document.body;

    Object.assign(instance, _options);

    parentDom.appendChild(instance.$el);
};

export default handleModal;
