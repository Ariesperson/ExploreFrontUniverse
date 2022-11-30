export default function useTips(Vue) {
    let timer;
    Vue.directive('tips', {
        inserted(el, param) {
            el.addEventListener('mouseenter', (e) => {
                const { scrollWidth, clientWidth, offsetWidth } = el;
                const { clientX, clientY } = e;

                if (scrollWidth <= clientWidth) {
                    return;
                }
                const tipDom = document.createElement('div');
                const style = `
                    color: #FFFFFF;
                    position:fixed;
                    left:${clientX + 10}px;
                    top:${clientY + 10}px;
                    z-index:999;
                    padding: 4px;
                    display: flex;
                    flex-direction: row;
                    justify-content: center;
                    align-items: center;
                    height: 24px;
                    background: rgba(0, 0, 0, 0.8);
                    border-radius: 2px;
                    white-space: nowrap;
                    text-overflow: ellipsis;
                    overflow: hidden;
                `;

                tipDom.innerText = param && param.value;
                tipDom.setAttribute('style', style);
                tipDom.setAttribute('id', 'vtips');

                timer = setTimeout(() => {
                    document.body.appendChild(tipDom);
                }, 200);
            });

            el.addEventListener('mouseleave', () => {
                if (timer) {
                    clearTimeout(timer);
                }
                const tipDom = document.getElementById('vtips');
                tipDom && tipDom.remove();
            });
        },
    });
}