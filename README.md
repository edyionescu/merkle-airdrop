# Merkle Airdrop claim system

[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/edyionescu/merkle-airdrop)
![GitHub License](https://img.shields.io/github/license/edyionescu/merkle-airdrop)

A full-stack Merkle Airdrop system where users can claim tokens only if they're on a whitelist.

Storing a massive airdrop list on-chain is expensive, so the better approach is to use a [Merkle tree](https://blog.ethereum.org/2015/11/15/merkling-in-ethereum). This is a binary tree of hashes where each leaf is a hash of the claim data (e.g., user address + position in the list + amount of tokens they're allowed to claim). The Merkle root is stored on-chain, and users prove their membership by submitting a Merkle proof, which consists of a list of sibling hashes.

### System overview

1. Server ([Express](https://expressjs.com/) with Merkle logic):
   - Stores airdrop data: `address`, `index`, `amount`
   - Returns matching proof data on request

2. Client ([React](https://react.dev/) based DApp frontend, [MetaMask](https://metamask.io/)):
   - Presses a "Claim Tokens" button
   - Sends their address to the server
   - Receives back: `index`, `amount`, `merkleProof`
   - Calls the smart contract's `claim()` method with MetaMask

3. Solidity Contract ([Foundry](https://book.getfoundry.sh/), [OpenZeppelin](https://openzeppelin.com/)):
   - Stores the Merkle root
   - Verifies the Merkle proof
   - Mints tokens to the claimer

![Merkle Airdrop](merkle_airdrop.png)

## Prerequisites

- [Node.js](https://nodejs.org/) version 22+
- [pnpm](https://pnpm.io/) version 10+
- [forge](https://book.getfoundry.sh/getting-started/installation) version 1+

## Usage

1. Clone the repository:

   ```bash
   git clone https://github.com/edyionescu/merkle-airdrop.git
   cd merkle-airdrop
   ```

2. Install root dependencies:

   ```bash
   pnpm install
   ```

3. Setup contracts:

   ```bash
   cd contracts
   forge install
   make anvil
   make all
   ```

   Note: The [make](https://www.gnu.org/software/make/) utility executes the tasks defined in `/contracts/Makefile`.

4. Setup server[^1]:

   ```bash
   cd server
   cat .env.example > .env
   pnpm dev
   ```

   Note: The sample `/server/airdrop-accounts.json` contains the default [Anvil](https://book.getfoundry.sh/anvil/) accounts and their corresponding claim data. Replace with your own data, if needed.

5. Setup client[^1]:

   ```bash
   cd ../client

   cat .env.example > .env
   # Replace `VITE_AIRDROP_CONTRACT_ADDRESS` in `.env` with the address of the deployed contract

   pnpm dev
   ```

6. Visit the application at [`http://localhost:5173/`](http://localhost:5173/).

[^1]: Alternatively, you can run both the client and server in parallel. Either use `pnpm dev` in the root directory, or run the task included in `.vscode/tasks.json` with `Ctrl+Shift+P` / `Cmd+Shift+P` > `Tasks: Run Task` > `Start: Client & Server`.
