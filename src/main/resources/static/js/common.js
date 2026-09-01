document.addEventListener('DOMContentLoaded', () => {
  checkAuth();
  renderSidebar();
});

function checkAuth() {
  const isLogin = location.pathname.endsWith('/login.html') || location.pathname.endsWith('login.html');
  if (!localStorage.getItem('token') && !isLogin) location.href='login.html';
}

function renderSidebar() {
  const sidebar=document.getElementById('sidebar'); if(!sidebar) return;
  const role=localStorage.getItem('role') || '';
  const current=location.pathname.split('/').pop() || 'dashboard.html';
  const items = role === 'STUDENT' ? [
    ['Dashboard','dashboard.html'],['Payments','payments.html'],['Complaints','complaints.html'],['Profile','profile.html']
  ] : [
    ['Dashboard','dashboard.html'],['Students','students.html'],['Rooms','rooms.html'],['Payments','payments.html'],['Complaints','complaints.html'],['Profile','profile.html']
  ];
  sidebar.innerHTML=`<div class="sidebar-header">Hostel System</div><nav class="sidebar-nav">${items.map(([name,link])=>`<a href="${link}" class="${current===link?'active':''}">${name}</a>`).join('')}<a href="#" id="logoutBtn" style="margin-top:2rem;color:#ef4444">Logout</a></nav>`;
  document.getElementById('logoutBtn').addEventListener('click',e=>{e.preventDefault();localStorage.clear();location.href='login.html';});
}

function showAlert(message,type='error'){const box=document.getElementById('alertBox');if(!box)return;box.className=`alert alert-${type}`;box.textContent=message;box.classList.remove('hidden');setTimeout(()=>box.classList.add('hidden'),5000);}

function escapeHtml(value){return String(value??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));}

function formatDate(value){return value?new Date(value).toLocaleString():'-';}
