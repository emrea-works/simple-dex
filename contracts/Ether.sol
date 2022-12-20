//SPDX-License-Identifier: MIT
pragma solidity >=0.6.0 <0.8.15;

// ERC20 Proposal's Interface Source
import "../node_modules/@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Ether is ERC20 {
  constructor() ERC20("Fake Ether", "ETH") public {
    _mint(msg.sender, 1000 * 10 ** decimals());
  }
}
