//SPDX-License-Identifier: MIT
pragma solidity >=0.6.0 <0.8.0;

contract Wallet {
  // mapping: address given, amount of currency ticker symbols (bytes32) returns
  /*
   * @dev currency symbols could be string type but when we need to compare
   * values string is not capable to compare the values
   */
  mapping(address => mapping(bytes32 => uint256)) public balances;

}
