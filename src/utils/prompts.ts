import inquirer, { type Question } from 'inquirer'
import chalk from 'chalk'
import type { Address } from 'viem'
import { isAddress } from 'viem'

export async function promptAddress(message: string, required = true): Promise<Address> {
	const { address } = await inquirer.prompt<{ address: string }>([
		{
			type: 'input',
			name: 'address',
			message,
			validate: (input: string) => {
				if (!required && !input) return true
				if (!isAddress(input)) {
					return chalk.red('Invalid address format. Must be a valid Ethereum address.')
				}
				return true
			},
		},
	])
	return address as Address
}

export async function promptHex(message: string, required = false): Promise<string> {
	const { hex } = await inquirer.prompt<{ hex: string }>([
		{
			type: 'input',
			name: 'hex',
			message,
			validate: (input: string) => {
				if (!required && !input) return true
				if (!input.startsWith('0x')) {
					return chalk.red('Must start with 0x')
				}
				if (!/^0x[0-9a-fA-F]*$/.test(input)) {
					return chalk.red('Invalid hex string')
				}
				return true
			},
		},
	])
	return hex
}

export async function promptBigInt(message: string, required = false): Promise<bigint | undefined> {
	const { value } = await inquirer.prompt<{ value: string }>([
		{
			type: 'input',
			name: 'value',
			message,
			validate: (input: string) => {
				if (!required && !input) return true
				try {
					BigInt(input)
					return true
				} catch {
					return chalk.red('Invalid number format')
				}
			},
		},
	])
	return value ? BigInt(value) : undefined
}

export async function promptNumber(message: string, required = false): Promise<number | undefined> {
	const { value } = await inquirer.prompt<{ value: string }>([
		{
			type: 'input',
			name: 'value',
			message,
			validate: (input: string) => {
				if (!required && !input) return true
				const num = Number(input)
				if (isNaN(num)) {
					return chalk.red('Invalid number format')
				}
				return true
			},
		},
	])
	return value ? Number(value) : undefined
}

export async function promptConfirm(message: string): Promise<boolean> {
	const { confirmed } = await inquirer.prompt<{ confirmed: boolean }>([
		{
			type: 'confirm',
			name: 'confirmed',
			message,
			default: false,
		},
	])
	return confirmed
}

export async function promptSelect<T>(
	message: string,
	choices: Array<{ name: string; value: T }>,
): Promise<T> {
	const { selected } = await inquirer.prompt<{ selected: T }>([
		{
			type: 'list',
			name: 'selected',
			message,
			choices: choices.map((c) => c.name),
			filter: (val: string) => {
				const choice = choices.find((c) => c.name === val)
				return choice?.value
			},
		},
	])
	return selected
}
