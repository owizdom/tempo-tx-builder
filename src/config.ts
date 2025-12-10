import { createClient, http, publicActions, type Address, type PublicClient } from 'viem'
import { tempoTestnet } from 'tempo.ts/chains'
import { tempoActions } from 'tempo.ts/viem'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { readFileSync, existsSync } from 'fs'

// Simple env loader (no external dependency)
function loadEnv() {
	const envPath = join(dirname(fileURLToPath(import.meta.url)), '../.env')
	if (existsSync(envPath)) {
		const content = readFileSync(envPath, 'utf-8')
		for (const line of content.split('\n')) {
			const trimmed = line.trim()
			if (trimmed && !trimmed.startsWith('#')) {
				const [key, ...valueParts] = trimmed.split('=')
				if (key && valueParts.length > 0) {
					process.env[key.trim()] = valueParts.join('=').trim()
				}
			}
		}
	}
}

loadEnv()

const RPC_URL = process.env.RPC_URL || 'https://tempo-testnet.g.alchemy.com/v2/AFjoSzKjqv6Eq53OsF2xe'
const FEE_PAYER_URL = process.env.FEE_PAYER_URL || 'https://sponsor.testnet.tempo.xyz'

export const chain: any = tempoTestnet({ feeToken: 1n })

export const publicClient: PublicClient<any, any> = createClient({
	chain,
	transport: http(RPC_URL),
})
	.extend(publicActions)
	.extend(tempoActions()) as any

export const config: {
	rpcUrl: string
	feePayerUrl: string
	chain: any
} = {
	rpcUrl: RPC_URL,
	feePayerUrl: FEE_PAYER_URL,
	chain,
}

export type { Address }
