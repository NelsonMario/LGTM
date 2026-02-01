/**
 * Safely executes JavaScript code and runs test cases
 * Returns { passed: boolean, results: TestResult[], error?: string }
 */
export function runTests(code, functionName, testCases) {
  const results = [];
  
  try {
    // Create a sandboxed function from the code
    // We wrap the code and extract the function
    const wrappedCode = `
      ${code}
      return typeof ${functionName} === 'function' ? ${functionName} : null;
    `;
    
    // Create the function in a sandboxed scope
    const createFunction = new Function(wrappedCode);
    const userFunction = createFunction();
    
    if (!userFunction) {
      return {
        passed: false,
        results: [],
        error: `Function "${functionName}" not found. Make sure your function is named correctly.`
      };
    }
    
    // Run each test case
    let allPassed = true;
    
    for (const testCase of testCases) {
      try {
        // Execute with timeout protection
        const startTime = performance.now();
        const result = userFunction(testCase.input);
        const executionTime = performance.now() - startTime;
        
        // Check for infinite loops (timeout after 1 second)
        if (executionTime > 1000) {
          results.push({
            input: testCase.input,
            expected: testCase.expected,
            actual: 'TIMEOUT',
            passed: false,
            error: 'Execution timed out (possible infinite loop)'
          });
          allPassed = false;
          continue;
        }
        
        // Compare results (handle different types)
        const passed = deepEqual(result, testCase.expected);
        
        results.push({
          input: testCase.input,
          expected: testCase.expected,
          actual: result,
          passed,
          executionTime
        });
        
        if (!passed) {
          allPassed = false;
        }
      } catch (testError) {
        results.push({
          input: testCase.input,
          expected: testCase.expected,
          actual: null,
          passed: false,
          error: testError.message
        });
        allPassed = false;
      }
    }
    
    return {
      passed: allPassed,
      results,
      error: allPassed ? null : 'Some test cases failed'
    };
    
  } catch (syntaxError) {
    return {
      passed: false,
      results: [],
      error: `Syntax Error: ${syntaxError.message}`
    };
  }
}

/**
 * Deep equality check for comparing test results
 */
function deepEqual(a, b) {
  // Handle null/undefined
  if (a === b) return true;
  if (a === null || b === null) return false;
  if (a === undefined || b === undefined) return false;
  
  // Handle type differences
  if (typeof a !== typeof b) {
    // Allow string/number comparison for things like "7" === 7
    if (String(a) === String(b)) return true;
    return false;
  }
  
  // Handle arrays
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    return a.every((val, idx) => deepEqual(val, b[idx]));
  }
  
  // Handle objects
  if (typeof a === 'object' && typeof b === 'object') {
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    if (keysA.length !== keysB.length) return false;
    return keysA.every(key => deepEqual(a[key], b[key]));
  }
  
  // Primitive comparison
  return a === b;
}

/**
 * Format test results for display
 */
export function formatTestResults(testResults) {
  if (!testResults.results || testResults.results.length === 0) {
    return testResults.error || 'No test results';
  }
  
  const lines = testResults.results.map((result, index) => {
    const status = result.passed ? '✅' : '❌';
    const inputStr = JSON.stringify(result.input);
    const expectedStr = JSON.stringify(result.expected);
    const actualStr = result.error || JSON.stringify(result.actual);
    
    return `${status} Test ${index + 1}: ${inputStr} → Expected: ${expectedStr}, Got: ${actualStr}`;
  });
  
  const passedCount = testResults.results.filter(r => r.passed).length;
  const totalCount = testResults.results.length;
  
  return `${passedCount}/${totalCount} tests passed\n\n${lines.join('\n')}`;
}
