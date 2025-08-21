module.exports = {
	root: true,
	env: {
		browser: true,
		es6: true,
		node: true,
	},
	parser: '@typescript-eslint/parser',
	parserOptions: {
		sourceType: 'module',
		ecmaVersion: 2019,
	},
	plugins: ['@typescript-eslint'],
	extends: [
		'eslint:recommended',
	],
	rules: {
		'no-unused-vars': 'off',
		'no-undef': 'off',
		'prefer-const': 'error',
		'no-var': 'error',
	},
	ignorePatterns: ['dist/**', 'node_modules/**'],
};
