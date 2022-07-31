//SPDX-License-Identifier: MIT
pragma solidity >=0.6.0 <0.8.0;

// ERC20 Proposal's Interface Source
import "../node_modules/@openzeppelin/contracts/token/ERC20/IERC20.sol";
// Safety Contract which is Overflow-proof Math Operations
import "../node_modules/@openzeppelin/contracts/utils/math/SafeMath.sol";

contract Wallet {
  use SafeMath for uint256;
  // Storage Design
  struct Token {
    bytes32 ticker;
    address tokenAddress;
  }
  // dynamic structure between array and mapping
  mapping(bytes32 => Token) public tokenMapping;
  bytes32[] public tokenList;
  // mapping: address given, amount of currency ticker symbols (bytes32) returns
  /*
   * @dev: currency symbols could be string type but when we need to compare
   * values string is not the type at compasion
   */
  mapping(address => mapping(bytes32 => uint256)) public balances;
  // function: add tokens, making external saves from gas consumption
  function addToken(bytes32 ticker, address tokenAddress) external {
    tokenMapping[ticker] = Token(ticker, tokenAddress);
    tokenList.push(ticker);
  }
  // function: deposit
  function deposit(uint amount, bytes32 ticker) external {
    require(msg.value >= amount, "Funds are nor equal neither grater than mentioned value.");
    balances[msg.sender][ticker] = balances[msg.sender][ticker].add(amount);
    IERC20(tokenMapping[ticker].tokenAddress).transferFrom(msg.sender, address(this), amount);
  }
  // function: withdraw
  /*
   * gets amount and ticker values, updates the balance by substracting safely
   * the amount from the total amount in the balances mapping, that belongs to
   * the given address which is in Token struct that mapped to the ticker that
   * passed as an id,
   * and via ERC20 proposal interface, calls transfer function from ERC20
   * teamplate contract, by passing the same ticker value to point to the
   * tokenAddress in the Token struct, and make it transfered to the msg.sender
   * who has interacted to the contract with their private key with the amount
   * that they required and sent through parameters.
   */
  function withdraw(uint amount, bytes32 ticker) external {
    require(balances[msg.sender][ticker] >= amount, "Balances are not sufficient");
    require(tokenMapping[ticker].tokenAddress != address(0));
    balances[msg.sender][ticker] = balances[msg.sender][ticker].sub(amount);
    IERC20(tokenMapping[ticker].tokenAddress).transfer(msg.sender, amount);
  }
}
