import chalk from 'chalk'
import { writeFileSync } from 'fs'
import { buildTransactionInteractively } from '../utils/builder.js'
import { estimateGas } from '../utils/simulator.js'
import { publicClient } from '../config.js'

export async function buildCommand(options: { output?: string; nonce?: string }) {
	try {
		const transaction = await buildTransactionInteractively()

		// Estimate gas if not provided
		if (!transaction.gas && transaction.from) {
			console.log(chalk.blue('\nEstimating gas...'))
			try {
				const estimatedGas = await estimateGas(transaction)
				transaction.gas = estimatedGas
				console.log(chalk.green(`Estimated gas: ${estimatedGas.toString()}`))
			} catch (error) {
				console.log(
					chalk.yellow(
						`Could not estimate gas: ${error instanceof Error ? error.message : 'Unknown error'}`,
					),
				)
			}
		}

		// Display transaction summary
		console.log(chalk.blue('\nTransaction Summary:\n'))
		console.log(JSON.stringify(transaction, (_, v) => (typeof v === 'bigint' ? v.toString() : v), 2))

		// Save to file if requested
		if (options.output) {
			const txJson = JSON.stringify(
				transaction,
				(_, v) => (typeof v === 'bigint' ? v.toString() : v),
				2,
			)
			writeFileSync(options.output, txJson)
			console.log(chalk.green(`\nTransaction saved to ${options.output}`))
		}
	} catch (error) {
		console.error(chalk.red(`\nError: ${error instanceof Error ? error.message : 'Unknown error'}`))
		process.exit(1)
	}
}
