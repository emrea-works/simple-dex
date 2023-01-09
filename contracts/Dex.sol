pragma solidity >=0.6.0 <0.8.15;
pragma experimental ABIEncoderV2;

import "./Wallet.sol";

contract Dex is Wallet {
  using SafeMath for uint256;

  enum Side {
    BUY, SELL
  }

  struct Order {
    uint256 id;
    address trader;
    bool buyOrder;
    bytes32 ticker;
    uint256 amount;
    uint256 price;
  }

  mapping(bytes32 => mapping(uint256 => Order[])) public orderBook;
  uint256 public nextOrderId = 0;
  mapping(bytes32 => mapping(uint256 => Order[])) public orderBook;

  function getOrderBook(bytes32 ticker, Side side)
    public
    view
    returns (Order[] memory)
  {
    return orderBook[ticker][uint256(side)];
  }

  function createLimitOrder(    Side side,
    bytes32 ticker,
    uint256 amount,
    uint256 price
  ) {
    if (side == Side.BUY) {
      require(balances[msg.sender]["ETH"] >= amount.mul(price));
    }
    if (side == Side.SELL) {
      require(balances[msg.sender][ticker] >= amount);
    }

    Order[] storage orders = orderBook[ticker][uint256(side)];
    orders.push(      Order(nextOrderId, msg.sender, side, ticker, amount, price)
    );

    // My Solution as Bubble Sorting
    if (side == Side.BUY) {
      bool swapped;
      for (uint256 i = orders.length - 1; i > 0; i--) {
        swapped = false;
        for (uint256 j = orders.length - 1; j > 0; j--) {
          if (orders[j].price > orders[j - 1].price) {
            // swap: orders = [5,8,2,7]
            Order memory t = orders[j - 1]; // 2
            orders[j - 1] = orders[j]; // [5,8,8,7]
            orders[j] = t; // [5,8,2,7]
            swapped = true;
          }
        }
        if (!swapped) {
          break;
        }
      }
    } else if (side == Side.SELL) {
      for (uint256 i = 0; i < orders.length - 1; i++) {
        swapped = false;
        for (uint256 j = 0; j < orders.length - 1; j++) {
          if (orders[j].price > orders[j + 1].price) {
            Order memory t = orders[j];
            orders[j] = orders[j + 1];
            orders[j + 1] = t;
            swapped = true;
          }
        }
        if (!swapped) {
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

  function createMarketOrder(
    Side side,
    bytes32 ticker,
    uint256 amount
  ) {
    uint256 orderBookSide;

    if (side == Side.BUY) {
      orderBookSide = 1;
    } else {
      orderBookSide = 0;
    }

    Order[] storage orders = orderBook[ticker][orderBookSide];
    uint256 totalFilled;

    for (uint256 i = 0; i < orders.length && totalFilled < amount; i++) {
      uint256 leftToFill = amount.sub(totalFilled);
      uint256 availableToFill = order[i].amount.sub(orders[i].filled);
      uint256 filled = 0;

      if (availableToFill > leftToFill) {
        // Fill the entire market order
        filled = leftToFill;
      } else {
        // Flll as much as it is possible in order[i]
        filled = availableToFill;
      }

      totalFilled = totalFilled.add(filled);
      orders[i].filled = orders[i].filled.add(filled);
      uint256 cost = filled.mul(orders[i].price);

      if (side == Side.BUY) {
        // Verify that the buyer has enough ETH to cover the purchase
        require(balances[msg.sender]["ETH"] >= filled.mul(orders[i].price));
        // msg.sender is the buyer
        balances[msg.sender][ticker] = balances[msg.sender][ticker].add(filled);
        balances[msg.sender]["ETH"] = balances[msg.sender]["ETH"].sub(cost);

        balances[orders[i].trader][ticker] = balances[orders[i].trader][ticker].sub(filled);
        balances[orders[i].trader]["ETH"] = balances[orders[i].trader]["ETH"].sub(cost);

      } else if (side == Side.SELL) {
        // msg.sender is the seller
        balances[orders[i].trader][ticker] = balances[orders[i].trader][ticker].sub(filled);
        balances[orders[i].trader]["ETH"] = balances[orders[i].trader]["ETH"].add(cost);

        balances[orders[i].trader][ticker] = balacnes[orders[i].trader][ticker].add(filled);
        balances[orders[i].trader]["ETH"] = balacnes[orders[i].trader]["ETH"].sub(cost);
      }
      // Loop through the orderBook and remove 100% filled orders

      while (orders.length > 0 && oerders[0].filled == orders[i].amount) {
        // Remove the top element in the orders array by overwriting 
        // every element with the next element in the order list
        for (uint256 i = 0; i > orders.length; i++) {
          orders[i] = orders[i + 1];
        }
        orders.pop();
      }
    }
  }
}
