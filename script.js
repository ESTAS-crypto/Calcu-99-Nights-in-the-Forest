// script.js - Logic untuk 99 Nights in the Forest Calculator

// ========================================
// KONSTANTA & VARIABEL GLOBAL
// ========================================
const BASE_STEP = 1; // Immutable base step
const MAX_CHILDREN = 4;
const MAX_BEDS = 4;
const SECONDS_PER_DAY = 270; // 1 hari = 4 menit 30 detik

// ========================================
// UTILITAS KONVERSI WAKTU
// Konversi jumlah hari ke format waktu yang readable
// ========================================
function convertStepsToTime(steps) {
    const totalSeconds = steps * SECONDS_PER_DAY;
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    let timeStr = '';
    if (hours > 0) {
        timeStr += `${hours} jam `;
    }
    timeStr += `${minutes} menit ${seconds} detik`;
    
    return {
        totalSeconds,
        formatted: timeStr.trim(),
        hours,
        minutes,
        seconds
    };
}

// ========================================
// VALIDASI INPUT
// Memastikan semua input valid sebelum perhitungan
// ========================================
function validateInputs() {
    const currentDay = parseInt(document.getElementById('currentDay').value);
    const children = parseInt(document.getElementById('children').value);
    const beds = parseInt(document.getElementById('beds').value);
    const targetDay = document.getElementById('targetDay').value;
    const maxSteps = parseInt(document.getElementById('maxSteps').value);
    
    const errors = [];
    
    if (isNaN(currentDay) || currentDay < 0) {
        errors.push('Current Day harus ≥ 0');
        document.getElementById('currentDay').classList.add('invalid');
    } else {
        document.getElementById('currentDay').classList.remove('invalid');
    }
    
    if (isNaN(children) || children < 0 || children > MAX_CHILDREN) {
        errors.push(`Children harus 0-${MAX_CHILDREN}`);
        document.getElementById('children').classList.add('invalid');
    } else {
        document.getElementById('children').classList.remove('invalid');
    }
    
    if (isNaN(beds) || beds < 0 || beds > MAX_BEDS) {
        errors.push(`Beds harus 0-${MAX_BEDS}`);
        document.getElementById('beds').classList.add('invalid');
    } else {
        document.getElementById('beds').classList.remove('invalid');
    }
    
    if (targetDay && (isNaN(parseInt(targetDay)) || parseInt(targetDay) < 0)) {
        errors.push('Target Day harus ≥ 0');
        document.getElementById('targetDay').classList.add('invalid');
    } else {
        document.getElementById('targetDay').classList.remove('invalid');
    }
    
    if (isNaN(maxSteps) || maxSteps < 100 || maxSteps > 10000) {
        errors.push('Max Steps harus 100-10000');
        document.getElementById('maxSteps').classList.add('invalid');
    } else {
        document.getElementById('maxSteps').classList.remove('invalid');
    }
    
    return {
        valid: errors.length === 0,
        errors,
        values: {
            currentDay,
            children,
            beds,
            targetDay: targetDay ? parseInt(targetDay) : null,
            maxSteps
        }
    };
}

// ========================================
// PERHITUNGAN REACHABILITY D → T
// Mengecek apakah target T dapat dicapai dari current D
// ========================================
function checkReachability(D, T, effectiveStep) {
    // Handle edge cases
    if (effectiveStep === 0) {
        return {
            error: 'Effective step tidak boleh 0'
        };
    }
    
    if (T < D) {
        return {
            exactReachable: false,
            message: 'Target berada di masa lalu (T < D)',
            nearestAbove: D,
            n_above: 0
        };
    }
    
    // Check exact reachability: T ≡ D (mod eff) dan T ≥ D
    const diff = T - D;
    const isExactReachable = (diff % effectiveStep === 0);
    
    if (isExactReachable) {
        const n = diff / effectiveStep;
        const sequence = [];
        for (let i = 0; i <= Math.min(n, 10); i++) {
            sequence.push(D + i * effectiveStep);
        }
        if (n > 10) {
            sequence.push('...');
            sequence.push(T);
        }
        
        return {
            exactReachable: true,
            n: n,
            sequence: sequence,
            time: convertStepsToTime(n)
        };
    } else {
        // Not exactly reachable
        const n_below = Math.floor(diff / effectiveStep);
        const n_above = Math.ceil(diff / effectiveStep);
        const nearestBelow = D + n_below * effectiveStep;
        const nearestAbove = D + n_above * effectiveStep;
        
        return {
            exactReachable: false,
            nearestBelow: nearestBelow,
            nearestAbove: nearestAbove,
            n_below: n_below,
            n_above: n_above,
            time_below: convertStepsToTime(n_below),
            time_above: convertStepsToTime(n_above),
            gap: T - nearestBelow,
            overshoot: nearestAbove - T
        };
    }
}

// ========================================
// PATTERN MATCHING UNTUK ANGKA CANTIK
// Mendeteksi berbagai pola angka cantik
// ========================================
function checkPatterns(num, patternType, customRegex = null) {
    const numStr = num.toString();
    const patterns = {};
    
    // Same Digits (semua digit sama)
    patterns.sameDigits = /^(\d)\1+$/.test(numStr) && numStr.length > 1;
    
    // Ascending (urut naik)
    patterns.ascending = numStr.length > 1 && 
        numStr.split('').every((digit, i) => 
            i === 0 || parseInt(digit) === parseInt(numStr[i-1]) + 1
        );
    
    // Descending (urut turun)
    patterns.descending = numStr.length > 1 && 
        numStr.split('').every((digit, i) => 
            i === 0 || parseInt(digit) === parseInt(numStr[i-1]) - 1
        );
    
    // Palindrome
    patterns.palindrome = numStr.length > 1 && 
        numStr === numStr.split('').reverse().join('');
    
    // Custom Regex
    if (customRegex) {
        try {
            patterns.customRegex = new RegExp(customRegex).test(numStr);
        } catch {
            patterns.customRegex = false;
        }
    }
    
    if (patternType === 'all') {
        return Object.keys(patterns).some(key => patterns[key]);
    } else if (patternType === 'customRegex') {
        return patterns.customRegex || false;
    } else {
        return patterns[patternType] || false;
    }
}

// ========================================
// PENCARIAN ANGKA CANTIK YANG REACHABLE
// Mencari angka-angka cantik yang dapat dicapai
// ========================================
function findReachablePatterns(currentDay, effectiveStep, maxSteps, patternType, customRegex) {
    const results = [];
    
    if (effectiveStep === 0) return results;
    
    // Search forward from current day
    for (let n = 1; n <= maxSteps; n++) {
        const day = currentDay + (n * effectiveStep);
        
        if (checkPatterns(day, patternType, customRegex)) {
            const time = convertStepsToTime(n);
            results.push({
                day: day,
                n: n,
                pattern: getPatternName(day, patternType, customRegex),
                time: time.formatted,
                totalSeconds: time.totalSeconds
            });
        }
        
        // Limit results for performance
        if (results.length >= 100) break;
    }
    
    // Sort by steps needed (ascending)
    results.sort((a, b) => a.n - b.n);
    
    return results.slice(0, 10); // Return top 10
}

// Helper function to get pattern name
function getPatternName(num, patternType, customRegex) {
    if (patternType !== 'all') return patternType;
    
    const numStr = num.toString();
    if (/^(\d)\1+$/.test(numStr) && numStr.length > 1) return 'sameDigits';
    if (numStr === numStr.split('').reverse().join('') && numStr.length > 1) return 'palindrome';
    
    const isAscending = numStr.length > 1 && 
        numStr.split('').every((digit, i) => 
            i === 0 || parseInt(digit) === parseInt(numStr[i-1]) + 1
        );
    if (isAscending) return 'ascending';
    
    const isDescending = numStr.length > 1 && 
        numStr.split('').every((digit, i) => 
            i === 0 || parseInt(digit) === parseInt(numStr[i-1]) - 1
        );
    if (isDescending) return 'descending';
    
    return 'pattern';
}

// ========================================
// OPTIMASI KONFIGURASI
// Brute-force semua kombinasi children & beds
// ========================================
function optimizeConfiguration(currentDay, targetDay, maxSteps, patternType, customRegex) {
    const results = [];
    
    // Try all combinations of children (0-4) and beds (0-4)
    for (let c = 0; c <= MAX_CHILDREN; c++) {
        for (let b = 0; b <= MAX_BEDS; b++) {
            const eff = BASE_STEP + c + b;
            
            if (eff === 0) continue;
            
            if (targetDay !== null) {
                // Check if target is reachable with this configuration
                const reach = checkReachability(currentDay, targetDay, eff);
                if (reach.exactReachable) {
                    results.push({
                        children: c,
                        beds: b,
                        effectiveStep: eff,
                        n: reach.n,
                        time: reach.time,
                        targetReached: true
                    });
                }
            } else {
                // Find nearest beautiful numbers for this configuration
                const patterns = findReachablePatterns(currentDay, eff, Math.min(maxSteps, 100), patternType, customRegex);
                if (patterns.length > 0) {
                    results.push({
                        children: c,
                        beds: b,
                        effectiveStep: eff,
                        nearestPattern: patterns[0],
                        patternCount: patterns.length
                    });
                }
            }
        }
    }
    
    // Sort by steps needed (for target) or by nearest pattern distance
    if (targetDay !== null) {
        results.sort((a, b) => a.n - b.n);
    } else {
        results.sort((a, b) => {
            if (!a.nearestPattern || !b.nearestPattern) return 0;
            return a.nearestPattern.n - b.nearestPattern.n;
        });
    }
    
    return results.slice(0, 5); // Return top 5 configurations
}

// ========================================
// UPDATE UI
// ========================================
function updateEffectiveStepDisplay() {
    const children = parseInt(document.getElementById('children').value) || 0;
    const beds = parseInt(document.getElementById('beds').value) || 0;
    const effectiveStep = BASE_STEP + children + beds;
    
    document.getElementById('effectiveStepDisplay').textContent = effectiveStep;
    document.querySelector('.status-display p:last-child').innerHTML = 
        `Formula: baseStep(${BASE_STEP}) + children(${children}) + beds(${beds}) = <strong>${effectiveStep}</strong>`;
}

// ========================================
// RENDER HASIL
// ========================================
function renderReachabilityResults(result, targetDay) {
    let html = '<div class="result-card">';
    
    if (result.error) {
        html += `<p class="error-message">❌ Error: ${result.error}</p>`;
    } else if (result.exactReachable) {
        html += `<h3>✅ Target ${targetDay} DAPAT dicapai!</h3>`;
        html += `<p class="success-message">Exactly Reachable: YES</p>`;
        html += `<p>Jumlah langkah (n): <strong>${result.n}</strong></p>`;
        html += `<p>Waktu yang dibutuhkan: <strong>${result.time.formatted}</strong></p>`;
        
        if (result.sequence) {
            html += '<div class="sequence-display">';
            html += '<p>Sequence:</p>';
            result.sequence.forEach(day => {
                html += `<span class="sequence-item">${day}</span>`;
            });
            html += '</div>';
        }
    } else {
        html += `<h3>❌ Target ${targetDay} TIDAK dapat dicapai persis</h3>`;
        html += `<p class="error-message">Exactly Reachable: NO</p>`;
        
        if (result.message) {
            html += `<p class="warning-message">${result.message}</p>`;
        } else {
            html += '<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 15px;">';
            
            html += '<div>';
            html += `<h4>📍 Nearest Below:</h4>`;
            html += `<p>Day: <strong>${result.nearestBelow}</strong></p>`;
            html += `<p>Steps (n_below): <strong>${result.n_below}</strong></p>`;
            html += `<p>Waktu: ${result.time_below.formatted}</p>`;
            html += `<p>Gap: ${result.gap} days</p>`;
            html += '</div>';
            
            html += '<div>';
            html += `<h4>📍 Nearest Above:</h4>`;
            html += `<p>Day: <strong>${result.nearestAbove}</strong></p>`;
            html += `<p>Steps (n_above): <strong>${result.n_above}</strong></p>`;
            html += `<p>Waktu: ${result.time_above.formatted}</p>`;
            html += `<p>Overshoot: ${result.overshoot} days</p>`;
            html += '</div>';
            
            html += '</div>';
        }
    }
    
    html += '</div>';
    
    document.getElementById('resultsContent').innerHTML = html;
    document.getElementById('resultsSection').style.display = 'block';
}

function renderPatternResults(patterns) {
    if (patterns.length === 0) {
        document.getElementById('patternResultsContent').innerHTML = 
            '<p class="warning-message">Tidak ada angka cantik yang ditemukan dalam batas pencarian.</p>';
    } else {
        let html = '<div class="results-table">';
        html += '<table>';
        html += '<thead><tr>';
        html += '<th>#</th>';
        html += '<th>Pattern</th>';
        html += '<th>Day</th>';
        html += '<th>Steps (n)</th>';
        html += '<th>Waktu</th>';
        html += '<th>Action</th>';
        html += '</tr></thead>';
        html += '<tbody>';
        
        patterns.forEach((pattern, idx) => {
            html += '<tr>';
            html += `<td>${idx + 1}</td>`;
            html += `<td><span class="pattern-badge">${pattern.pattern}</span></td>`;
            html += `<td><strong>${pattern.day}</strong></td>`;
            html += `<td>${pattern.n}</td>`;
            html += `<td>${pattern.time}</td>`;
            html += `<td>
                <button onclick="showSequence(${document.getElementById('currentDay').value}, ${pattern.day}, ${pattern.n})">📋 Sequence</button>
                <button onclick="setAsTarget(${pattern.day})">🎯 Set Target</button>
            </td>`;
            html += '</tr>';
        });
        
        html += '</tbody></table></div>';
        
        document.getElementById('patternResultsContent').innerHTML = html;
    }
    
    document.getElementById('patternResultsSection').style.display = 'block';
}

function renderOptimizationResults(results, targetDay) {
    if (results.length === 0) {
        document.getElementById('optimizationContent').innerHTML = 
            '<p class="warning-message">Tidak ada konfigurasi optimal yang ditemukan.</p>';
    } else {
        let html = '<div class="optimization-grid">';
        
        results.forEach((config, idx) => {
            html += '<div class="optimization-card">';
            html += `<h4>Opsi ${idx + 1}</h4>`;
            html += '<div class="config-display">';
            html += `<p>Children: <strong>${config.children}</strong></p>`;
            html += `<p>Beds: <strong>${config.beds}</strong></p>`;
            html += `<p>Effective Step: <strong>${config.effectiveStep}</strong></p>`;
            
            if (config.targetReached) {
                html += `<p>Target ${targetDay} tercapai!</p>`;
                html += `<p>Steps: <strong>${config.n}</strong></p>`;
                html += `<p>Waktu: <strong>${config.time.formatted}</strong></p>`;
            } else if (config.nearestPattern) {
                html += `<p>Angka cantik terdekat: <strong>${config.nearestPattern.day}</strong></p>`;
                html += `<p>Pattern: ${config.nearestPattern.pattern}</p>`;
                html += `<p>Steps: ${config.nearestPattern.n}</p>`;
                html += `<p>Waktu: ${config.nearestPattern.time}</p>`;
            }
            
            html += '</div>';
            html += `<button class="preset-btn" onclick="applyConfiguration(${config.children}, ${config.beds})">
                Terapkan Konfigurasi
            </button>`;
            html += '</div>';
        });
        
        html += '</div>';
        
        document.getElementById('optimizationContent').innerHTML = html;
    }
    
    document.getElementById('optimizationSection').style.display = 'block';
}

// ========================================
// EVENT HANDLERS
// ========================================
function showSequence(startDay, targetDay, steps) {
    const effectiveStep = parseInt(document.getElementById('effectiveStepDisplay').textContent);
    let sequence = '';
    for (let i = 0; i <= Math.min(steps, 20); i++) {
        sequence += (startDay + i * effectiveStep) + ' → ';
    }
    if (steps > 20) {
        sequence += '... → ' + targetDay;
    } else {
        sequence = sequence.slice(0, -3); // Remove last arrow
    }
    alert(`Sequence dari ${startDay} ke ${targetDay}:\n\n${sequence}`);
}

function setAsTarget(day) {
    document.getElementById('targetDay').value = day;
    document.getElementById('targetDay').classList.add('highlight');
    setTimeout(() => {
        document.getElementById('targetDay').classList.remove('highlight');
    }, 1500);
}

function applyConfiguration(children, beds) {
    document.getElementById('children').value = children;
    document.getElementById('beds').value = beds;
    updateEffectiveStepDisplay();
}

function loadPreset(currentDay, children, beds, targetDay) {
    document.getElementById('currentDay').value = currentDay;
    document.getElementById('children').value = children;
    document.getElementById('beds').value = beds;
    document.getElementById('targetDay').value = targetDay || '';
    updateEffectiveStepDisplay();
}

// ========================================
// MAIN FUNCTIONS
// ========================================
function handleCalculate() {
    const validation = validateInputs();
    
    if (!validation.valid) {
        alert('Error:\n' + validation.errors.join('\n'));
        return;
    }
    
    const { currentDay, children, beds, targetDay } = validation.values;
    const effectiveStep = BASE_STEP + children + beds;
    
    if (targetDay === null) {
        alert('Masukkan Target Day untuk menghitung reachability');
        return;
    }
    
    const result = checkReachability(currentDay, targetDay, effectiveStep);
    renderReachabilityResults(result, targetDay);
}

function handleFindPatterns() {
    const validation = validateInputs();
    
    if (!validation.valid) {
        alert('Error:\n' + validation.errors.join('\n'));
        return;
    }
    
    const { currentDay, children, beds, maxSteps } = validation.values;
    const effectiveStep = BASE_STEP + children + beds;
    const patternType = document.getElementById('pattern').value;
    const customRegex = document.getElementById('customRegex').value;
    
    const patterns = findReachablePatterns(currentDay, effectiveStep, maxSteps, patternType, customRegex);
    renderPatternResults(patterns);
}

function handleOptimize() {
    const validation = validateInputs();
    
    if (!validation.valid) {
        alert('Error:\n' + validation.errors.join('\n'));
        return;
    }
    
    const { currentDay, targetDay, maxSteps } = validation.values;
    const patternType = document.getElementById('pattern').value;
    const customRegex = document.getElementById('customRegex').value;
    
    const results = optimizeConfiguration(currentDay, targetDay, maxSteps, patternType, customRegex);
    renderOptimizationResults(results, targetDay);
}

// ========================================
// INITIALIZATION
// ========================================
document.addEventListener('DOMContentLoaded', function() {
    // Set up event listeners
    document.getElementById('calculateBtn').addEventListener('click', handleCalculate);
    document.getElementById('findPatternsBtn').addEventListener('click', handleFindPatterns);
    document.getElementById('optimizeBtn').addEventListener('click', handleOptimize);
    
    // Update effective step display when inputs change
    document.getElementById('children').addEventListener('input', updateEffectiveStepDisplay);
    document.getElementById('beds').addEventListener('input', updateEffectiveStepDisplay);
    
    // Show/hide custom regex input
    document.getElementById('pattern').addEventListener('change', function() {
        const customRegexGroup = document.getElementById('customRegexGroup');
        if (this.value === 'customRegex') {
            customRegexGroup.style.display = 'block';
        } else {
            customRegexGroup.style.display = 'none';
        }
    });
    
    // Initialize display
    updateEffectiveStepDisplay();
});

// ========================================
// CONTOH OUTPUT KONKRIT (untuk demonstrasi)
// ========================================
function runExamples() {
    console.log("=== CONTOH A ===");
    console.log("currentDay = 120, children = 4, beds = 4");
    const effA = BASE_STEP + 4 + 4; // = 9
    console.log("effectiveStep =", effA);
    console.log("Sequence awal: 129, 138, 147, 156, 165, ...");
    
    console.log("\n=== CONTOH B ===");
    console.log("currentDay = 839, targetDay = 1234");
    const effB = BASE_STEP + 4 + 4; // = 9
    const resultB = checkReachability(839, 1234, effB);
    console.log("Dengan config 4/4:", resultB);
    
    console.log("\n=== CONTOH C ===");
    console.log("currentDay = 999, children = 4, beds = 4");
    const effC = BASE_STEP + 4 + 4; // = 9
    const patternsC = findReachablePatterns(999, effC, 1000, 'all', null);
    console.log("Top 5 angka cantik:", patternsC.slice(0, 5));
}

// Uncomment untuk melihat output di console
// runExamples();
