class Loading {
  constructor(e, options){
      this.html = e.innerHTML;
      this.e = e;
      if (options?.now) this.start();
  }
  spinner = `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Wait...`;
  start(){
      this.e.innerHTML = this.spinner;
      this.e.setAttribute('disabled', '');
  }
  stop(){
      this.e.innerHTML = this.html;
      this.e.removeAttribute('disabled');
  }
}

function copyText(text) {
  const tempTxt = document.createElement("input");
  tempTxt.value = text;
  document.body.appendChild(tempTxt);
  tempTxt.select();
  document.execCommand("copy");
  document.body.removeChild(tempTxt);
}

function copyLink(e) {
  const card = e.parentElement.parentElement;
  const link = card.querySelector('#linkAfter');
  const popoverCopy = new bootstrap.Popover(e, {
    content: 'Link copied to clipboard',
    trigger: 'manual'
  });
  popoverCopy.show();
  setTimeout(() => popoverCopy.hide(), 2000);
  copyText(link.href ?? link.innerText);
  console.log(link.href);
}

function addCardLink(el, { linkBefore, linkAfter }) {
  const httpUrl = /https:\/\/|http\/\//;
  let linkBeforeCrop = linkBefore.replace(httpUrl, '');
  linkBeforeCrop = linkBeforeCrop.length > 50 ? `${linkBeforeCrop.slice(0, 50)}...` : linkBefore;
  const html = `<div class="p-3 bg-light rounded mt-2">
    <div class="row justify-content-between">
      <div class="col-8 col-md-10">
        <p class="m-0 text-wrap text-break" id="linkBefore">${linkBeforeCrop}</p>
        <div class="border-bottom"></div>
        <a href="${linkAfter}" target="_blank" id="linkAfter" class="text-decoration-none text-wrap text-break">${linkAfter?.replace(httpUrl, '')}</a>
      </div>
      <div class="col-4 col-md-2 text-end">
        <button type="button" class="btn btn-primary shadow mt-1" id="btnCopy" onclick="copyLink(this)">Copy</button>
      </div>
    </div>
  </div>`;
  const div = document.createElement('div');
  div.innerHTML = html;
  el.appendChild(div);
}

async function shortLink(url) {
  const apiUrl = 'https://s.bluu.eu.org';
  const res = await fetch(apiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url })
  });
  const json = await res.json();
  if (res.status >= 400) throw new Error(json?.message ?? 'Server error');
  return json;
}

const linkForm = document.querySelector('#linkForm');
const resultHtml = document.querySelector('#result');
linkForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const btn = e.target.querySelector('button[type=submit]');
  const btnLoading = new Loading(btn);
  const body = new FormData(e.target);
  const linkBefore = body.get('url');
  try {
    btnLoading.start();
    const res = await shortLink(linkBefore);
    btnLoading.stop();
    addCardLink(resultHtml, { linkBefore, linkAfter: res.url });
  } catch (e) {
    console.log(e);
    btnLoading.stop();
    alert(e.message);
  } finally {
    e.target.querySelector('#url').value = '';
  }
});
