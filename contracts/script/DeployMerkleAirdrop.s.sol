// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import {Script} from "forge-std/Script.sol";
import {MerkleAirdrop} from "src/MerkleAirdrop.sol";

contract DeployMerkleAirdrop is Script {
    function run() public returns (MerkleAirdrop) {
        bytes32 merkleRoot = 0x61dac2143c983f86fa7548fe90a9f3171103d517db78defd1e73b101b347f2c4;

        /**
         * Broadcast operations on blockchain
         * Anything before `startBroadcast` is not a real transaction, so no gas is spent
         */
        vm.startBroadcast();
        // Deploy the contract
        MerkleAirdrop token = new MerkleAirdrop(merkleRoot);
        vm.stopBroadcast();

        return token;
    }
}
