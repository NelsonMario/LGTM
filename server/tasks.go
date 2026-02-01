package main

type Task struct {
	ID           int        `json:"id"`
	Title        string     `json:"title"`
	Description  string     `json:"description"`
	FunctionName string     `json:"functionName"`
	StarterCode  string     `json:"starterCode"`
	TestCases    []TestCase `json:"testCases"`
}

type TestCase struct {
	Input    interface{} `json:"input"`
	Expected interface{} `json:"expected"`
}

var Tasks = []Task{
	{
		ID:           1,
		Title:        "FizzBuzz",
		Description:  "Write a function that returns \"Fizz\" for multiples of 3, \"Buzz\" for multiples of 5, \"FizzBuzz\" for multiples of both, and the number as a string otherwise.",
		FunctionName: "fizzBuzz",
		StarterCode: `function fizzBuzz(n) {
  // Your code here
  // Return "Fizz", "Buzz", "FizzBuzz", or the number as string
  
}`,
		TestCases: []TestCase{
			{Input: 15, Expected: "FizzBuzz"},
			{Input: 9, Expected: "Fizz"},
			{Input: 10, Expected: "Buzz"},
			{Input: 7, Expected: "7"},
		},
	},
	{
		ID:           2,
		Title:        "Reverse String",
		Description:  "Write a function that reverses a string without using the built-in reverse() method.",
		FunctionName: "reverseString",
		StarterCode: `function reverseString(str) {
  // Your code here
  // Return the reversed string
  
}`,
		TestCases: []TestCase{
			{Input: "hello", Expected: "olleh"},
			{Input: "world", Expected: "dlrow"},
			{Input: "a", Expected: "a"},
		},
	},
	{
		ID:           3,
		Title:        "Find Maximum",
		Description:  "Write a function that finds the maximum number in an array without using Math.max().",
		FunctionName: "findMax",
		StarterCode: `function findMax(arr) {
  // Your code here
  // Return the largest number in the array
  
}`,
		TestCases: []TestCase{
			{Input: []int{1, 5, 3, 9, 2}, Expected: 9},
			{Input: []int{-1, -5, -3}, Expected: -1},
			{Input: []int{42}, Expected: 42},
		},
	},
	{
		ID:           4,
		Title:        "Palindrome Check",
		Description:  "Write a function that checks if a string is a palindrome (reads the same forwards and backwards).",
		FunctionName: "isPalindrome",
		StarterCode: `function isPalindrome(str) {
  // Your code here
  // Return true if palindrome, false otherwise
  
}`,
		TestCases: []TestCase{
			{Input: "racecar", Expected: true},
			{Input: "hello", Expected: false},
			{Input: "a", Expected: true},
		},
	},
	{
		ID:           5,
		Title:        "Sum Array",
		Description:  "Write a function that returns the sum of all numbers in an array using a loop.",
		FunctionName: "sumArray",
		StarterCode: `function sumArray(arr) {
  // Your code here
  // Return the sum of all numbers
  
}`,
		TestCases: []TestCase{
			{Input: []int{1, 2, 3, 4, 5}, Expected: 15},
			{Input: []int{10, 20, 30}, Expected: 60},
			{Input: []int{0}, Expected: 0},
		},
	},
	{
		ID:           6,
		Title:        "Count Vowels",
		Description:  "Write a function that counts the number of vowels (a, e, i, o, u) in a string.",
		FunctionName: "countVowels",
		StarterCode: `function countVowels(str) {
  // Your code here
  // Return the count of vowels
  
}`,
		TestCases: []TestCase{
			{Input: "hello world", Expected: 3},
			{Input: "aeiou", Expected: 5},
			{Input: "xyz", Expected: 0},
		},
	},
}
