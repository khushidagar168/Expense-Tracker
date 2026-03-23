const express = require('express');
const router = express.Router();
const db = require('../db');
const auth = require('../middleware/auth');

// Apply auth middleware to all expense routes
router.use(auth);

// Get all expenses for a user
router.get('/', (req, res) => {
  try {
    const expenses = db.prepare('SELECT * FROM expenses WHERE user_id = ? ORDER BY created_at DESC').all(req.user.id);
    res.json(expenses);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error fetching expenses' });
  }
});

// Add an expense
router.post('/', (req, res) => {
  try {
    const { category, amount, comments } = req.body;

    if (!category || amount === undefined) {
      return res.status(400).json({ error: 'Category and amount are required' });
    }

    const info = db.prepare('INSERT INTO expenses (user_id, category, amount, comments) VALUES (?, ?, ?, ?)')
      .run(req.user.id, category, amount, comments || '');

    const newExpense = db.prepare('SELECT * FROM expenses WHERE id = ?').get(info.lastInsertRowid);
    res.status(201).json(newExpense);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error creating expense' });
  }
});

// Edit an expense
router.put('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { category, amount, comments } = req.body;

    // Verify expense belongs to user
    const expense = db.prepare('SELECT * FROM expenses WHERE id = ? AND user_id = ?').get(id, req.user.id);
    if (!expense) {
      return res.status(404).json({ error: 'Expense not found or unauthorized' });
    }

    db.prepare('UPDATE expenses SET category = ?, amount = ?, comments = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
      .run(category || expense.category, amount !== undefined ? amount : expense.amount, comments !== undefined ? comments : expense.comments, id);

    const updatedExpense = db.prepare('SELECT * FROM expenses WHERE id = ?').get(id);
    res.json(updatedExpense);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error updating expense' });
  }
});

// Delete an expense
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;

    const info = db.prepare('DELETE FROM expenses WHERE id = ? AND user_id = ?').run(id, req.user.id);
    
    if (info.changes === 0) {
      return res.status(404).json({ error: 'Expense not found or unauthorized' });
    }

    res.json({ message: 'Expense deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error deleting expense' });
  }
});

module.exports = router;
