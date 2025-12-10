#!/usr/bin/env node

import { Command } from 'commander'
import chalk from 'chalk'
import inquirer from 'inquirer'
import { buildCommand } from './commands/build.js'
import { simulateCommand } from './commands/simulate.js'
import { estimateCommand } from './commands/estimate.js'
import { flowCommand } from './commands/flow.js'

const program = new Command()

program
	.name('tx-builder')
	.description('Tempo Transaction Builder & Simulator CLI')
	.version('1.0.0')

// Keep subcommands for direct usage
program
	.command('build')
	.description('Build a transaction interactively')
	.option('-o, --output <file>', 'Save transaction to file')
	.option('-n, --nonce <number>', 'Set nonce manually')
	.action(buildCommand)

program
	.command('simulate')
	.description('Simulate a transaction before execution')
	.option('-f, --file <file>', 'Load transaction from file')
	.option('-a, --address <address>', 'From address')
	.option('-t, --to <address>', 'To address')
	.option('-d, --data <hex>', 'Transaction data')
	.option('-v, --value <value>', 'Value in wei')
	.action(simulateCommand)

program
	.command('estimate')
	.description('Estimate gas for a transaction')
	.option('-f, --file <file>', 'Load transaction from file')
	.option('-a, --address <address>', 'From address')
	.option('-t, --to <address>', 'To address')
	.option('-d, --data <hex>', 'Transaction data')
	.option('-v, --value <value>', 'Value in wei')
	.action(estimateCommand)

program
	.command('flow')
	.description('Build and execute multi-step transaction flows')
	.option('-f, --file <file>', 'Load flow from file')
	.option('-e, --execute', 'Execute the flow after building')
	.action(flowCommand)

// Main menu when no command is provided
async function showMainMenu() {
	console.log(chalk.blue('\n=== Tempo Transaction Builder & Simulator ===\n'))

	const { action } = await inquirer.prompt<{ action: string }>([
		{
			type: 'list',
			name: 'action',
			message: 'What would you like to do?',
			choices: [
				{
					name: 'Build Transaction - Create a new transaction interactively',
					value: 'build',
				},
				{
					name: 'Simulate Transaction - Test a transaction before execution',
					value: 'simulate',
				},
				{
					name: 'Estimate Gas - Get gas estimate for a transaction',
					value: 'estimate',
				},
				{
					name: 'Multi-Step Flow - Build complex transaction sequences',
					value: 'flow',
				},
				{
					name: 'Exit',
					value: 'exit',
				},
			],
		},
	])

	if (action === 'exit') {
		console.log(chalk.gray('\nGoodbye!\n'))
		process.exit(0)
	}

	// Handle the selected action
	switch (action) {
		case 'build': {
			await buildCommand({})
			break
		}
		case 'simulate': {
			await simulateCommand({})
			break
		}
		case 'estimate': {
			await estimateCommand({})
			break
		}
		case 'flow': {
			await flowCommand({})
			break
		}
	}

	// Ask if user wants to do something else
	const { again } = await inquirer.prompt<{ again: boolean }>([
		{
			type: 'confirm',
			name: 'again',
			message: 'Would you like to do something else?',
			default: true,
		},
	])

	if (again) {
		await showMainMenu()
	} else {
		console.log(chalk.gray('\nGoodbye!\n'))
	}
}

// If no arguments provided, show main menu
if (process.argv.length === 2) {
	showMainMenu().catch((error) => {
		console.error(chalk.red(`\nError: ${error instanceof Error ? error.message : 'Unknown error'}`))
		process.exit(1)
	})
} else {
	program.parse()
}
