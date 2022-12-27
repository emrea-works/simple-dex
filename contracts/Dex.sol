pragma solidity >=0.6.0 <0.8.15;
pragma experimental ABIEncoderV2;

import './Wallet.sol';

contract Dex is Wallet {

  using SafeMath for uint256;

  enum Side {
    BUY, SELL
  }

  struct Order {
    uint id;
    address trader;
    bool buyOrder;
    bytes32 ticker;
    uint amount;
    uint price;
  }

  uint public nextOrderId = 0;

  mapping(bytes32 => mapping(uint => Order[])) public orderBook;

  function getOrderBook(bytes32 ticker, Side side) public view returns(Order[] memory) {
    return orderBook[ticker][uint(side)];
  }

  function createLimitOrder(Side side, bytes32 ticker, uint256 amount, uint256 price) {
    if (side == Side.BUY) {
      require(balances[msg.sender]["ETH"] >= amount.mul(price));
    }
    if (side == Side.SELL) {
      require(balances[msg.sender][ticker] >= amount);
    }

    Order[] storage orders = orderBook[ticker][uint(side)];
    orders.push(Order(nextOrderId, msg.sender, side, ticker, amount, price));

    // My Solution
    if (side == Side.BUY) {
      bool swapped;
      for (uint i = orders.length-1; i > 0; i--) {
        swapped = false;
        for (uint j = orders.length-1; j > 0; j--) {
          if (orders[j].price > orders[j-1].price) {
            // swap: orders = [5,8,2,7]
            Order memory t = orders[j-1]; // 2
            orders[j-1] = orders[j]; // [5,8,8,7]
            orders[j] = t; // [5,8,2,7]
            swapped = true;
          }
        }
        if(!swapped){
          break;
        }
      }
    }

    else if (side == Side.SELL) {
      for (uint i = 0; i < orders.length-1; i++) {
        swapped = false;
        for (uint j = 0; j < orders.length-1; j++) {
          if (orders[j].price > orders[j+1].price) {
            Order memory t = orders[j];
            orders[j] = orders[j+1];
            orders[j+1] = t;
            swapped = true;
          }
        }
        if(!swapped){
          break;
        }
      }
    }

    // Lecturer's Solution
    /*
    uint i = orders.length > 0 ? orders.length - 1 : 0;

    if(side == Side.BUY){
      while(i>0){
        if(orders[i-1].price > orders[i].price){
          break;
        }
        Order memory orderToMove = orders[i-1];
        orders[i-1] = orders[i];
        orders[i] = orderToMove;
        i--;
      }
    } else if (side == Side.SELL){
      while(i>0){
        if(orders[i-1].price < orders[i].price){
          break;
        }
        Order memory orderToMove = orders[i-1];
        orders[i-1] = orders[i];
        orders[i] = orderToMove;
        i--;
      }
    }
    */

    nextOrderId++;
  }

}
