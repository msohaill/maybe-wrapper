import { WebviewTag } from 'electron';

const webview = document.getElementsByTagName('webview')[0] as WebviewTag;
const loader = document.getElementById('loader') as HTMLDivElement;
const arrows = document.getElementById("arrows") as HTMLDivElement;
const backward = arrows.children[0] as SVGElement;
const forward = arrows.children[1] as SVGElement;
const headerLogo = document.getElementsByClassName('header-logo')[0] as HTMLImageElement;

const updateArrow = (arrow: SVGElement, enabled: boolean, dir: 'forward' | 'backward') => {
  arrow.setAttribute("class", enabled ? 'arrow-enabled' : 'arrow-disabled');

  if (enabled) {
    arrow.onclick = dir == 'forward' ? () => webview.goForward() : () => webview.goBack();
  } else {
    arrow.onclick = undefined
  }
};

const serveMaybe = () => {
  webview.src = 'http://localhost:3000';
};

const serveLoading = () => {
  loader.style.display = 'flex';
  backward.style.display = 'none';
  forward.style.display = 'none';
  headerLogo.style.display = 'none';
}

webview.addEventListener('did-attach', () => {
  loader.style.display = 'none';
  webview.style.display = 'flex';

  forward.style.display = 'flex';
  backward.style.display = 'flex';
  headerLogo.style.display = 'flex';
});

webview.addEventListener('did-stop-loading', () => {
  console.log('did-finish-load');
  updateArrow(backward, webview.canGoBack(), 'backward');
  updateArrow(forward, webview.canGoForward(), 'forward');
});

window.api.onStart(serveMaybe)
window.addEventListener('DOMContentLoaded', async () => {
  if (await window.api.started()) {
    serveMaybe();
  } else {
    serveLoading();
  }
});
