const API_URL = '/api';

function getToken() {
  return localStorage.getItem('token');
}

function setToken(token) {
  localStorage.setItem('token', token);
}

function removeToken() {
  localStorage.removeItem('token');
}

function isAuthenticated() {
  return !!getToken();
}

function requireAuth() {
  if (!isAuthenticated() && !window.location.pathname.includes('login.html') && !window.location.pathname.includes('signup.html')) {
    window.location.href = '/login.html';
  }
}

function redirectIfAuth() {
  if (isAuthenticated() && (window.location.pathname.includes('login.html') || window.location.pathname.includes('signup.html'))) {
    window.location.href = '/';
  }
}

async function apiFetch(endpoint, options = {}) {
  const token = getToken();
  
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers
    });

    if (response.status === 401) {
      removeToken();
      if (!window.location.pathname.includes('login.html') && !window.location.pathname.includes('signup.html')) {
          window.location.href = '/login.html';
      }
      throw new Error('Unauthorized');
    }

    let data;
    try {
        data = await response.json();
    } catch (e) {
        data = null;
    }

    if (!response.ok) {
      throw new Error(data?.error || 'Something went wrong');
    }

    return data;
  } catch (error) {
    throw error;
  }
}

function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container') || createToastContainer();
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  
  // Icon based on type
  const icon = type === 'success' ? '✓' : '✕';
  
  toast.innerHTML = `
    <div style="background: rgba(255,255,255,0.2); width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; border-radius: 50%;">${icon}</div>
    <span>${message}</span>
  `;
  
  container.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 3800);
}

function createToastContainer() {
  const container = document.createElement('div');
  container.id = 'toast-container';
  container.className = 'toast-container';
  document.body.appendChild(container);
  return container;
}

function logout() {
  removeToken();
  window.location.href = '/login.html';
}

// Add logout listener if button exists
document.addEventListener('DOMContentLoaded', () => {
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            logout();
        });
    }
});
