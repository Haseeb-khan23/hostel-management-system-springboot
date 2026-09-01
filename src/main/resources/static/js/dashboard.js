document.addEventListener('DOMContentLoaded', async () => {
  document.getElementById('userDisplayName').textContent=localStorage.getItem('username')||'User';
  document.getElementById('userRoleBadge').textContent=localStorage.getItem('role')||'-';
  if(localStorage.getItem('role')!=='ADMIN'){
    showAlert('The current backend exposes the dashboard only to ADMIN users.', 'error');
    return;
  }
  try {
    const d=await api.get('/dashboard/admin');
    document.getElementById('statStudents').textContent=d.totalStudents??0;
    document.getElementById('statRooms').textContent=d.totalRooms??0;
    document.getElementById('statOccupiedRooms').textContent=d.occupiedRooms??0;
    document.getElementById('statAvailableRooms').textContent=d.availableRooms??0;
    document.getElementById('statPendingPayments').textContent=d.pendingPayments??0;
    document.getElementById('statPendingComplaints').textContent=d.pendingComplaints??0;
  } catch(e){showAlert(e.message||'Unable to load dashboard.');}
});
