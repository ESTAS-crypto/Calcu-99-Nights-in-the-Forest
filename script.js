// script.js - Logic untuk 99 Nights in the Forest Calculator
// Enhanced Version dengan lebih banyak pola angka cantik

// ========================================
// KONSTANTA & VARIABEL GLOBAL
// ========================================
const BASE_STEP = 1; // Immutable base step
const MAX_CHILDREN = 4;
const MAX_BEDS = 4;
const SECONDS_PER_DAY = 270; // 1 hari = 4 menit 30 detik

// ========================================
// UTILITAS KONVERSI WAKTU
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

    // Check exact reachability
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
// ENHANCED PATTERN MATCHING
// ========================================
function checkPatterns(num, patternType, customRegex = null) {
    const numStr = num.toString();
    const patterns = {};

    // 1. Same Digits (semua digit sama) - 1111, 2222, 3333
    patterns.sameDigits = /^(\d)\1+$/.test(numStr) && numStr.length > 1;

    // 2. Ascending (urut naik) - 1234, 2345, 3456
    patterns.ascending = numStr.length > 1 &&
        numStr.split('').every((digit, i) =>
            i === 0 || parseInt(digit) === parseInt(numStr[i - 1]) + 1
        );

    // 3. Descending (urut turun) - 4321, 3210, 5432
    patterns.descending = numStr.length > 1 &&
        numStr.split('').every((digit, i) =>
            i === 0 || parseInt(digit) === parseInt(numStr[i - 1]) - 1
        );

    // 4. Palindrome - 1221, 1331, 2332, 4554
    patterns.palindrome = numStr.length > 1 &&
        numStr === numStr.split('').reverse().join('');

    // 5. Alternating Pattern - 1212, 1313, 2121, 2323, 2424
    patterns.alternating = false;
    if (numStr.length >= 4 && numStr.length % 2 === 0) {
        const firstTwo = numStr.substring(0, 2);
        let isAlternating = true;
        for (let i = 0; i < numStr.length; i += 2) {
            if (numStr.substring(i, i + 2) !== firstTwo) {
                isAlternating = false;
                break;
            }
        }
        patterns.alternating = isAlternating;
    }

    // 6. Double-Double Pattern - 1122, 2233, 3344, 4455, 5566
    patterns.doubleDouble = false;
    if (numStr.length === 4) {
        patterns.doubleDouble = (numStr[0] === numStr[1] &&
            numStr[2] === numStr[3] &&
            numStr[0] !== numStr[2]);
    } else if (numStr.length === 6) {
        patterns.doubleDouble = (numStr[0] === numStr[1] &&
            numStr[2] === numStr[3] &&
            numStr[4] === numStr[5] &&
            numStr[0] !== numStr[2] &&
            numStr[2] !== numStr[4]);
    }

    // 7. Triple Pattern - 111222, 333444, 555666
    patterns.triplePattern = false;
    if (numStr.length === 6) {
        patterns.triplePattern = (numStr[0] === numStr[1] && numStr[1] === numStr[2] &&
            numStr[3] === numStr[4] && numStr[4] === numStr[5] &&
            numStr[0] !== numStr[3]);
    }

    // 8. Step Pattern (skip pattern) - 1357, 2468, 1359, 2580
    patterns.stepPattern = false;
    if (numStr.length >= 3) {
        let isStep = true;
        const step = parseInt(numStr[1]) - parseInt(numStr[0]);
        if (step > 0 && step <= 4) {
            for (let i = 2; i < numStr.length; i++) {
                if (parseInt(numStr[i]) - parseInt(numStr[i - 1]) !== step) {
                    isStep = false;
                    break;
                }
            }
            patterns.stepPattern = isStep;
        }
    }

    // 9. Mirror Pairs - 1221, 2112, 3443, 4334
    patterns.mirrorPairs = false;
    if (numStr.length === 4) {
        patterns.mirrorPairs = (numStr[0] === numStr[3] && numStr[1] === numStr[2]);
    }

    // 10. Repeating Pairs - 1313, 1414, 1515, 2424, 2525
    patterns.repeatingPairs = false;
    if (numStr.length === 4) {
        patterns.repeatingPairs = (numStr[0] === numStr[2] &&
            numStr[1] === numStr[3] &&
            numStr[0] !== numStr[1]);
    }

    // 11. Fibonacci-like Pattern - 1123, 2358, 1235
    patterns.fibonacci = false;
    if (numStr.length >= 4) {
        let isFib = true;
        for (let i = 2; i < numStr.length; i++) {
            const sum = (parseInt(numStr[i - 1]) + parseInt(numStr[i - 2])) % 10;
            if (parseInt(numStr[i]) !== sum) {
                isFib = false;
                break;
            }
        }
        patterns.fibonacci = isFib && numStr.length >= 4;
    }

    // 12. Round Numbers - 1000, 2000, 5000, 1500
    patterns.roundNumbers = false;
    if (num >= 100) {
        patterns.roundNumbers = (num % 100 === 0) || (num % 500 === 0);
    }

    // 13. Century Numbers - 1900, 2000, 2100
    patterns.century = false;
    if (num >= 1000) {
        patterns.century = (num % 100 === 0 && num >= 1000 && num <= 3000);
    }

    // 14. Lucky Numbers - 777, 888, 7777, 8888
    patterns.lucky = false;
    if (numStr.length >= 3) {
        patterns.lucky = (/^7+$/.test(numStr) || /^8+$/.test(numStr)) && numStr.length >= 3;
    }

    // Custom Regex
    if (customRegex) {
        try {
            patterns.customRegex = new RegExp(customRegex).test(numStr);
        } catch {
            patterns.customRegex = false;
        }
    }

    // Return result based on pattern type
    if (patternType === 'all') {
        return Object.keys(patterns).some(key => patterns[key]);
    } else if (patternType === 'customRegex') {
        return patterns.customRegex || false;
    } else {
        return patterns[patternType] || false;
    }
}

// Helper function to identify all patterns for a number
function identifyAllPatterns(num) {
    const numStr = num.toString();
    const foundPatterns = [];

    const patternTypes = [
        'sameDigits', 'ascending', 'descending', 'palindrome',
        'alternating', 'doubleDouble', 'triplePattern', 'stepPattern',
        'mirrorPairs', 'repeatingPairs', 'fibonacci', 'roundNumbers',
        'century', 'lucky'
    ];

    for (const pattern of patternTypes) {
        if (checkPatterns(num, pattern)) {
            foundPatterns.push(pattern);
        }
    }

    return foundPatterns;
}

// ========================================
// PENCARIAN ANGKA CANTIK
// ========================================
function findReachablePatterns(currentDay, effectiveStep, maxSteps, patternType, customRegex) {
    const results = [];
    const seenNumbers = new Set(); // Avoid duplicates

    if (effectiveStep === 0) return results;

    // Search forward from current day
    for (let n = 1; n <= maxSteps; n++) {
        const day = currentDay + (n * effectiveStep);

        // Skip if we've seen this number
        if (seenNumbers.has(day)) continue;

        if (checkPatterns(day, patternType, customRegex)) {
            const time = convertStepsToTime(n);
            const allPatterns = identifyAllPatterns(day);

            results.push({
                day: day,
                n: n,
                pattern: getPatternName(day, patternType, customRegex),
                allPatterns: allPatterns,
                time: time.formatted,
                totalSeconds: time.totalSeconds
            });

            seenNumbers.add(day);
        }

        // Limit results for performance
        if (results.length >= 100) break;
    }

    // Sort by steps needed (ascending)
    results.sort((a, b) => a.n - b.n);

    return results.slice(0, 20); // Return top 20
}

// Get pattern name for display
function getPatternName(num, patternType, customRegex) {
    const patternNames = {
        sameDigits: 'Digit Sama',
        ascending: 'Urut Naik',
        descending: 'Urut Turun',
        palindrome: 'Palindrome',
        alternating: 'Alternating',
        doubleDouble: 'Double-Double',
        triplePattern: 'Triple Pattern',
        stepPattern: 'Step Pattern',
        mirrorPairs: 'Mirror Pairs',
        repeatingPairs: 'Repeating Pairs',
        fibonacci: 'Fibonacci-like',
        roundNumbers: 'Round Number',
        century: 'Century Number',
        lucky: 'Lucky Number',
        customRegex: 'Custom Pattern'
    };

    if (patternType !== 'all') {
        return patternNames[patternType] || patternType;
    }

    // For 'all' pattern type, return the first matching pattern
    const patterns = identifyAllPatterns(num);
    if (patterns.length > 0) {
        return patternNames[patterns[0]] || 'Pattern';
    }

    return 'Pattern';
}

// ========================================
// OPTIMASI KONFIGURASI
// ========================================
function optimizeConfiguration(currentDay, targetDay, maxSteps, patternType, customRegex) {
    const results = [];
    const configurations = [];

    // Generate all possible configurations
    for (let c = 0; c <= MAX_CHILDREN; c++) {
        for (let b = 0; b <= MAX_BEDS; b++) {
            const eff = BASE_STEP + c + b;
            if (eff === 0) continue;

            configurations.push({ children: c, beds: b, effectiveStep: eff });
        }
    }

    // Test each configuration
    for (const config of configurations) {
        if (targetDay !== null) {
            // Check if target is reachable with this configuration
            const reach = checkReachability(currentDay, targetDay, config.effectiveStep);
            if (reach.exactReachable) {
                results.push({
                    ...config,
                    n: reach.n,
                    time: reach.time,
                    targetReached: true,
                    score: reach.n // Lower is better
                });
            }
        } else {
            // Find nearest beautiful numbers for this configuration
            const patterns = findReachablePatterns(
                currentDay,
                config.effectiveStep,
                Math.min(maxSteps, 100),
                patternType,
                customRegex
            );

            if (patterns.length > 0) {
                results.push({
                    ...config,
                    nearestPattern: patterns[0],
                    patternCount: patterns.length,
                    score: patterns[0].n // Lower is better
                });
            }
        }
    }

    // Sort by score (steps needed)
    results.sort((a, b) => a.score - b.score);

    // Return top 10 configurations
    return results.slice(0, 10);
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

        // Check if target is a beautiful number
        const patterns = identifyAllPatterns(targetDay);
        if (patterns.length > 0) {
            html += '<div class="pattern-info">';
            html += '<p>🌟 Target adalah angka cantik dengan pola:</p>';
            html += '<div class="pattern-badges">';
            for (const pattern of patterns) {
                html += `<span class="pattern-badge">${getPatternName(targetDay, pattern)}</span>`;
            }
            html += '</div>';
            html += '</div>';
        }

        if (result.sequence) {
            html += '<div class="sequence-display">';
            html += '<p>Sequence:</p>';
            result.sequence.forEach(day => {
                const isBeautiful = day !== '...' && identifyAllPatterns(day).length > 0;
                html += `<span class="sequence-item ${isBeautiful ? 'beautiful' : ''}">${day}</span>`;
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
        let html = '<div class="pattern-statistics">';
        html += `<p>Total angka cantik ditemukan: <strong>${patterns.length}</strong></p>`;
        html += '</div>';

        html += '<div class="results-table">';
        html += '<table>';
        html += '<thead><tr>';
        html += '<th>#</th>';
        html += '<th>Day</th>';
        html += '<th>Pattern Utama</th>';
        html += '<th>Semua Pola</th>';
        html += '<th>Steps (n)</th>';
        html += '<th>Waktu</th>';
        html += '<th>Action</th>';
        html += '</tr></thead>';
        html += '<tbody>';

        patterns.forEach((pattern, idx) => {
            html += '<tr>';
            html += `<td>${idx + 1}</td>`;
            html += `<td class="number-cell"><strong>${pattern.day}</strong></td>`;
            html += `<td><span class="pattern-badge primary">${pattern.pattern}</span></td>`;
            html += '<td>';
            if (pattern.allPatterns && pattern.allPatterns.length > 0) {
                pattern.allPatterns.forEach(p => {
                    html += `<span class="pattern-badge secondary">${getPatternName(pattern.day, p)}</span>`;
                });
            }
            html += '</td>';
            html += `<td>${pattern.n}</td>`;
            html += `<td>${pattern.time}</td>`;
            html += `<td class="action-cell">
                <button onclick="showSequence(${document.getElementById('currentDay').value}, ${pattern.day}, ${pattern.n})" class="action-btn">📋</button>
                <button onclick="setAsTarget(${pattern.day})" class="action-btn">🎯</button>
                <button onclick="showPatternDetails(${pattern.day})" class="action-btn">🔍</button>
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
        let html = '<div class="optimization-summary">';
        if (targetDay !== null) {
            html += `<p>🎯 Optimasi untuk mencapai target: <strong>${targetDay}</strong></p>`;
        } else {
            html += '<p>🔍 Optimasi untuk menemukan angka cantik terdekat</p>';
        }
        html += '</div>';

        html += '<div class="optimization-grid">';

        results.forEach((config, idx) => {
            const rankEmoji = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`;

            html += '<div class="optimization-card">';
            html += `<div class="rank-badge">${rankEmoji}</div>`;
            html += `<h4>Opsi ${idx + 1}</h4>`;
            html += '<div class="config-display">';
            html += `<p>👶 Children: <strong>${config.children}</strong></p>`;
            html += `<p>🛏️ Beds: <strong>${config.beds}</strong></p>`;
            html += `<p>📊 Effective Step: <strong>${config.effectiveStep}</strong></p>`;

            if (config.targetReached) {
                html += '<div class="success-info">';
                html += `<p class="success-message">✅ Target ${targetDay} tercapai!</p>`;
                html += `<p>Steps: <strong>${config.n}</strong></p>`;
                html += `<p>Waktu: <strong>${config.time.formatted}</strong></p>`;
                html += '</div>';
            } else if (config.nearestPattern) {
                html += '<div class="pattern-info">';
                html += `<p>Angka cantik terdekat: <strong>${config.nearestPattern.day}</strong></p>`;
                html += `<p>Pattern: ${config.nearestPattern.pattern}</p>`;
                html += `<p>Steps: ${config.nearestPattern.n}</p>`;
                html += `<p>Waktu: ${config.nearestPattern.time}</p>`;
                html += `<p>Total patterns: ${config.patternCount}</p>`;
                html += '</div>';
            }

            html += '</div>';
            html += `<button class="preset-btn apply-btn" onclick="applyConfiguration(${config.children}, ${config.beds})">
                ✔️ Terapkan Konfigurasi
            </button>`;
            html += '</div>';
        });

        html += '</div>';

        document.getElementById('optimizationContent').innerHTML = html;
    }

    document.getElementById('optimizationSection').style.display = 'block';
}

// ========================================
// EVENT HANDLERS & HELPER FUNCTIONS
// ========================================
function showSequence(startDay, targetDay, steps) {
    const effectiveStep = parseInt(document.getElementById('effectiveStepDisplay').textContent);
    let sequenceHtml = `<h3>Sequence dari ${startDay} ke ${targetDay}</h3>`;
    sequenceHtml += '<div class="sequence-modal">';

    for (let i = 0; i <= Math.min(steps, 30); i++) {
        const day = startDay + i * effectiveStep;
        const patterns = identifyAllPatterns(day);
        const isBeautiful = patterns.length > 0;

        sequenceHtml += `<span class="sequence-item ${isBeautiful ? 'beautiful' : ''}">${day}`;
        if (isBeautiful) {
            sequenceHtml += `<small>(${patterns.join(', ')})</small>`;
        }
        sequenceHtml += '</span>';

        if (i < Math.min(steps, 30)) {
            sequenceHtml += ' → ';
        }
    }

    if (steps > 30) {
        sequenceHtml += ' ... → ' + targetDay;
    }

    sequenceHtml += '</div>';

    // Create modal
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content">
            ${sequenceHtml}
            <button onclick="closeModal()" class="btn btn-primary">Close</button>
        </div>
    `;
    document.body.appendChild(modal);
}

function closeModal() {
    const modal = document.querySelector('.modal-overlay');
    if (modal) {
        modal.remove();
    }
}

function showPatternDetails(day) {
    const patterns = identifyAllPatterns(day);
    let detailHtml = `<h3>Analisis Angka: ${day}</h3>`;
    detailHtml += '<div class="pattern-details">';

    if (patterns.length > 0) {
        detailHtml += '<h4>Pola yang ditemukan:</h4>';
        detailHtml += '<ul>';
        patterns.forEach(pattern => {
            detailHtml += `<li>${getPatternName(day, pattern)}</li>`;
        });
        detailHtml += '</ul>';
    } else {
        detailHtml += '<p>Tidak ada pola khusus yang ditemukan.</p>';
    }

    // Add number properties
    detailHtml += '<h4>Properti Angka:</h4>';
    detailHtml += '<ul>';
    detailHtml += `<li>Jumlah digit: ${day.toString().length}</li>`;
    detailHtml += `<li>Genap/Ganjil: ${day % 2 === 0 ? 'Genap' : 'Ganjil'}</li>`;
    detailHtml += `<li>Divisible by 5: ${day % 5 === 0 ? 'Ya' : 'Tidak'}</li>`;
    detailHtml += `<li>Divisible by 10: ${day % 10 === 0 ? 'Ya' : 'Tidak'}</li>`;
    detailHtml += '</ul>';

    detailHtml += '</div>';

    // Create modal
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content">
            ${detailHtml}
            <button onclick="closeModal()" class="btn btn-primary">Close</button>
        </div>
    `;
    document.body.appendChild(modal);
}

function setAsTarget(day) {
    document.getElementById('targetDay').value = day;
    document.getElementById('targetDay').classList.add('highlight');
    setTimeout(() => {
        document.getElementById('targetDay').classList.remove('highlight');
    }, 1500);

    // Auto-scroll to target input
    document.getElementById('targetDay').scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function applyConfiguration(children, beds) {
    document.getElementById('children').value = children;
    document.getElementById('beds').value = beds;
    updateEffectiveStepDisplay();

    // Visual feedback
    document.getElementById('children').classList.add('highlight');
    document.getElementById('beds').classList.add('highlight');
    setTimeout(() => {
        document.getElementById('children').classList.remove('highlight');
        document.getElementById('beds').classList.remove('highlight');
    }, 1500);
}

function loadPreset(currentDay, children, beds, targetDay) {
    document.getElementById('currentDay').value = currentDay;
    document.getElementById('children').value = children;
    document.getElementById('beds').value = beds;
    document.getElementById('targetDay').value = targetDay || '';
    updateEffectiveStepDisplay();

    // Visual feedback
    const inputs = ['currentDay', 'children', 'beds'];
    if (targetDay) inputs.push('targetDay');

    inputs.forEach(id => {
        document.getElementById(id).classList.add('highlight');
    });

    setTimeout(() => {
        inputs.forEach(id => {
            document.getElementById(id).classList.remove('highlight');
        });
    }, 1500);
}

// ========================================
// MAIN FUNCTIONS
// ========================================
function handleCalculate() {
    const validation = validateInputs();

    if (!validation.valid) {
        showErrorModal('Error Validasi', validation.errors);
        return;
    }

    const { currentDay, children, beds, targetDay } = validation.values;
    const effectiveStep = BASE_STEP + children + beds;

    if (targetDay === null) {
        showErrorModal('Input Tidak Lengkap', ['Masukkan Target Day untuk menghitung reachability']);
        return;
    }

    const result = checkReachability(currentDay, targetDay, effectiveStep);
    renderReachabilityResults(result, targetDay);
}

function handleFindPatterns() {
    const validation = validateInputs();

    if (!validation.valid) {
        showErrorModal('Error Validasi', validation.errors);
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
        showErrorModal('Error Validasi', validation.errors);
        return;
    }

    const { currentDay, targetDay, maxSteps } = validation.values;
    const patternType = document.getElementById('pattern').value;
    const customRegex = document.getElementById('customRegex').value;

    const results = optimizeConfiguration(currentDay, targetDay, maxSteps, patternType, customRegex);
    renderOptimizationResults(results, targetDay);
}

function showErrorModal(title, errors) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content error-modal">
            <h3>❌ ${title}</h3>
            <ul>
                ${errors.map(err => `<li>${err}</li>`).join('')}
            </ul>
            <button onclick="closeModal()" class="btn btn-primary">OK</button>
        </div>
    `;
    document.body.appendChild(modal);
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

    // Keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        if (e.ctrlKey || e.metaKey) {
            switch(e.key) {
                case 'Enter':
                    handleCalculate();
                    e.preventDefault();
                    break;
                case 'f':
                    handleFindPatterns();
                    e.preventDefault();
                    break;
                case 'o':
                    handleOptimize();
                    e.preventDefault();
                    break;
            }
        }
    });

    // Initialize display
    updateEffectiveStepDisplay();
    
    // Show welcome message
    console.log('🌲 99 Nights in the Forest Calculator initialized!');
    console.log('Keyboard shortcuts:');
    console.log('  Ctrl+Enter: Calculate Reachability');
    console.log('  Ctrl+F: Find Patterns');
    console.log('  Ctrl+O: Optimize Configuration');
});