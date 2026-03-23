document.addEventListener('DOMContentLoaded', () => {
    requireAuth();

    const tbody = document.getElementById('expenses-tbody');
    const modal = document.getElementById('expense-modal');
    const form = document.getElementById('expense-form');
    let expenses = [];

    // Load Expenses
    async function loadExpenses() {
        try {
            expenses = await apiFetch('/expenses');
            renderTable();
        } catch (error) {
            showToast('Failed to load expenses', 'error');
        }
    }

    function renderTable() {
        if (expenses.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6">
                        <div class="empty-state">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"></path><path d="M12 21H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h18a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-9z" stroke-dasharray="100" stroke-dashoffset="100"><animate attributeName="stroke-dashoffset" from="100" to="0" dur="2s" fill="freeze" /></path></svg>
                            <p>No expenses found. Add your first expense to get started!</p>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = expenses.map(exp => `
            <tr>
                <td><span class="category-tag">${escapeHTML(exp.category)}</span></td>
                <td><span class="amount">$${exp.amount.toFixed(2)}</span></td>
                <td>${escapeHTML(exp.comments || '-')}</td>
                <td><span class="date-text">${formatDate(exp.created_at)}</span></td>
                <td><span class="date-text">${formatDate(exp.updated_at)}</span></td>
                <td>
                    <div class="actions">
                        <button class="btn btn-outline btn-small" onclick="editExpense(${exp.id})" title="Edit">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                        </button>
                        <button class="btn btn-danger btn-small" onclick="deleteExpense(${exp.id})" title="Delete">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    // Modal logic
    function openModal(isEdit = false, expData = null) {
        document.getElementById('modal-title').textContent = isEdit ? 'Edit Expense' : 'Add Expense';
        if (isEdit) {
            document.getElementById('expense-id').value = expData.id;
            document.getElementById('category').value = expData.category;
            document.getElementById('amount').value = expData.amount;
            document.getElementById('comments').value = expData.comments;
            document.getElementById('save-expense').textContent = 'Update Expense';
        } else {
            form.reset();
            document.getElementById('expense-id').value = '';
            document.getElementById('save-expense').textContent = 'Save Expense';
        }
        modal.classList.add('active');
        document.getElementById('amount').focus();
    }

    function closeModal() {
        modal.classList.remove('active');
        form.reset();
    }

    document.getElementById('open-add-modal').addEventListener('click', () => openModal(false));
    document.getElementById('close-modal').addEventListener('click', closeModal);
    document.getElementById('cancel-modal').addEventListener('click', closeModal);

    // Form submit
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const id = document.getElementById('expense-id').value;
        const category = document.getElementById('category').value;
        const amount = parseFloat(document.getElementById('amount').value);
        const comments = document.getElementById('comments').value;

        const btn = document.getElementById('save-expense');
        const originalText = btn.textContent;
        btn.disabled = true;
        btn.innerHTML = `<svg class="animate-spin" style="animation: spin 1s linear infinite;" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"></path></svg> Saving...`;

        // Add keyframes inline for simplicity since it's just this component
        if (!document.getElementById('spin-anim')) {
            const style = document.createElement('style');
            style.id = 'spin-anim';
            style.innerHTML = `@keyframes spin { 100% { transform: rotate(360deg); } }`;
            document.head.appendChild(style);
        }

        try {
            if (id) {
                // Update
                const updated = await apiFetch(`/expenses/${id}`, {
                    method: 'PUT',
                    body: JSON.stringify({ category, amount, comments })
                });
                expenses = expenses.map(e => e.id == id ? updated : e);
                showToast('Expense updated successfully');
            } else {
                // Create
                const created = await apiFetch('/expenses', {
                    method: 'POST',
                    body: JSON.stringify({ category, amount, comments })
                });
                expenses.unshift(created); // Latest first
                showToast('Expense added successfully');
            }
            renderTable();
            closeModal();
        } catch (error) {
            showToast(error.message, 'error');
        } finally {
            btn.disabled = false;
            btn.textContent = originalText;
        }
    });

    // Make global for onclick handlers
    window.editExpense = (id) => {
        const exp = expenses.find(e => e.id == id);
        if (exp) openModal(true, exp);
    };

    window.deleteExpense = async (id) => {
        // Use a custom confirm via a simple check, or optionally skip confirm if it's blocking
        // Sometimes browsers block native confirm() if they feel it's spammy.
        const isConfirmed = window.confirm('Are you sure you want to delete this expense?');
        if (!isConfirmed) return;
        
        const deleteBtnText = document.querySelector(`button[onclick="deleteExpense(${id})"]`);
        if(deleteBtnText) {
            deleteBtnText.disabled = true;
            deleteBtnText.innerHTML = '...';
        }

        try {
            const data = await apiFetch(`/expenses/${id}`, { method: 'DELETE' });
            console.log('Delete response:', data);
            
            // Strictly cast to number for filtering just in case
            expenses = expenses.filter(e => Number(e.id) !== Number(id));
            renderTable();
            showToast('Expense deleted successfully');
        } catch (error) {
            console.error('Delete error:', error);
            showToast('Error removing expense: ' + error.message, 'error');
            if(deleteBtnText) {
                deleteBtnText.disabled = false;
                deleteBtnText.innerHTML = 'Retry';
            }
        }
    };

    // Utils
    function escapeHTML(str) {
        if (!str) return '';
        return str.replace(/[&<>'"]/g, 
            tag => ({
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                "'": '&#39;',
                '"': '&quot;'
            }[tag] || tag)
        );
    }

    function formatDate(dateStr) {
        const d = new Date(dateStr);
        if (isNaN(d)) return '';
        
        const dateOptions = { year: 'numeric', month: 'short', day: 'numeric' };
        const timeOptions = { hour: '2-digit', minute: '2-digit' };
        return `${d.toLocaleDateString(undefined, dateOptions)} <br><small style="opacity:0.7">${d.toLocaleTimeString(undefined, timeOptions)}</small>`;
    }

    // Initial load
    loadExpenses();
});
