document.addEventListener('DOMContentLoaded', function () {
    
    // --- Element References ---
    const loanAmountSlider = document.getElementById('loanAmount');
    const interestRateSlider = document.getElementById('interestRate');
    const loanTenureSlider = document.getElementById('loanTenure');

    const loanAmountText = document.getElementById('loanAmountText');
    const interestRateText = document.getElementById('interestRateText');
    const loanTenureText = document.getElementById('loanTenureText');

    const monthlyEmiEl = document.getElementById('monthly-emi');
    const principalPaidEl = document.getElementById('principal-paid');
    const interestPaidEl = document.getElementById('interest-paid');
    const totalPaymentEl = document.getElementById('total-payment');
    
    const toggleScheduleBtn = document.getElementById('toggle-schedule-btn');
    const scheduleContainer = document.getElementById('schedule-container');
    const scheduleBody = document.getElementById('schedule-body');
    const canvasEl = document.getElementById('emiChart');

    // --- FIX: Robustness Check ---
    // This guard clause checks if the essential elements for the calculator exist.
    // If any are missing, it stops the script and logs an error, preventing crashes.
    if (!loanAmountSlider || !interestRateSlider || !loanTenureSlider || !canvasEl || !toggleScheduleBtn) {
        console.error("EMI Calculator Error: One or more essential HTML elements are missing. Please check the shortcode's HTML output.");
        return; // Stop execution if elements are missing
    }

    // --- Chart.js Setup ---
    const ctx = canvasEl.getContext('2d');
    let emiChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Principal', 'Interest'],
            datasets: [{
                data: [1, 0], // Initial dummy data
                backgroundColor: ['#0ea5e9', '#e2e8f0'],
                borderColor: '#ffffff',
                borderWidth: 4,
                hoverOffset: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            cutout: '70%',
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            let label = context.label || '';
                            if (label) {
                                label += ': ';
                            }
                            if (context.parsed !== null) {
                                label += new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(context.parsed);
                            }
                            return label;
                        }
                    }
                }
            }
        }
    });

    // --- Event Listeners ---
    const inputs = [loanAmountSlider, interestRateSlider, loanTenureSlider, loanAmountText, interestRateText, loanTenureText];
    inputs.forEach(input => {
        input.addEventListener('input', () => {
            syncInputs(input);
            calculateAndDisplay();
        });
    });

    toggleScheduleBtn.addEventListener('click', toggleSchedule);

    // --- Core Functions ---
    
    // Syncs the slider and text input values
    function syncInputs(changedElement) {
        if (changedElement === loanAmountSlider) loanAmountText.value = formatIndianCurrency(loanAmountSlider.value);
        if (changedElement === loanAmountText) loanAmountSlider.value = parseNumber(loanAmountText.value);
        
        if (changedElement === interestRateSlider) interestRateText.value = interestRateSlider.value;
        if (changedElement === interestRateText) interestRateSlider.value = interestRateText.value;

        if (changedElement === loanTenureSlider) loanTenureText.value = loanTenureSlider.value;
        if (changedElement === loanTenureText) loanTenureSlider.value = loanTenureText.value;
    }

    // Main calculation and display function
    function calculateAndDisplay() {
        const P = parseFloat(loanAmountSlider.value);
        const annualRate = parseFloat(interestRateSlider.value);
        const tenureYears = parseInt(loanTenureSlider.value);

        if (isNaN(P) || isNaN(annualRate) || isNaN(tenureYears) || P <= 0 || annualRate <= 0 || tenureYears <= 0) {
            resetOutputs();
            return;
        }

        const r = (annualRate / 12) / 100; // Monthly interest rate
        const n = tenureYears * 12; // Number of months

        const emi = P * r * (Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
        
        if (!isFinite(emi)) {
            resetOutputs();
            return;
        }
        
        const totalPayment = emi * n;
        const totalInterest = totalPayment - P;

        // Update UI
        monthlyEmiEl.textContent = formatIndianCurrency(emi, true);
        principalPaidEl.textContent = formatIndianCurrency(P, true);
        interestPaidEl.textContent = formatIndianCurrency(totalInterest, true);
        totalPaymentEl.textContent = formatIndianCurrency(totalPayment, true);

        // Update Chart
        updateChart(P, totalInterest);
        
        // If schedule is visible, regenerate it
        if (scheduleContainer.classList.contains('show')) {
            generateSchedule();
        }
    }
    
    function resetOutputs() {
        monthlyEmiEl.textContent = '₹ 0';
        principalPaidEl.textContent = '₹ 0';
        interestPaidEl.textContent = '₹ 0';
        totalPaymentEl.textContent = '₹ 0';
        updateChart(1, 0);
        scheduleBody.innerHTML = '<tr><td colspan="5" class="text-center p-4 text-slate-500">Please enter valid loan details.</td></tr>';
    }

    // Updates the doughnut chart
    function updateChart(principal, interest) {
        emiChart.data.datasets[0].data[0] = principal;
        emiChart.data.datasets[0].data[1] = interest;
        emiChart.update();
    }

    // Toggles the visibility of the amortization schedule
    function toggleSchedule() {
        if (scheduleContainer.classList.contains('show')) {
            scheduleContainer.classList.remove('show');
            toggleScheduleBtn.textContent = 'Show Full Payment Schedule';
        } else {
            generateSchedule();
            scheduleContainer.classList.add('show');
            toggleScheduleBtn.textContent = 'Hide Full Payment Schedule';
        }
    }

    // Generates the amortization table rows
    function generateSchedule() {
        scheduleBody.innerHTML = ''; // Clear previous schedule

        const P = parseFloat(loanAmountSlider.value);
        const annualRate = parseFloat(interestRateSlider.value);
        const tenureYears = parseInt(loanTenureSlider.value);
        
        if (isNaN(P) || isNaN(annualRate) || isNaN(tenureYears) || P <= 0 || annualRate <= 0 || tenureYears <= 0) {
             scheduleBody.innerHTML = '<tr><td colspan="5" class="text-center p-4 text-slate-500">Please enter valid loan details to generate the schedule.</td></tr>';
            return;
        }

        const r = (annualRate / 12) / 100;
        const n = tenureYears * 12;
        const emi = P * r * (Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);

        let balance = P;
        let rowsHtml = '';

        for (let i = 1; i <= n; i++) {
            const interestPayment = balance * r;
            const principalPayment = emi - interestPayment;
            balance -= principalPayment;
            
            // To prevent negative balance at the end due to rounding
            if (balance < 0) balance = 0;

            rowsHtml += `
                <tr class="text-center text-sm text-slate-700">
                    <td class="p-3">${i}</td>
                    <td class="p-3">${formatIndianCurrency(principalPayment)}</td>
                    <td class="p-3">${formatIndianCurrency(interestPayment)}</td>
                    <td class="p-3 font-semibold text-slate-800">${formatIndianCurrency(emi)}</td>
                    <td class="p-3 font-medium text-sky-700">${formatIndianCurrency(balance)}</td>
                </tr>
            `;
        }
        scheduleBody.innerHTML = rowsHtml;
    }

    // --- Utility Functions ---
    function formatIndianCurrency(num, withSymbol = false) {
        const formatter = new Intl.NumberFormat('en-IN', {
            maximumFractionDigits: 0
        });
        return (withSymbol ? '₹ ' : '') + formatter.format(num);
    }
    
    function parseNumber(str) {
        // Added String() to make the function more robust
        return parseFloat(String(str).replace(/[^0-9.]/g, '')) || 0;
    }


    // --- Initial Calculation on Load ---
    syncInputs(loanAmountSlider);
    syncInputs(interestRateSlider);
    syncInputs(loanTenureSlider);
    calculateAndDisplay();
});