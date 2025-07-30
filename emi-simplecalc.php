<?php
/*
Plugin Name: Home Loan EMI Calculator
Plugin URI: https://isandeepsingh.com/
Description: A minimalist, user-friendly Home Loan EMI Calculator. Use the shortcode [home_loan_emi_calculator] to display it.
Version: 1.3
Author: Sandeep Singh
Author URI: https://isandeepsingh.com/
License: GPLv2 or later
Text Domain: home_loan_emi_calculator
*/

// Prevent direct access to the file
if (!defined('ABSPATH')) {
    exit;
}

// 1. Register the Shortcode and output the HTML
function emi_calculator_shortcode_html() {
    // Start output buffering to capture the HTML
    ob_start();
    ?>

    <!-- This is the HTML structure for the calculator -->
    <div id="emi-calculator-wrapper" class="w-full max-w-4xl bg-white rounded-2xl shadow-lg p-6 md:p-10">
        
        <div class="text-center mb-8 md:mb-12">
            <h1 class="text-3xl md:text-4xl font-bold text-slate-800">Home Loan EMI Calculator</h1>
            <p class="text-slate-500 mt-2">Instantly calculate your monthly payments with our simple tool.</p>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-start">
            <!-- Left Side: Input Controls & Details -->
            <div class="space-y-8">
                <!-- Input Controls Section -->
                <div class="space-y-6">
                    <!-- Loan Amount -->
                    <div>
                        <label for="loanAmount" class="flex justify-between items-center text-lg font-medium text-slate-700 mb-2">
                            <span>Loan Amount</span>
                            <span class="text-sky-600 font-semibold">₹ <input type="text" id="loanAmountText" class="w-32 text-right bg-transparent focus:outline-none"></span>
                        </label>
                        <input type="range" id="loanAmount" min="100000" max="20000000" step="100000" value="2500000" class="slider">
                    </div>

                    <!-- Interest Rate -->
                    <div>
                        <label for="interestRate" class="flex justify-between items-center text-lg font-medium text-slate-700 mb-2">
                            <span>Interest Rate (% p.a.)</span>
                            <span class="text-sky-600 font-semibold"><input type="text" id="interestRateText" class="w-16 text-right bg-transparent focus:outline-none"> %</span>
                        </label>
                        <input type="range" id="interestRate" min="6" max="15" step="0.05" value="8.5" class="slider">
                    </div>

                    <!-- Loan Tenure -->
                    <div>
                        <label for="loanTenure" class="flex justify-between items-center text-lg font-medium text-slate-700 mb-2">
                            <span>Loan Tenure (Years)</span>
                            <span class="text-sky-600 font-semibold"><input type="text" id="loanTenureText" class="w-12 text-right bg-transparent focus:outline-none"> Yrs</span>
                        </label>
                        <input type="range" id="loanTenure" min="1" max="30" step="1" value="20" class="slider">
                    </div>
                </div>

                <!-- NEW: Payment Breakdown Section -->
                <div class="border-t border-slate-200 pt-6 space-y-3">
                    <div class="flex justify-between items-center text-base">
                        <span class="text-slate-600">Principal Amount</span>
                        <span id="principal-paid" class="font-semibold text-slate-800">₹ 0</span>
                    </div>
                     <div class="flex justify-between items-center text-base">
                        <span class="text-slate-600">Total Interest</span>
                        <span id="interest-paid" class="font-semibold text-slate-800">₹ 0</span>
                    </div>
                     <div class="flex justify-between items-center text-lg">
                        <span class="font-medium text-slate-800">Total Payment</span>
                        <span id="total-payment" class="font-bold text-slate-900">₹ 0</span>
                    </div>
                </div>
            </div>

            <!-- Right Side: Output & Chart -->
            <div class="flex flex-col items-center justify-center bg-slate-50 rounded-xl p-6 h-full">
                <div class="text-center mb-4">
                    <p class="text-slate-500 text-lg">Your Monthly EMI</p>
                    <p id="monthly-emi" class="text-4xl md:text-5xl font-bold text-sky-600">₹ 0</p>
                </div>
                <div class="w-full max-w-[280px] h-auto relative mt-auto">
                    <canvas id="emiChart"></canvas>
                </div>
            </div>
        </div>
        
        <!-- Amortization Schedule Section -->
        <div class="mt-10 text-center">
            <button id="toggle-schedule-btn" class="bg-sky-500 hover:bg-sky-600 text-white font-semibold py-3 px-6 rounded-lg transition-transform transform hover:scale-105">
                Show Full Payment Schedule
            </button>
            <div id="schedule-container" class="mt-6 text-left">
                <div class="border border-slate-200 rounded-lg overflow-hidden">
                    <table class="w-full">
                        <thead class="bg-slate-100">
                            <tr>
                                <th class="p-3 text-sm font-semibold text-slate-600">Month</th>
                                <th class="p-3 text-sm font-semibold text-slate-600">Principal (₹)</th>
                                <th class="p-3 text-sm font-semibold text-slate-600">Interest (₹)</th>
                                <th class="p-3 text-sm font-semibold text-slate-600">EMI (₹)</th>
                                <th class="p-3 text-sm font-semibold text-slate-600">Outstanding (₹)</th>
                            </tr>
                        </thead>
                        <tbody id="schedule-body" class="divide-y divide-slate-200">
                            <!-- Rows will be generated by JavaScript -->
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

    </div>

    <?php
    // Return the captured HTML
    return ob_get_clean();
}
add_shortcode('home_loan_emi_calculator', 'emi_calculator_shortcode_html');

// 2. Enqueue Scripts and Styles
function emi_calculator_assets() {
    // Only load assets if the shortcode is present on the page
    global $post;
    if (is_a($post, 'WP_Post') && has_shortcode($post->post_content, 'home_loan_emi_calculator')) {
        
        // Enqueue Google Fonts
        wp_enqueue_style('google-fonts-inter', 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap', array(), null);
        
        // Enqueue Chart.js from CDN (loads in footer)
        wp_enqueue_script('chart-js', 'https://cdn.jsdelivr.net/npm/chart.js', array(), '3.7.0', true);
        
        // Enqueue Tailwind CSS from CDN. The last parameter 'false' tells WordPress to load this in the <head>.
        wp_enqueue_script('tailwind-css', 'https://cdn.tailwindcss.com', array(), '3.0.0', false);

        // Enqueue our custom stylesheet
        wp_enqueue_style('emi-calculator-style', plugin_dir_url(__FILE__) . 'style.css', array(), '1.3');
        
        // Enqueue our custom JavaScript (loads in footer)
        wp_enqueue_script('emi-calculator-script', plugin_dir_url(__FILE__) . 'calculator.js', array('jquery', 'chart-js'), '1.3', true);
    }
}
add_action('wp_enqueue_scripts', 'emi_calculator_assets');

?>