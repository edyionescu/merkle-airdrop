.PHONY: anvil clean build test install update abi deploy all

DEFAULT_ANVIL_KEY := 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80

anvil 	:; anvil
clean 	:; forge clean
build 	:; forge build
test  	:; forge test -vvv
install :; forge install
update 	:; forge update
abi 	:; forge inspect src/MerkleAirdrop.sol:MerkleAirdrop abi --json > abis/MerkleAirdrop.abi

deploy:
	@forge script script/DeployMerkleAirdrop.s.sol:DeployMerkleAirdrop $(NETWORK_ARGS)
NETWORK_ARGS := --rpc-url http://localhost:8545 --private-key $(DEFAULT_ANVIL_KEY) --broadcast

all 	: clean build test abi deploy
