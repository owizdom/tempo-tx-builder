import chalk from 'chalk'
import inquirer from 'inquirer'
import { readFileSync, writeFileSync } from 'fs'
import { buildTransactionInteractively } from '../utils/builder.js'
import { simulateTransaction, estimateGas } from '../utils/simulator.js'
import { promptConfirm } from '../utils/prompts.js'
import type { Flow, FlowStep, Transaction } from '../types.js'

export async function flowCommand(options: { file?: string; execute?: boolean }) {
	try {
		let flow: Flow

		if (options.file) {
			// Load flow from file
			const fileContent = readFileSync(options.file, 'utf-8')
			flow = JSON.parse(fileContent)
		} else {
			// Build flow interactively
			console.log(chalk.blue('\nBuilding Multi-Step Transaction Flow\n'))

			const { name } = await inquirer.prompt<{ name: string }>([
				{
					type: 'input',
					name: 'name',
					message: 'Flow name:',
					default: 'My Transaction Flow',
				},
			])

			const { description } = await inquirer.prompt<{ description: string }>([
				{
					type: 'input',
					name: 'description',
					message: 'Flow description (optional):',
				},
			])

			flow = {
				name,
				description: description || undefined,
				steps: [],
			}

			let addMore = true
			while (addMore) {
				console.log(chalk.blue(`\nStep ${flow.steps.length + 1}\n`))

				const { stepName } = await inquirer.prompt<{ stepName: string }>([
					{
						type: 'input',
						name: 'stepName',
						message: 'Step name:',
						default: `Step ${flow.steps.length + 1}`,
					},
				])

				const transaction = await buildTransactionInteractively()

				const step: FlowStep = {
					id: `step-${flow.steps.length + 1}`,
					name: stepName,
					transaction,
				}

				// Ask about dependencies
				if (flow.steps.length > 0) {
					const hasDeps = await promptConfirm('Does this step depend on previous steps?')
					if (hasDeps) {
						const { deps } = await inquirer.prompt<{ deps: string[] }>([
							{
								type: 'checkbox',
								name: 'deps',
								message: 'Select dependent steps:',
								choices: flow.steps.map((s) => ({ name: s.name, value: s.id })),
							},
						])
						step.dependencies = deps
					}
				}

				flow.steps.push(step)

				addMore = await promptConfirm('Add another step?')
			}

			// Save flow
			const saveFlow = await promptConfirm('Save flow to file?')
			if (saveFlow) {
				const { filename } = await inquirer.prompt<{ filename: string }>([
					{
						type: 'input',
						name: 'filename',
						message: 'Filename:',
						default: 'flow.json',
					},
				])
				const flowJson = JSON.stringify(
					flow,
					(_, v) => (typeof v === 'bigint' ? v.toString() : v),
					2,
				)
				writeFileSync(filename, flowJson)
				console.log(chalk.green(`\nFlow saved to ${filename}`))
			}
		}

		// Display flow summary
		console.log(chalk.blue('\nFlow Summary:\n'))
		console.log(chalk.cyan(`Name: ${flow.name}`))
		if (flow.description) {
			console.log(chalk.gray(`Description: ${flow.description}`))
		}
		console.log(chalk.cyan(`Steps: ${flow.steps.length}\n`))

		flow.steps.forEach((step, index) => {
			console.log(chalk.yellow(`${index + 1}. ${step.name} (${step.id})`))
			if (step.dependencies && step.dependencies.length > 0) {
				console.log(chalk.gray(`   Depends on: ${step.dependencies.join(', ')}`))
			}
		})

		// Simulate each step
		console.log(chalk.blue('\nSimulating Flow Steps...\n'))

		for (const step of flow.steps) {
			console.log(chalk.blue(`\n${step.name}\n`))

			try {
				// Estimate gas
				if (step.transaction.from) {
					const gasEstimate = await estimateGas(step.transaction)
					step.transaction.gas = gasEstimate
					console.log(chalk.green(`Estimated gas: ${gasEstimate.toString()}`))
				}

				// Simulate
				const result = await simulateTransaction(step.transaction)

				if (result.success) {
					console.log(chalk.green('Simulation successful'))
					if (result.returnData) {
						console.log(chalk.gray(`   Return data: ${result.returnData.slice(0, 66)}...`))
					}
				} else {
					console.log(chalk.red('Simulation failed'))
					if (result.error) {
						console.log(chalk.red(`   Error: ${result.error}`))
					}
				}
			} catch (error) {
				console.log(
					chalk.red(
						`Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
					),
				)
			}
		}

		// Execute if requested
		if (options.execute) {
			console.log(chalk.yellow('\nExecution not yet implemented'))
			console.log(chalk.gray('Use the explorer or a wallet to execute these transactions'))
		}
	} catch (error) {
		console.error(chalk.red(`\nError: ${error instanceof Error ? error.message : 'Unknown error'}`))
		process.exit(1)
	}
}
