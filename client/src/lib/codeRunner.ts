import type { TestCase, TestRunResult, TestResultItem } from '@/types'

const EXECUTION_TIMEOUT_MS = 1000

function deepEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true
  if (a == null || b == null) return false
  if (typeof a !== typeof b) return String(a) === String(b)
  if (Array.isArray(a) && Array.isArray(b)) {
    return a.length === b.length && a.every((val, i) => deepEqual(val, b[i]))
  }
  if (typeof a === 'object' && typeof b === 'object') {
    const keysA = Object.keys(a as object)
    const keysB = Object.keys(b as object)
    return keysA.length === keysB.length && keysA.every((k) =>
      deepEqual((a as Record<string, unknown>)[k], (b as Record<string, unknown>)[k])
    )
  }
  return a === b
}

export function runTests(
  code: string,
  functionName: string,
  testCases: TestCase[],
): TestRunResult {
  const results: TestResultItem[] = []

  try {
    const wrappedCode = `
      ${code}
      return typeof ${functionName} === 'function' ? ${functionName} : null;
    `
    const createFunction = new Function(wrappedCode)
    const userFunction = createFunction() as ((input: unknown) => unknown) | null

    if (!userFunction) {
      return {
        passed: false,
        results: [],
        error: `Function "${functionName}" not found. Make sure your function is named correctly.`,
      }
    }

    let allPassed = true

    for (const testCase of testCases) {
      try {
        const start = performance.now()
        const result = userFunction(testCase.input)
        const executionTime = performance.now() - start

        if (executionTime > EXECUTION_TIMEOUT_MS) {
          results.push({
            input: testCase.input,
            expected: testCase.expected,
            actual: 'TIMEOUT',
            passed: false,
            error: 'Execution timed out (possible infinite loop)',
          })
          allPassed = false
          continue
        }

        const passed = deepEqual(result, testCase.expected)
        results.push({
          input: testCase.input,
          expected: testCase.expected,
          actual: result,
          passed,
          executionTime,
        })
        if (!passed) allPassed = false
      } catch (err) {
        const e = err as Error
        results.push({
          input: testCase.input,
          expected: testCase.expected,
          actual: null,
          passed: false,
          error: e.message,
        })
        allPassed = false
      }
    }

    return {
      passed: allPassed,
      results,
      error: allPassed ? null : 'Some test cases failed',
    }
  } catch (err) {
    const e = err as Error
    return {
      passed: false,
      results: [],
      error: `Syntax Error: ${e.message}`,
    }
  }
}

export function formatTestResults(testResults: TestRunResult): string {
  if (!testResults.results?.length) {
    return testResults.error ?? 'No test results'
  }

  const lines = testResults.results.map((result, index) => {
    const status = result.passed ? '✅' : '❌'
    const inputStr = JSON.stringify(result.input)
    const expectedStr = JSON.stringify(result.expected)
    const actualStr = result.error ?? JSON.stringify(result.actual)
    return `${status} Test ${index + 1}: ${inputStr} → Expected: ${expectedStr}, Got: ${actualStr}`
  })

  const passed = testResults.results.filter((r) => r.passed).length
  const total = testResults.results.length
  return `${passed}/${total} tests passed\n\n${lines.join('\n')}`
}
