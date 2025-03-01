window.addEventListener('DOMContentLoaded', () => {
  const titleBar = document.createElement('header');
  titleBar.classList.add('bg-gray-25');
  titleBar.style.cssText = `
    height: 45px;
    app-region: drag;
    --webkit-app-region: drag;
    user-select: none;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    z-index: 1000;`;
  document.body.prepend(titleBar);
  (document.querySelector('body > div:last-of-type') as HTMLElement).style.paddingTop = '30px';
});
