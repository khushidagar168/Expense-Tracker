document.addEventListener('DOMContentLoaded', () => {
    requireAuth();

    let chartInstance = null;

    Chart.defaults.color = '#94a3b8';
    Chart.defaults.font.family = "'Outfit', sans-serif";

    async function loadDataAndRenderChart() {
        try {
            const expenses = await apiFetch('/expenses');
            
            if (expenses.length === 0) {
                // Not showing toast to avoid distracting on empty state, just letting it render empty
                document.getElementById('total-amount').textContent = `$0.00`;
                document.getElementById('top-category').textContent = 'None';
                return;
            }

            // Aggregate data
            const categoryTotals = {};
            let total = 0;
            
            expenses.forEach(exp => {
                categoryTotals[exp.category] = (categoryTotals[exp.category] || 0) + exp.amount;
                total += exp.amount;
            });

            const labels = Object.keys(categoryTotals);
            const data = Object.values(categoryTotals);

            // Update stats UI
            document.getElementById('total-amount').textContent = `$${total.toFixed(2)}`;
            
            if (labels.length > 0) {
                const topCat = labels.reduce((a, b) => categoryTotals[a] > categoryTotals[b] ? a : b);
                document.getElementById('top-category').textContent = topCat;
            }

            // Colors
            const predefinedColors = [
                '#8b5cf6', // primary (violet)
                '#10b981', // emerald
                '#3b82f6', // blue
                '#ef4444', // red
                '#f59e0b', // amber
                '#ec4899', // pink
                '#06b6d4', // cyan
                '#64748b'  // slate
            ];
            
            const backgroundColors = labels.map((_, i) => predefinedColors[i % predefinedColors.length]);

            // Render Chart
            const ctx = document.getElementById('expenseChart').getContext('2d');
            
            if (chartInstance) {
                chartInstance.destroy();
            }

            chartInstance = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: labels,
                    datasets: [{
                        data: data,
                        backgroundColor: backgroundColors,
                        borderWidth: 0,
                        hoverOffset: 4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'right',
                            labels: {
                                padding: 20,
                                font: {
                                    size: 13
                                }
                            }
                        },
                        tooltip: {
                            backgroundColor: 'rgba(15, 23, 42, 0.9)',
                            titleFont: { size: 14 },
                            bodyFont: { size: 14 },
                            padding: 12,
                            cornerRadius: 8,
                            callbacks: {
                                label: function(context) {
                                    let label = context.label || '';
                                    if (label) {
                                        label += ': ';
                                    }
                                    if (context.parsed !== null) {
                                        label += new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(context.parsed);
                                    }
                                    return label;
                                }
                            }
                        }
                    },
                    cutout: '70%'
                }
            });

        } catch (error) {
            showToast('Failed to load chart data', 'error');
        }
    }

    loadDataAndRenderChart();
});
