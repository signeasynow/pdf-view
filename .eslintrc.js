module.exports = {
	root: true, // stop ESLint from looking at parent directories
	env: {
		browser: true,
		es2021: true
	},
	plugins: [
		'promise'
	],
	extends: [
		'preact',
		'plugin:preact/recommended',
		'plugin:jest/recommended',
		'plugin:promise/recommended'
	],
	parser: '@babel/eslint-parser', // use the new parser
	parserOptions: {
		requireConfigFile: false, // this is needed for @babel/eslint-parser
		ecmaVersion: 'latest',
		sourceType: 'module',
		ecmaFeatures: {
			jsx: true
		}
	},
	settings: {
		react: {
			pragma: 'h',
			version: '16' // specify the version of React to assume for linting
		}
	},
	rules: {
		'react/react-in-jsx-scope': 'off',
		'react/jsx-uses-react': 'off',
		'react/jsx-uses-vars': 'error',
		'no-undef': 'off',
		'no-unused-vars': ['warn', { args: 'after-used' }],
		'no-mixed-spaces-and-tabs': 'off',
		'no-case-declarations': 'off'
	}
};