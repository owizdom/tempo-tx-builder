# Transaction Builder & Simulator CLI

A  CLI tool for building, simulating, and estimating gas for Tempo blockchain transactions.

## Features

- **Interactive Transaction Builder** - Build transactions step-by-step with prompts
- **TIP-20 Token Transfer Support** - Easy token transfers with automatic calldata generation
- **Transaction Simulation** - Test transactions before execution
- **Gas Estimation** - Accurate gas estimates for your transactions
- **Multi-Step Flows** - Build complex transaction sequences with dependencies
- **Save/Load** - Save transactions and flows to JSON files
- **Tempo EVM Compatible** - Aligned with Tempo's EVM differences (no native value transfers)

## Installation

```bash
npm install
npm run build
```

Or use with `tsx` for development:

```bash
npm run dev
```

## Configuration

Copy `.env.example` to `.env` and configure:

```bash
RPC_URL=https://tempo-testnet.g.alchemy.com/v2/YOUR_KEY
FEE_PAYER_URL=https://sponsor.testnet.tempo.xyz
```

## Usage

### Main Menu (Recommended)

Simply run the CLI without any arguments to see the interactive main menu:

```bash
npm start
# or
node dist/cli.js
```

This will show you a menu where you can choose:
- Build Transaction
- Simulate Transaction
- Estimate Gas
- Multi-Step Flow

### Direct Commands

You can also use commands directly:

**Build a transaction:**
```bash
npm start build
# or: node dist/cli.js build
```

**Simulate a transaction:**
```bash
npm start simulate
# or: node dist/cli.js simulate
```

**Estimate gas:**
```bash
npm start estimate
# or: node dist/cli.js estimate
```

**Multi-step flow:**
```bash
npm start flow
# or: node dist/cli.js flow
```

### Command Line Options

For advanced usage, you can pass options directly:

```bash
# Build and save to file
node dist/cli.js build --output tx.json

# Simulate from file
node dist/cli.js simulate --file tx.json

# Estimate gas with parameters
node dist/cli.js estimate --address 0x... --to 0x... --data 0x...
```

## Transaction Format

Transactions are saved as JSON with bigint values as strings:

```json
{
  "from": "0x...",
  "to": "0x...",
  "value": "1000000000000000000",
  "data": "0x...",
  "gas": "21000",
  "nonce": 0
}
```

## Flow Format

Flows support multiple steps with dependencies:

```json
{
  "name": "My Flow",
  "description": "A multi-step transaction flow",
  "steps": [
    {
      "id": "step-1",
      "name": "Approve Token",
      "transaction": { ... },
      "dependencies": []
    },
    {
      "id": "step-2",
      "name": "Swap Token",
      "transaction": { ... },
      "dependencies": ["step-1"]
    }
  ]
}
```

## Examples

### TIP-20 Token Transfer (Recommended)

The easiest way to send tokens on Tempo:

```bash
npm start
# Select: Build Transaction
# Select: TIP-20 Token Transfer
# Follow prompts to select token, recipient, and amount
```

### Build and Simulate a Transaction

```bash
# Build and save
npm start build
# When prompted, choose TIP-20 Token Transfer
# Save to file when done

# Simulate from file
npm start simulate
# Select: File
# Enter: test-tx.json
```

### Estimate Gas for Token Transfer

```bash
npm start estimate
# Select: TIP-20 Token Transfer
# Enter: From address, token, recipient, amount
```

### Create a Multi-Step Flow

```bash
npm start flow

# This will prompt you to:
# 1. Name your flow
# 2. Add steps (each step can be a TIP-20 transfer or contract call)
# 3. Set dependencies between steps
# 4. Save to file
```

### Command Line Examples

```bash
# Build and save to file
node dist/cli.js build --output transfer.json

# Simulate from file
node dist/cli.js simulate --file transfer.json

# Estimate gas with parameters
node dist/cli.js estimate \
  --address 0x01526673FDe53eb8dfB549535a2a88F9a1b99365 \
  --to 0x20c0000000000000000000000000000000000001 \
  --data 0xa9059cbb0000000000000000000000000147779caf56f5c61d7bd3a96a67e3c8df1c01c4000000000000000000000000000000000000000000000000000000000005f5e100
```

## Testing

For a complete testing guide with exact inputs for every option, see [TESTING.md](./TESTING.md).

### Quick Start Testing

1. **Build the project:**
   ```bash
   npm install
   npm run build
   ```

2. **Run the main menu:**
   ```bash
   npm start
   ```

3. **Quick test - TIP-20 Token Transfer:**
   - Select "Build Transaction"
   - Choose "TIP-20 Token Transfer"
   - Select "AlphaUSD"
   - Enter recipient: `0x0147779Caf56F5c61d7Bd3a96a67E3c8df1C01c4`
   - Enter amount: `100`

### Complete Testing Guide

See [TESTING.md](./TESTING.md) for detailed test cases covering:
- All transaction types (TIP-20 Transfer, Contract Call, Custom)
- All simulation options (File, TIP-20 Transfer, Manual)
- All gas estimation options
- Multi-step flows
- Command line options
- Example calldata and addresses

### Test Addresses

**Example Addresses:**
- From: `0x01526673FDe53eb8dfB549535a2a88F9a1b99365`
- To: `0x0147779Caf56F5c61d7Bd3a96a67E3c8df1C01c4`

**TIP-20 Tokens:**
- AlphaUSD: `0x20c0000000000000000000000000000000000001`
- BetaUSD: `0x20c0000000000000000000000000000000000002`
- ThetaUSD: `0x20c0000000000000000000000000000000000003`

### Example Calldata

**Transfer 100 tokens:**
```
0xa9059cbb0000000000000000000000000147779caf56f5c61d7bd3a96a67e3c8df1c01c4000000000000000000000000000000000000000000000000000000000005f5e100
```

**Check balance:**
```
0x70a0823100000000000000000000000001526673fde53eb8dfb549535a2a88f9a1b99365
```

### Important: Tempo EVM Differences

Tempo has some key differences from standard Ethereum:

- **No native token** - BALANCE/SELFBALANCE always return 0
- **CALLVALUE always returns 0** - No native value transfers
- **Use TIP-20 tokens** - For transfers, use TIP-20 tokens (AlphaUSD, BetaUSD, ThetaUSD)
- **Fees in TIP-20 tokens** - Fees are paid in TIP-20 tokens, not native ETH

The CLI handles these differences automatically when using the TIP-20 Token Transfer option.

For more details, see: https://docs.tempo.xyz/quickstart/evm-compatibility

### Development Mode

For development with auto-reload:

```bash
npm run dev build
```

This will watch for changes and automatically rebuild.

## Development

```bash
# Type check
npm run check:types

# Format code
npm run check

# Build
npm run build

# Run in development mode
npm run dev
```

## License

MIT
