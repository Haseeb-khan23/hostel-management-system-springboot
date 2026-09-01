document.addEventListener('DOMContentLoaded', () => {
  if (localStorage.getItem('token')) { window.location.href = 'dashboard.html'; return; }
  const form = document.getElementById('loginForm');
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    const button = document.getElementById('submitBtn');
    if (!username || !password) return showAlert('Username and password are required.', 'error');
    button.disabled = true; button.textContent = 'Signing in...';
    try {
      const data = await api.post('/auth/login', { username, password });
      localStorage.setItem('token', data.token);
      localStorage.setItem('username', data.username);
      localStorage.setItem('role', data.role);
      window.location.href = 'dashboard.html';
    } catch (error) { showAlert(error.message || 'Login failed.', 'error'); }
    finally { button.disabled = false; button.textContent = 'Sign In'; }
  });
});

function showAlert(message, type='error') {
  const box=document.getElementById('alertBox'); if(!box) return;
  box.className=`alert alert-${type}`; box.textContent=message; box.classList.remove('hidden');
}
