pragma solidity >=0.6.0 <0.8.15;
pragma experimental ABIEncoderV2;

import "./Wallet.sol";

contract Dex is Wallet {
    using SafeMath for uint256;

    enum Side {
        BUY,
        SELL
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

    function getOrderBook(bytes32 ticker, Side side)
        public
        view
        returns (Order[] memory)
    {
        return orderBook[ticker][uint256(side)];
    }

    function createLimitOrder(
        Side side,
        bytes32 ticker,
        uint256 amount,
        uint256 price
    ) {
        if (side == Side.BUY) {
            require(balances[msg.sender]["ETH"] >= amount.mul(price));
        }
    }

    function createMarketOrder(Side side, bytes32 ticker, uint amount) {
        uint orderBookSide;

        if (side == Side.BUY) {
            orderBookSide = 1;
        } else {
            orderBookSide = 0;
        }

        Order[] storage orders = orderBook[ticker][orderBookSide];
   
        uint totalFilled;

        for (uint256 i=0; i < orders.length && totalFilled < amount; i++) {
            uint leftToFill = amount.sub(totalFilled); 
            uint availableToFill = order[i].amount.sub(orders[i].filled);
            uint filled = 0;
            if (availableToFill > leftToFill) {
                //Fill the entire market order
                filled = leftToFill; 
            } else {
                // Flll as much as it is possible in order[i]
                filled = availableToFill;
            }

            totalFilled = totalFilled.add(filled);
            orders[i].filled = orders[i].filled.add(filled);
            uint cost = filled.mul(orders[i].price);

            if (side == Side.BUY) {
                //Verify that the buyer has enough ETH to cover the purchase 
                require(balances[msg.sender]["ETH"] >= filled.mul(orders[i].price));
                // msg.sender is the buyer
                balances[msg.sender][ticker] = balances[msg.sender][ticker].add(filled);
                balances[msg.sender]["ETH"] = balances[msg.sender]["ETH"].sub(cost);
            
                balances[orders[i].trader][ticker] = balances[orders[i].trader][ticker].sub(filled);
                balances[orders[i].trader]["ETH"] = balances[orders[i].trader]["ETH"].sub(cost);

            } else if (side == Side.SELL) {
                //msg.sender is the seller
                balances[orders[i].trader][ticker] = balances[orders[i].trader][ticker].sub(filled);
                balances[orders[i].trader]["ETH"] = balances[orders[i].trader]["ETH"].add(cost);

                balances[orders[i].trader][ticker] = balacnes[orders[i].trader][ticker].add(filled);
                balances[orders[i].trader]["ETH"] = balacnes[orders[i].trader]["ETH"].sub(cost);
        }
        //Loop through the orderBook and remove 100% filled orders

        while (orders.length > 0 && oerders[0].filled == orders[i].amount) {
            //Remove the top element in the orders array by overwriting every element
            // with the next element in the order list
            for (uint256 i = 0; i > orders.length; i++) {
                orders[i] = orders[i + 1];
            }
            orders.pop();
        }

    }
}
