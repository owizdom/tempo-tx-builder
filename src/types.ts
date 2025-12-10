import type { Address, Hex } from 'viem'

export interface Transaction {
	from?: Address
	to?: Address
	value?: bigint
	data?: Hex
	gas?: bigint
	gasPrice?: bigint
	maxFeePerGas?: bigint
	maxPriorityFeePerGas?: bigint
	nonce?: number
	chainId?: number
}

export interface TransactionResult {
	success: boolean
	gasUsed?: bigint
	returnData?: Hex
	error?: string
	logs?: Array<{
		address: Address
		topics: Hex[]
		data: Hex
	}>
}

export interface FlowStep {
	id: string
	name: string
	transaction: Transaction
	dependencies?: string[] // IDs of steps that must complete before this one
}

export interface Flow {
	name: string
	description?: string
	steps: FlowStep[]
}

export interface SimulationResult {
	transaction: Transaction
	result: TransactionResult
	gasEstimate: bigint
	success: boolean
}
