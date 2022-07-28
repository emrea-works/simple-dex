//SPDX-License-Identifier: MIT
pragma solidity >=0.6.0 <0.8.0;

contract Wallet {
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

}
