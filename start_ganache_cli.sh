#!/bin/bash
source ./.env
chaindata="path/to/chaindata/"
#ganache --database.dbPath $chaindata 
ganache --wallet.mnemonic $MNEMONIC -l 6500000 -p 8545
