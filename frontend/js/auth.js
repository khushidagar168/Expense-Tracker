document.addEventListener('DOMContentLoaded', () => {
    redirectIfAuth();

    const signupForm = document.getElementById('signup-form');
    if (signupForm) {
        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            
            const btn = signupForm.querySelector('button');
            const originalText = btn.textContent;
            btn.disabled = true;
            btn.textContent = 'Creating account...';

            try {
                const data = await apiFetch('/auth/signup', {
                    method: 'POST',
                    body: JSON.stringify({ name, email, password })
                });
                
                setToken(data.token);
                showToast('Account created successfully!', 'success');
                setTimeout(() => {
                    window.location.href = '/';
                }, 1000);
            } catch (error) {
                showToast(error.message, 'error');
                btn.disabled = false;
                btn.textContent = originalText;
            }
        });
    }

    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            
            const btn = loginForm.querySelector('button');
            const originalText = btn.textContent;
            btn.disabled = true;
            btn.textContent = 'Logging in...';

            try {
                const data = await apiFetch('/auth/login', {
                    method: 'POST',
                    body: JSON.stringify({ email, password })
                });
                
                setToken(data.token);
                showToast('Logged in successfully!', 'success');
                setTimeout(() => {
                    window.location.href = '/';
                }, 1000);
            } catch (error) {
                showToast(error.message, 'error');
                btn.disabled = false;
                btn.textContent = originalText;
            }
        });
    }
});
