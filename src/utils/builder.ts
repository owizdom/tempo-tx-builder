import inquirer from 'inquirer'
import chalk from 'chalk'
import type { Address } from 'viem'
import { publicClient } from '../config.js'
import type { Transaction } from '../types.js'
import {
	promptAddress,
	promptHex,
	promptBigInt,
	promptNumber,
	promptConfirm,
	promptSelect,
} from './prompts.js'
import { TIP20_TOKENS, encodeTransferCalldata, calculateTokenAmount } from './tip20.js'

export async function buildTransactionInteractively(
	fromAddress?: string,
): Promise<Transaction> {
	console.log(chalk.blue('\nBuilding Transaction\n'))

	const transaction: Transaction = {
		type: 0x76, // New Tempo transaction type
		calls: [], // Will be populated with calls
		nonceKey: 0n, // Default to protocol nonce (key 0)
	}

	// From address
	if (fromAddress) {
		transaction.from = fromAddress as `0x${string}`
		console.log(chalk.gray(`From: ${fromAddress}`))
	} else {
		transaction.from = await promptAddress('From address:')
	}

	// Transaction type
	const { txType } = await inquirer.prompt<{ txType: 'token-transfer' | 'contract-call' | 'other' }>([
		{
			type: 'list',
			name: 'txType',
			message: 'Transaction type:',
			choices: [
				{ name: 'TIP-20 Token Transfer', value: 'token-transfer' },
				{ name: 'Contract Call (with calldata)', value: 'contract-call' },
				{ name: 'Other / Custom', value: 'other' },
			],
		},
	])

	if (txType === 'token-transfer') {
		// TIP-20 Token Transfer
		console.log(chalk.blue('\nTIP-20 Token Transfer\n'))
		console.log(chalk.gray('Note: Tempo uses TIP-20 tokens instead of native value transfers.\n'))

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
		transaction.calls = [
			{
				to: tokenChoice.address,
				value: 0n, // No native value
				input: encodeTransferCalldata(recipient, amount),
			},
		]

		console.log(chalk.green(`\nGenerated transfer calldata for ${amountInput} ${tokenChoice.symbol} to ${recipient}`))
		console.log(chalk.gray(`Token contract: ${tokenChoice.address}`))
		console.log(chalk.gray(`Calldata: ${transaction.calls[0].input}`))
	} else {
		// Regular transaction building using new calls format
		// To address
		const hasTo = await promptConfirm('Does this transaction have a recipient?')
		let toAddress: Address | undefined
		if (hasTo) {
			toAddress = await promptAddress('To address:')
		}

		// Value (only for contract calls, not transfers)
		let value: bigint | undefined = undefined
		if (txType === 'contract-call') {
			const hasValue = await promptConfirm('Does this transaction send native value?')
			if (hasValue) {
				console.log(chalk.yellow('\nNote: Tempo may not support native value transfers. Use TIP-20 tokens for transfers instead.'))
				const valueStr = await promptBigInt('Value (in wei):')
				if (valueStr !== undefined && valueStr > 0n) {
					// Check if sending to zero address - not allowed on Tempo
					if (toAddress === '0x0000000000000000000000000000000000000000') {
						console.log(chalk.yellow('\nWarning: Sending value to zero address is not allowed on Tempo. Value will be set to 0.'))
						value = 0n
					} else {
						value = valueStr
					}
				}
			}
		}

		// Data
		let data: `0x${string}` | undefined = undefined
		if (txType === 'contract-call' || txType === 'other') {
			const hasData = await promptConfirm('Does this transaction include calldata?')
			if (hasData) {
				data = await promptHex('Calldata (hex):', true) as `0x${string}`
			}
		}

		// Build call using new format
		transaction.calls = [
			{
				to: toAddress,
				value: value,
				input: data,
			},
		]
	}

	// Get nonce if from address is provided
	if (transaction.from) {
		try {
			const nonce = await publicClient.getTransactionCount({
				address: transaction.from,
			})
			console.log(chalk.gray(`\nCurrent nonce: ${nonce}`))
			const useCustomNonce = await promptConfirm('Use custom nonce?')
			if (useCustomNonce) {
				const customNonce = await promptNumber('Nonce:', true)
				if (customNonce !== undefined) {
					transaction.nonce = customNonce
				}
			} else {
				transaction.nonce = Number(nonce)
			}
		} catch (error) {
			console.log(chalk.yellow('Could not fetch nonce automatically'))
		}
	}

	// Nonce key (for parallelizable nonces)
	const useCustomNonceKey = await promptConfirm('Use custom nonce key? (0 = protocol nonce, >0 = user nonce)')
	if (useCustomNonceKey) {
		const nonceKey = await promptBigInt('Nonce key:', true)
		if (nonceKey !== undefined) {
			transaction.nonceKey = nonceKey
		}
	}

	// Gas settings
	const customizeGas = await promptConfirm('Customize gas settings?')
	if (customizeGas) {
		// Tempo 0x76 transaction type uses EIP-1559 style gas pricing
		const maxFeePerGas = await promptBigInt('Max fee per gas (wei):', true)
		const maxPriorityFeePerGas = await promptBigInt(
			'Max priority fee per gas (wei):',
			true,
		)
		if (maxFeePerGas !== undefined) {
			transaction.maxFeePerGas = maxFeePerGas
		}
		if (maxPriorityFeePerGas !== undefined) {
			transaction.maxPriorityFeePerGas = maxPriorityFeePerGas
		}

		const gasLimit = await promptBigInt('Gas limit:', true)
		if (gasLimit !== undefined) {
			transaction.gas = gasLimit
		}
	}

	return transaction
}
