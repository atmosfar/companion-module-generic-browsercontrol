import tseslint from 'typescript-eslint'
import prettier from 'eslint-plugin-prettier/recommended'

export default tseslint.config(
	...tseslint.configs.recommended,
	prettier,
	{
		rules: {
			'@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_(.+)' }],
			'no-console': 'warn',
		},
	},
	{
		files: ['**/*.ts'],
		rules: {
			// The module API requires an `any` index signature on the config type and
			// Puppeteer page objects are untyped; the official template disables this too.
			'@typescript-eslint/no-explicit-any': 'off',
		},
	},
	{
		ignores: ['dist/', 'node_modules/'],
	}
)
