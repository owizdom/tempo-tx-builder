import type { Address, Hex } from 'viem'

// Call structure for Tempo transaction type 0x76
export interface Call {
	to?: Address // Can be undefined for CREATE transactions
	value?: bigint
	input?: Hex // Calldata for the call
}

export interface Transaction {
	// Transaction type (0x76 for new Tempo transaction type)
	type?: 0x76
	
	// New Tempo 0x76 transaction fields
	calls?: Call[] // Batch of calls to execute atomically (replaces single to/data/value)
	nonceKey?: bigint // 2D nonce key (0 = protocol nonce, >0 = user nonces)
	feeToken?: Address // Optional fee token preference
	
	// Legacy fields (for backward compatibility, but should use calls for 0x76)
	from?: Address
	to?: Address
	value?: bigint
	data?: Hex
	
	// Gas settings
	gas?: bigint // gas_limit
	gasPrice?: bigint // Legacy gas pricing
	maxFeePerGas?: bigint
	maxPriorityFeePerGas?: bigint
	
	// Nonce (protocol nonce when nonceKey is 0 or undefined)
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
