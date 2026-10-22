(()=>{
'use strict';
const all=window.GTR_I18N||{};
const allowed=['vi','zh','en'];
const search=new URLSearchParams(location.search);
const getSaved=(k)=>{try{return localStorage.getItem(k)||'';}catch{return '';}};
const sessionGet=(k)=>{try{return sessionStorage.getItem(k)||'';}catch{return '';}};
const sessionSet=(k,v)=>{try{sessionStorage.setItem(k,v);}catch{}};
let lang=allowed.includes(search.get('lang'))?search.get('lang'):(allowed.includes(getSaved('gtr-lang'))?getSaved('gtr-lang'):'vi');
const refPattern=/^[a-zA-Z0-9_-]{3,24}$/;
let referral=search.get('ref')||'';
if(!refPattern.test(referral))referral='';
if(referral)sessionSet('gtr-ref',referral);
else {referral=sessionGet('gtr-ref');if(!refPattern.test(referral))referral='';}
const text=(key)=>all[lang]?.[key]||all.vi?.[key]||key;
function setLanguage(next){
 if(!allowed.includes(next))return;
 lang=next;
 try{localStorage.setItem('gtr-lang',lang);}catch{}
 document.documentElement.lang=lang==='zh'?'zh-CN':lang;
 document.querySelectorAll('[data-i18n]').forEach(el=>{el.textContent=text(el.dataset.i18n);});
 document.querySelectorAll('[data-placeholder]').forEach(el=>{el.placeholder=text(el.dataset.placeholder);});
 document.querySelectorAll('[data-lang]').forEach(el=>{const isActive=el.dataset.lang===lang;el.classList.toggle('active',isActive);el.setAttribute('aria-pressed',String(isActive));});
 document.title='GTR Vietnam | '+(lang==='vi'?'Cơ hội nhận hoa hồng':lang==='zh'?'销售合作伙伴招募':'Sales partner opportunity');
}
document.querySelectorAll('[data-lang]').forEach(b=>b.addEventListener('click',()=>setLanguage(b.dataset.lang)));
setLanguage(lang);
const refDisplay=document.getElementById('refDisplay');
const refField=document.getElementById('refField');
if(referral && refField){refField.value=referral;if(refDisplay){refDisplay.hidden=false;document.getElementById('refName').textContent=referral;}}
const year=document.getElementById('year');if(year)year.textContent=new Date().getFullYear();
const menuButton=document.getElementById('menuButton');const navLinks=document.getElementById('navLinks');
if(menuButton&&navLinks){menuButton.addEventListener('click',()=>{const open=navLinks.classList.toggle('open');menuButton.setAttribute('aria-expanded',String(open));});navLinks.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{navLinks.classList.remove('open');menuButton.setAttribute('aria-expanded','false');}));}
const intentInput=document.getElementById('intent');
document.querySelectorAll('[data-purpose]').forEach(el=>el.addEventListener('click',()=>{if(intentInput)intentInput.value='partner';}));
const lightbox=document.getElementById('lightbox');const lightboxImg=document.getElementById('lightboxImg');
if(lightbox&&lightboxImg){document.querySelectorAll('[data-full]').forEach(el=>el.addEventListener('click',()=>{lightboxImg.src=el.dataset.full;lightboxImg.alt=el.querySelector('img')?.alt||'';lightbox.showModal();}));document.getElementById('lightboxClose')?.addEventListener('click',()=>lightbox.close());lightbox.addEventListener('click',e=>{if(e.target===lightbox)lightbox.close();});}
const privacyDialog=document.getElementById('privacyDialog');
document.getElementById('privacyOpen')?.addEventListener('click',()=>privacyDialog.showModal());
document.getElementById('privacyClose')?.addEventListener('click',()=>privacyDialog.close());
const form=document.getElementById('inquiryForm');
const quickDialog=document.getElementById('quickApplyDialog');
const quickMount=document.getElementById('quickApplyMount');
const originalFormParent=form.parentNode;
const originalFormNext=form.nextSibling;
function restoreForm(){if(form.parentNode===quickMount){originalFormParent.insertBefore(form,originalFormNext);}}
function openQuickForm(e){
 if(!window.matchMedia('(max-width:760px)').matches || !quickDialog?.showModal)return;
 e.preventDefault();
 quickMount.appendChild(form);
 quickDialog.showModal();
}
document.querySelectorAll('a[href="#contact"]').forEach(link=>link.addEventListener('click',openQuickForm));
document.getElementById('quickApplyClose')?.addEventListener('click',()=>quickDialog.close());
quickDialog?.addEventListener('close',restoreForm);
quickDialog?.addEventListener('click',e=>{if(e.target===quickDialog)quickDialog.close();});
const messengerChoice=document.getElementById('messengerChoice');
const messengerId=document.getElementById('messengerId');
function placeholderForMessenger(){
 const type=messengerChoice.value;
 if(type==='whatsapp')messengerId.placeholder=lang==='zh'?'WhatsApp绑定电话号码':lang==='en'?'WhatsApp number':'Số WhatsApp';
 else if(type==='wechat')messengerId.placeholder=lang==='zh'?'微信号':lang==='en'?'WeChat ID':'ID WeChat';
 else if(type==='zalo')messengerId.placeholder=lang==='zh'?'Zalo ID或电话号码':lang==='en'?'Zalo ID or phone':'ID Zalo hoặc số điện thoại';
 else messengerId.placeholder=text('messenger_id_ph');
}
messengerChoice?.addEventListener('change',placeholderForMessenger);
document.querySelectorAll('[data-lang]').forEach(b=>b.addEventListener('click',placeholderForMessenger));
const out=document.getElementById('formResult');
const submitBtn=form.querySelector('button[type="submit"]');
let processing=false;
const setResult=(key,type)=>{out.textContent=text(key);out.className=type||'';};
form.addEventListener('submit',async e=>{
 e.preventDefault();
 if(processing)return;
 const data=Object.fromEntries(new FormData(form).entries());
 data.lang=lang;
 if(!data.name?.trim()||!data.contact?.trim()||!['zalo','wechat','whatsapp'].includes(data.messenger)||!data.messengerId?.trim()||data.consent!=='yes'){
  setResult('form_error','error');return;
 }
 if(!form.checkValidity()){form.reportValidity();return;}
 processing=true;submitBtn.disabled=true;setResult('form_sending','');
 try{
  const response=await fetch('/api/apply',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data),cache:'no-store'});
  let result={};try{result=await response.json();}catch{}
  if(response.ok&&result.ok){setResult('form_success','ok');form.reset();if(referral)refField.value=referral;placeholderForMessenger();}
  else if(response.status===503){setResult('form_unavailable','error');}
  else setResult('form_retry','error');
 }catch{setResult('form_retry','error');}
 finally{processing=false;submitBtn.disabled=false;}
});
})();
