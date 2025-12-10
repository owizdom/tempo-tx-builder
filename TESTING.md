# Complete Testing Guide

This guide provides exact inputs for testing every option in the Transaction Builder & Simulator CLI.

## Test Addresses & Contracts

**Test Addresses:**
- From Address: `0x01526673FDe53eb8dfB549535a2a88F9a1b99365`
- Recipient Address: `0x0147779Caf56F5c61d7Bd3a96a67E3c8df1C01c4`

**TIP-20 Token Contracts:**
- AlphaUSD: `0x20c0000000000000000000000000000000000001`
- BetaUSD: `0x20c0000000000000000000000000000000000002`
- ThetaUSD: `0x20c0000000000000000000000000000000000003`

**Example Calldata:**
- `transfer(address,uint256)` selector: `0xa9059cbb`
- Example full calldata: `0xa9059cbb0000000000000000000000000147779caf56f5c61d7bd3a96a67e3c8df1c01c40000000000000000000000000000000000000000000000000000000000000064`
  - This transfers 100 tokens (0x64 = 100) to `0x0147779Caf56F5c61d7Bd3a96a67E3c8df1C01c4`

---

## Test 1: Main Menu → Build Transaction → TIP-20 Token Transfer

**Command:** `npm start`

**Inputs:**
1. `What would you like to do?` → **Build Transaction**
2. `From address:` → `0x01526673FDe53eb8dfB549535a2a88F9a1b99365`
3. `Transaction type:` → **TIP-20 Token Transfer (Recommended for sending tokens)**
4. `Select token:` → **AlphaUSD (AUSD) - 0x20c0000000000000000000000000000000000001**
5. `Recipient address:` → `0x0147779Caf56F5c61d7Bd3a96a67E3c8df1C01c4`
6. `Amount (in AUSD, e.g., 100 or 100.5):` → `100`
7. `Current nonce: X` → **Use default (press Enter or type N)**
8. `Use custom nonce?` → **No**
9. `Customize gas settings?` → **No**
10. `Would you like to do something else?` → **No** (or Yes to continue testing)

**Expected Result:** Transaction built with auto-generated calldata for transferring 100 AlphaUSD tokens.

---

## Test 2: Main Menu → Build Transaction → Contract Call

**Command:** `npm start`

**Inputs:**
1. `What would you like to do?` → **Build Transaction**
2. `From address:` → `0x01526673FDe53eb8dfB549535a2a88F9a1b99365`
3. `Transaction type:` → **Contract Call (Call a smart contract function)**
4. `Contract address:` → `0x20c0000000000000000000000000000000000001` (AlphaUSD)
5. `Do you have the calldata ready?` → **Yes**
6. `Calldata (hex, e.g., 0xa9059cbb...):` → `0xa9059cbb0000000000000000000000000147779caf56f5c61d7bd3a96a67e3c8df1c01c40000000000000000000000000000000000000000000000000000000000000064`
7. `Current nonce: X` → **Use default**
8. `Use custom nonce?` → **No**
9. `Customize gas settings?` → **No**

**Expected Result:** Transaction built for calling a contract function.

---

## Test 3: Main Menu → Build Transaction → Other/Custom

**Command:** `npm start`

**Inputs:**
1. `What would you like to do?` → **Build Transaction**
2. `From address:` → `0x01526673FDe53eb8dfB549535a2a88F9a1b99365`
3. `Transaction type:` → **Other / Custom (Advanced)**
4. `Does this transaction have a recipient?` → **Yes**
5. `To address:` → `0x20c0000000000000000000000000000000000001`
6. `Does this transaction send native value?` → **No** (or Yes, then Continue anyway, then enter `0`)
7. `Does this transaction include calldata?` → **Yes**
8. `Calldata (hex):` → `0xa9059cbb0000000000000000000000000147779caf56f5c61d7bd3a96a67e3c8df1c01c40000000000000000000000000000000000000000000000000000000000000064`
9. `Current nonce: X` → **Use default**
10. `Use custom nonce?` → **No**
11. `Customize gas settings?` → **No**

**Expected Result:** Custom transaction built.

---

## Test 4: Main Menu → Simulate Transaction → TIP-20 Token Transfer

**Command:** `npm start`

**Inputs:**
1. `What would you like to do?` → **Simulate Transaction**
2. `Load transaction from:` → **TIP-20 Token Transfer (Easiest)**
3. `From address:` → `0x01526673FDe53eb8dfB549535a2a88F9a1b99365`
4. `Select token:` → **AlphaUSD (AUSD)**
5. `Recipient address:` → `0x0147779Caf56F5c61d7Bd3a96a67E3c8df1C01c4`
6. `Amount (in AUSD, e.g., 100 or 100.5):` → `100`

**Expected Result:** Transaction simulated successfully with gas estimate.

---

## Test 5: Main Menu → Simulate Transaction → File

**Command:** `npm start`

**Prerequisites:** First create a transaction file:
```bash
# Create test-tx.json with this content:
{
  "from": "0x01526673FDe53eb8dfB549535a2a88F9a1b99365",
  "to": "0x20c0000000000000000000000000000000000001",
  "data": "0xa9059cbb0000000000000000000000000147779caf56f5c61d7bd3a96a67e3c8df1c01c40000000000000000000000000000000000000000000000000000000000000064",
  "value": "0",
  "nonce": 0
}
```

**Inputs:**
1. `What would you like to do?` → **Simulate Transaction**
2. `Load transaction from:` → **File**
3. `Transaction file path:` → `test-tx.json`

**Expected Result:** Transaction loaded from file and simulated.

---

## Test 6: Main Menu → Simulate Transaction → Manual Entry

**Command:** `npm start`

**Inputs:**
1. `What would you like to do?` → **Simulate Transaction**
2. `Load transaction from:` → **Enter manually (Advanced)**
3. `From address:` → `0x01526673FDe53eb8dfB549535a2a88F9a1b99365`
4. `Does this transaction have a recipient?` → **Yes**
5. `To address:` → `0x20c0000000000000000000000000000000000001`
6. `Does this transaction send native value?` → **No**
7. `Does this transaction include calldata?` → **Yes**
8. `Calldata (hex, e.g., 0xa9059cbb...):` → `0xa9059cbb0000000000000000000000000147779caf56f5c61d7bd3a96a67e3c8df1c01c40000000000000000000000000000000000000000000000000000000000000064`

**Expected Result:** Transaction simulated with manual inputs.

---

## Test 7: Main Menu → Estimate Gas → TIP-20 Token Transfer

**Command:** `npm start`

**Inputs:**
1. `What would you like to do?` → **Estimate Gas**
2. `Load transaction from:` → **TIP-20 Token Transfer (Easiest)**
3. `From address:` → `0x01526673FDe53eb8dfB549535a2a88F9a1b99365`
4. `Select token:` → **AlphaUSD (AUSD)**
5. `Recipient address:` → `0x0147779Caf56F5c61d7Bd3a96a67E3c8df1C01c4`
6. `Amount (in AUSD, e.g., 100 or 100.5):` → `100`

**Expected Result:** Gas estimate displayed.

---

## Test 8: Main Menu → Estimate Gas → File

**Command:** `npm start`

**Prerequisites:** Use the same `test-tx.json` from Test 5.

**Inputs:**
1. `What would you like to do?` → **Estimate Gas**
2. `Load transaction from:` → **File**
3. `Transaction file path:` → `test-tx.json`

**Expected Result:** Gas estimate for transaction from file.

---

## Test 9: Main Menu → Estimate Gas → Manual Entry

**Command:** `npm start`

**Inputs:**
1. `What would you like to do?` → **Estimate Gas**
2. `Load transaction from:` → **Enter manually (Advanced)**
3. `From address:` → `0x01526673FDe53eb8dfB549535a2a88F9a1b99365`
4. `Does this transaction have a recipient?` → **Yes**
5. `To address:` → `0x20c0000000000000000000000000000000000001`
6. `Does this transaction send native value?` → **No**
7. `Does this transaction include calldata?` → **Yes**
8. `Calldata (hex, e.g., 0xa9059cbb...):` → `0xa9059cbb0000000000000000000000000147779caf56f5c61d7bd3a96a67e3c8df1c01c40000000000000000000000000000000000000000000000000000000000000064`

**Expected Result:** Gas estimate displayed.

---

## Test 10: Main Menu → Multi-Step Flow

**Command:** `npm start`

**Inputs:**
1. `What would you like to do?` → **Multi-Step Flow**
2. `Flow name:` → `Test Flow`
3. `Flow description (optional):` → `Testing multi-step flow` (or press Enter to skip)
4. `Step name:` → `Transfer AlphaUSD`
5. **For the transaction in Step 1:**
   - `From address:` → `0x01526673FDe53eb8dfB549535a2a88F9a1b99365`
   - `Transaction type:` → **TIP-20 Token Transfer**
   - `Select token:` → **AlphaUSD**
   - `Recipient address:` → `0x0147779Caf56F5c61d7Bd3a96a67E3c8df1C01c4`
   - `Amount:` → `100`
   - `Use custom nonce?` → **No**
   - `Customize gas settings?` → **No**
6. `Does this step depend on previous steps?` → **No** (first step)
7. `Add another step?` → **Yes**
8. `Step name:` → `Transfer BetaUSD`
9. **For the transaction in Step 2:**
   - `From address:` → `0x01526673FDe53eb8dfB549535a2a88F9a1b99365`
   - `Transaction type:` → **TIP-20 Token Transfer**
   - `Select token:` → **BetaUSD**
   - `Recipient address:` → `0x0147779Caf56F5c61d7Bd3a96a67E3c8df1C01c4`
   - `Amount:` → `50`
   - `Use custom nonce?` → **No**
   - `Customize gas settings?` → **No**
10. `Does this step depend on previous steps?` → **Yes**
11. `Select dependent steps:` → **Select "Transfer AlphaUSD"** (check it)
12. `Add another step?` → **No**
13. `Save flow to file?` → **Yes**
14. `Filename:` → `test-flow.json`

**Expected Result:** Multi-step flow created, simulated, and saved to file.

---

## Test 11: Build Transaction with Custom Gas Settings

**Command:** `npm start build`

**Inputs:**
1. `From address:` → `0x01526673FDe53eb8dfB549535a2a88F9a1b99365`
2. `Transaction type:` → **TIP-20 Token Transfer**
3. `Select token:` → **AlphaUSD**
4. `Recipient address:` → `0x0147779Caf56F5c61d7Bd3a96a67E3c8df1C01c4`
5. `Amount:` → `100`
6. `Use custom nonce?` → **No**
7. `Customize gas settings?` → **Yes**
8. `Gas type:` → **EIP-1559 (maxFeePerGas)**
9. `Max fee per gas (wei):` → `1000000000`
10. `Max priority fee per gas (wei):` → `100000000`
11. `Gas limit:` → `100000`

**Expected Result:** Transaction with custom gas settings.

---

## Test 12: Build Transaction and Save to File

**Command:** `npm start build --output test-transfer.json`

**Inputs:**
1. `From address:` → `0x01526673FDe53eb8dfB549535a2a88F9a1b99365`
2. `Transaction type:` → **TIP-20 Token Transfer**
3. `Select token:` → **AlphaUSD**
4. `Recipient address:` → `0x0147779Caf56F5c61d7Bd3a96a67E3c8df1C01c4`
5. `Amount:` → `100`
6. `Use custom nonce?` → **No**
7. `Customize gas settings?` → **No**

**Expected Result:** Transaction saved to `test-transfer.json`.

---

## Test 13: Simulate from Command Line

**Command:**
```bash
node dist/cli.js simulate \
  --address 0x01526673FDe53eb8dfB549535a2a88F9a1b99365 \
  --to 0x20c0000000000000000000000000000000000001 \
  --data 0xa9059cbb0000000000000000000000000147779caf56f5c61d7bd3a96a67e3c8df1c01c40000000000000000000000000000000000000000000000000000000000000064
```

**Expected Result:** Transaction simulated directly from command line.

---

## Test 14: Estimate Gas from Command Line

**Command:**
```bash
node dist/cli.js estimate \
  --address 0x01526673FDe53eb8dfB549535a2a88F9a1b99365 \
  --to 0x20c0000000000000000000000000000000000001 \
  --data 0xa9059cbb0000000000000000000000000147779caf56f5c61d7bd3a96a67e3c8df1c01c40000000000000000000000000000000000000000000000000000000000000064
```

**Expected Result:** Gas estimate displayed.

---

## Test 15: Load Flow from File

**Prerequisites:** Create `test-flow.json`:
```json
{
  "name": "Test Flow",
  "description": "Test flow from file",
  "steps": [
    {
      "id": "step-1",
      "name": "Transfer AlphaUSD",
      "transaction": {
        "from": "0x01526673FDe53eb8dfB549535a2a88F9a1b99365",
        "to": "0x20c0000000000000000000000000000000000001",
        "data": "0xa9059cbb0000000000000000000000000147779caf56f5c61d7bd3a96a67e3c8df1c01c40000000000000000000000000000000000000000000000000000000000000064",
        "value": "0"
      },
      "dependencies": []
    }
  ]
}
```

**Command:** `npm start flow --file test-flow.json`

**Expected Result:** Flow loaded from file and simulated.

---

## Quick Test Checklist

Run through these quickly to verify everything works:

- [ ] Main menu appears
- [ ] Build Transaction → TIP-20 Token Transfer works
- [ ] Build Transaction → Contract Call works
- [ ] Build Transaction → Other/Custom works
- [ ] Simulate Transaction → TIP-20 Token Transfer works
- [ ] Simulate Transaction → File works
- [ ] Simulate Transaction → Manual works
- [ ] Estimate Gas → TIP-20 Token Transfer works
- [ ] Estimate Gas → File works
- [ ] Estimate Gas → Manual works
- [ ] Multi-Step Flow creation works
- [ ] Multi-Step Flow from file works
- [ ] Save transaction to file works
- [ ] Load transaction from file works
- [ ] Command line options work

---

## Common Calldata Examples

**Transfer 100 tokens (6 decimals):**
```
0xa9059cbb0000000000000000000000000147779caf56f5c61d7bd3a96a67e3c8df1c01c4000000000000000000000000000000000000000000000000000000000005f5e100
```
- Selector: `0xa9059cbb` (transfer)
- Recipient: `0x0147779Caf56F5c61d7Bd3a96a67E3c8df1C01c4` (padded)
- Amount: `100000000` (100 * 10^6, padded)

**Check balance (balanceOf):**
```
0x70a0823100000000000000000000000001526673fde53eb8dfb549535a2a88f9a1b99365
```
- Selector: `0x70a08231` (balanceOf)
- Address: `0x01526673FDe53eb8dfB549535a2a88F9a1b99365` (padded)

---

## Troubleshooting

**Error: "value transfer not allowed"**
- Solution: Don't send native value. Use TIP-20 Token Transfer option instead.

**Error: "Gas estimation failed"**
- Check that the from address has the required token balance
- Verify the calldata is correct
- Ensure the contract address is valid

**Error: "Transaction not defined"**
- Make sure you complete all required prompts
- Don't skip required fields
