import { encodeFunctionData } from 'viem'
import type { Address } from 'viem'

// Known TIP-20 token addresses
export const TIP20_TOKENS = {
	AlphaUSD: {
		name: 'AlphaUSD',
		symbol: 'AUSD',
		address: '0x20c0000000000000000000000000000000000001' as Address,
		decimals: 6,
	},
	BetaUSD: {
		name: 'BetaUSD',
		symbol: 'BUSD',
		address: '0x20c0000000000000000000000000000000000002' as Address,
		decimals: 6,
	},
	ThetaUSD: {
		name: 'ThetaUSD',
		symbol: 'TUSD',
		address: '0x20c0000000000000000000000000000000000003' as Address,
		decimals: 6,
	},
} as const

// TIP-20 ABI for transfer function
const TIP20_ABI = [
	{
		type: 'function',
		name: 'transfer',
		inputs: [
			{ name: 'to', type: 'address' },
			{ name: 'amount', type: 'uint256' },
		],
		outputs: [{ name: '', type: 'bool' }],
		stateMutability: 'nonpayable',
	},
] as const

/**
 * Generate calldata for a TIP-20 token transfer
 */
export function encodeTransferCalldata(
	to: Address,
	amount: bigint,
): `0x${string}` {
	return encodeFunctionData({
		abi: TIP20_ABI,
		functionName: 'transfer',
		args: [to, amount],
	})
}

/**
 * Calculate amount in token units (considering decimals)
 */
export function calculateTokenAmount(amount: string, decimals: number): bigint {
	const parts = amount.split('.')
	const wholePart = parts[0] || '0'
	const decimalPart = parts[1] || ''

	// Pad or truncate decimal part to match token decimals
	let adjustedDecimal = decimalPart.padEnd(decimals, '0').slice(0, decimals)

	return BigInt(wholePart + adjustedDecimal)
}
