import type { Address, Hex } from 'viem'
import { publicClient } from '../config.js'
import type { Transaction, TransactionResult } from '../types.js'

async function simulateTransactionInternal(
	transaction: Transaction,
): Promise<TransactionResult> {
	// Use call to simulate the transaction
	// Tempo chain uses different parameter structure
	// Support new 0x76 format with calls array, fallback to legacy format
	let callParams: any
	
	if (transaction.calls && transaction.calls.length > 0) {
		// New 0x76 format: use first call (for simulation, we simulate the first call)
		const firstCall = transaction.calls[0]
		callParams = {
			to: firstCall.to,
			data: firstCall.input,
			value: firstCall.value,
		}
	} else {
		// Legacy format: use direct to/data/value
		callParams = {
			to: transaction.to,
			data: transaction.data,
			value: transaction.value,
		}
	}

	// Add account if from is provided (some chains support this)
	if (transaction.from) {
		callParams.account = transaction.from
	}

	const result = await publicClient.call(callParams)

	return {
		success: true,
		returnData: result.data || undefined,
		// Gas is not available in call result, estimate separately if needed
	}
}

export async function simulateTransaction(
	transaction: Transaction,
): Promise<TransactionResult> {
	try {
		// Validate: Can't send value to zero address on Tempo
		// Check both new calls format and legacy format
		if (transaction.calls && transaction.calls.length > 0) {
			for (const call of transaction.calls) {
				if (
					call.to === '0x0000000000000000000000000000000000000000' &&
					call.value &&
					call.value > 0n
				) {
					return {
						success: false,
						error: 'Sending value to zero address is not allowed on Tempo',
					}
				}
			}
		} else if (
			transaction.to === '0x0000000000000000000000000000000000000000' &&
			transaction.value &&
			transaction.value > 0n
		) {
			return {
				success: false,
				error: 'Sending value to zero address is not allowed on Tempo',
			}
		}

		// Try to simulate, but catch the error and provide helpful message
		try {
			return await simulateTransactionInternal(transaction)
		} catch (error: unknown) {
			const errorMessage = error instanceof Error ? error.message : 'Unknown error'
			if (errorMessage.includes('value transfer not allowed')) {
				return {
					success: false,
					error: 'Tempo does not support native value transfers. Use TIP-20 tokens for transfers instead.',
				}
			}
			throw error
		}
	} catch (error: unknown) {
		const errorMessage =
			error instanceof Error ? error.message : 'Unknown simulation error'
		return {
			success: false,
			error: errorMessage,
		}
	}
}

async function estimateGasInternal(transaction: Transaction): Promise<bigint> {
	// For Tempo, construct estimate parameters
	// Support new 0x76 format with calls array, fallback to legacy format
	let estimateParams: any
	
	if (transaction.calls && transaction.calls.length > 0) {
		// New 0x76 format: use first call (for estimation, we estimate the first call)
		const firstCall = transaction.calls[0]
		estimateParams = {
			to: firstCall.to,
			data: firstCall.input,
			value: firstCall.value,
		}
	} else {
		// Legacy format: use direct to/data/value
		estimateParams = {
			to: transaction.to,
			data: transaction.data,
			value: transaction.value,
		}
	}

	// Add account if from is provided
	if (transaction.from) {
		estimateParams.account = transaction.from
	}

	const gas = await publicClient.estimateGas(estimateParams)
	return gas
}

export async function estimateGas(transaction: Transaction): Promise<bigint> {
	try {
		// Validate: Can't send value to zero address on Tempo
		// Check both new calls format and legacy format
		if (transaction.calls && transaction.calls.length > 0) {
			for (const call of transaction.calls) {
				if (
					call.to === '0x0000000000000000000000000000000000000000' &&
					call.value &&
					call.value > 0n
				) {
					throw new Error('Sending value to zero address is not allowed on Tempo')
				}
			}
		} else if (
			transaction.to === '0x0000000000000000000000000000000000000000' &&
			transaction.value &&
			transaction.value > 0n
		) {
			throw new Error('Sending value to zero address is not allowed on Tempo')
		}

		// Try to estimate, but catch the error and provide helpful message
		try {
			return await estimateGasInternal(transaction)
		} catch (error: unknown) {
			const errorMessage = error instanceof Error ? error.message : 'Unknown error'
			if (errorMessage.includes('value transfer not allowed')) {
				throw new Error(
					'Tempo does not support native value transfers. Use TIP-20 tokens for transfers instead.',
				)
			}
			throw new Error(`Gas estimation failed: ${errorMessage}`)
		}
	} catch (error: unknown) {
		const errorMessage = error instanceof Error ? error.message : 'Unknown error'
		throw new Error(`Gas estimation failed: ${errorMessage}`)
	}
}
