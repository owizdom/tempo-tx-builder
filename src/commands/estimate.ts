import chalk from 'chalk'
import { readFileSync, existsSync } from 'fs'
import inquirer from 'inquirer'
import { estimateGas } from '../utils/simulator.js'
import { promptAddress, promptHex, promptBigInt, promptConfirm, promptSelect } from '../utils/prompts.js'
import { TIP20_TOKENS, encodeTransferCalldata, calculateTokenAmount } from '../utils/tip20.js'
import type { Transaction } from '../types.js'

export async function estimateCommand(options: {
	file?: string
	address?: string
	to?: string
	data?: string
	value?: string
}) {
	try {
		let transaction: Transaction | undefined

		if (options.file) {
			// Load from file
			const fileContent = readFileSync(options.file, 'utf-8')
			const parsed = JSON.parse(fileContent)
			transaction = {
				...parsed,
				value: parsed.value ? BigInt(parsed.value) : undefined,
				gas: parsed.gas ? BigInt(parsed.gas) : undefined,
				gasPrice: parsed.gasPrice ? BigInt(parsed.gasPrice) : undefined,
				maxFeePerGas: parsed.maxFeePerGas ? BigInt(parsed.maxFeePerGas) : undefined,
				maxPriorityFeePerGas: parsed.maxPriorityFeePerGas
					? BigInt(parsed.maxPriorityFeePerGas)
					: undefined,
			}
		} else if (options.address) {
			// Build from command line options
			transaction = {
				from: options.address as `0x${string}`,
				to: options.to as `0x${string}` | undefined,
				data: options.data as `0x${string}` | undefined,
				value: options.value ? BigInt(options.value) : undefined,
			}
		} else {
			// Interactive mode - ask user
			const { source } = await inquirer.prompt<{ source: 'file' | 'token-transfer' | 'manual' }>([
				{
					type: 'list',
					name: 'source',
					message: 'Load transaction from:',
					choices: [
						{ name: 'File', value: 'file' },
						{ name: 'TIP-20 Token Transfer', value: 'token-transfer' },
						{ name: 'Enter manually', value: 'manual' },
					],
				},
			])

			if (source === 'file') {
				const { filename } = await inquirer.prompt<{ filename: string }>([
					{
						type: 'input',
						name: 'filename',
						message: 'Transaction file path:',
						validate: (input: string) => {
							if (!existsSync(input)) {
								return 'File does not exist'
							}
							return true
						},
					},
				])
				const fileContent = readFileSync(filename, 'utf-8')
				const parsed = JSON.parse(fileContent)
				transaction = {
					...parsed,
					value: parsed.value ? BigInt(parsed.value) : undefined,
					gas: parsed.gas ? BigInt(parsed.gas) : undefined,
					gasPrice: parsed.gasPrice ? BigInt(parsed.gasPrice) : undefined,
					maxFeePerGas: parsed.maxFeePerGas ? BigInt(parsed.maxFeePerGas) : undefined,
					maxPriorityFeePerGas: parsed.maxPriorityFeePerGas
						? BigInt(parsed.maxPriorityFeePerGas)
						: undefined,
				} as Transaction
			} else if (source === 'token-transfer') {
				// TIP-20 Token Transfer
				console.log(chalk.blue('\nTIP-20 Token Transfer\n'))
				console.log(chalk.gray('Note: Tempo uses TIP-20 tokens instead of native value transfers.\n'))

				transaction = {
					from: await promptAddress('From address:'),
				} as Transaction

				// Select token
				const tokenChoice = await promptSelect(
					'Select token:',
					Object.values(TIP20_TOKENS).map((token) => ({
						name: `${token.name} (${token.symbol}) - ${token.address}`,
						value: token,
					})),
				)

				// Recipient
				const recipient = await promptAddress('Recipient address:')

				// Amount
				const { amountInput } = await inquirer.prompt<{ amountInput: string }>([
					{
						type: 'input',
						name: 'amountInput',
						message: `Amount (in ${tokenChoice.symbol}, e.g., 100 or 100.5):`,
						validate: (input: string) => {
							if (!input || input.trim() === '') {
								return 'Amount is required'
							}
							if (!/^\d+(\.\d+)?$/.test(input)) {
								return 'Invalid number format'
							}
							return true
						},
					},
				])

				const amount = calculateTokenAmount(amountInput, tokenChoice.decimals)

				// Generate calldata using new calls format
				transaction.type = 0x76
				transaction.calls = [
					{
						to: tokenChoice.address,
						value: 0n, // No native value
						input: encodeTransferCalldata(recipient, amount),
					},
				]
				transaction.nonceKey = 0n // Default to protocol nonce

				console.log(chalk.green(`\nGenerated transfer calldata for ${amountInput} ${tokenChoice.symbol} to ${recipient}`))
				console.log(chalk.gray(`Token contract: ${tokenChoice.address}`))
				console.log(chalk.gray(`Calldata: ${transaction.calls[0].input}`))
			} else {
				const from = await promptAddress('From address:')
				const hasTo = await promptConfirm('Does this transaction have a recipient?')
				const to = hasTo ? await promptAddress('To address:') : undefined
				const hasData = await promptConfirm('Does this transaction include calldata?')
				const data = hasData ? ((await promptHex('Calldata (hex):', true)) as `0x${string}`) : undefined
				const hasValue = await promptConfirm('Does this transaction send value?')
				const value = hasValue ? await promptBigInt('Value (in wei):', true) : undefined

				transaction = {
					type: 0x76,
					from,
					calls: [
						{
							to,
							value,
							input: data,
						},
					],
					nonceKey: 0n, // Default to protocol nonce
				}
			}
		}

		if (!transaction) {
			throw new Error('Transaction not defined')
		}

		if (!transaction.from) {
			throw new Error('From address is required for gas estimation')
		}

		console.log(chalk.blue('\nEstimating Gas...\n'))

		const gasEstimate = await estimateGas(transaction)

		console.log(chalk.green(`Estimated gas: ${gasEstimate.toString()}`))
		console.log(chalk.cyan(`Estimated gas (hex): 0x${gasEstimate.toString(16)}`))

		// Calculate estimated cost (if gas price is provided)
		if (transaction.gasPrice) {
			const cost = gasEstimate * transaction.gasPrice
			console.log(chalk.cyan(`Estimated cost: ${cost.toString()} wei`))
		} else if (transaction.maxFeePerGas) {
			const cost = gasEstimate * transaction.maxFeePerGas
			console.log(chalk.cyan(`Estimated cost (max): ${cost.toString()} wei`))
		}
	} catch (error) {
		console.error(chalk.red(`\nError: ${error instanceof Error ? error.message : 'Unknown error'}`))
		process.exit(1)
	}
}
