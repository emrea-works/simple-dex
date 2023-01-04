const Wallet = artifacts.require("Wallet");
const Dex = artifacts.require("Dex");
const Link = artifacts.require("Link");
const Ether = artifacts.require("Ether");
const assert = require("chai").assert;
const truffleAssert = require("truffle-assertions");

contract("Dex", (accounts) => {
  let wallet, dex, eth, link, msgSender;
  let orders = [];
  let buyOrders = [];
  let sellOrders = [];
  // utils
  let twei = (v) => {
    return web3.utils.toWei(v);
  };
  let tickerETH = web3.utils.fromUtf8("ETH");
  let tickerLINK = web3.utils.fromUtf8("LINK");

  const orderSide = {
    BUY: "buy",
    SELL: "sell",
  };

  function createLimitOrder(
    msgSender,
    orderType,
    symbol,
    orderAmount,
    pairPrice
  ) {
    // conditional
    if (!wallet) {
      console.error("wallet isn't defined yet");
      return;
    }
    const newOrder = {
      id: orders.length,
      trader: msgSender,
      buyOrder: orderType, //orderSide.BUY/SELL
      ticker: symbol, // :bytes32
      amount: orderAmount,
      price: pairPrice,
    };
    // orders.push(newOrder);
    // add limit order
    if (newOrder.buyOrder === "buy") {
      buyOrders.push(newOrder);
    } else {
      sellOrders.push(newOrder);
    }
    orders.push(newOrder);

    buyOrders.sort((a, b) => {
      return b.amount - a.amount;
    });
    sellOrders.sort((a, b) => {
      return a.amount - b.amount;
    });

    return newOrder;
  }

  function getLimit(ordersType) {
    let limit = 0;
    ordersType.forEach((order) => {
      if (order.amount > limit) {
        limit = order.amount;
      }
    });
    return limit;
  }

  before(async () => {
    wallet = await Wallet.deployed();
    link = await Link.deployed();
    dex = await Dex.deployed();
    eth = await Ether.deployed();
  });

  it("should pass while the user must have ETH deposited such that deposited eth >= buy order value", async () => {
    // Define
    msgSender = accounts[0];
    const symbol = "ETH";
    // Apply
    const walletBalance = await wallet.balances(
      msgSender,
      web3.utils.fromUtf8(symbol)
    );
    const order = createLimitOrder(
      msgSender,
      orderSide.BUY,
      web3.utils.fromUtf8(symbol),
      "84",
      "2000"
    );
    // Report
    console.log(`walletBalance: ${walletBalance} ${symbol}`);
    console.table({ order });
    // Assert
    await truffleAssert.passes(
      assert.isAtLeast(
        web3.utils.BN(walletBalance).toNumber(),
        web3.utils.BN(order.amount).toNumber(),
        `⛔ Not enough asset to create order (order amount is higher than user's asset)
        Balance: ${walletBalance} ${symbol} < Tried Order: ${order.amount} ${symbol}
        `
      )
    );
  });

  it("should pass while the user must have enough tokens deposited such that token balance >= sell order amount", async () => {
    // Define
    msgSender = accounts[0];
    const symbol = "LINK";
    // Apply
    const walletBalance = await wallet.balances(
      msgSender,
      web3.utils.fromUtf8(symbol)
    );
    const order = createLimitOrder(
      msgSender,
      orderSide.BUY,
      web3.utils.fromUtf8(symbol),
      "42",
      "2000"
    );
    // Report
    console.log(`walletBalance: ${walletBalance} ${symbol}`);
    console.table({ order });
    // Assert
    await truffleAssert.passes(
      assert.isAtLeast(
        web3.utils.BN(walletBalance).toNumber(),
        web3.utils.BN(order.amount).toNumber(),
        `⛔ Not enough asset to create order (order amount is higher than user's asset)
        Balance: ${walletBalance} ${symbol} < Tried Order: ${order.amount} ${symbol}
        `
      )
    );
  });

  it("should pass while the buy order book should be ordered on price from highest to lowest starting at index 0", async () => {
    // Define
    buyOrders = [];
    const msgSender = accounts[0];
    const ticker = web3.utils.fromUtf8("LINK");
    // Apply
    createLimitOrder(msgSender, orderSide.BUY, ticker, "32", "30");
    createLimitOrder(msgSender, orderSide.BUY, ticker, "18", "30");
    createLimitOrder(msgSender, orderSide.BUY, ticker, "64", "30");
    createLimitOrder(msgSender, orderSide.BUY, ticker, "05", "30");
    const highestOrder = getLimit(buyOrders);
    // Report
    console.table(buyOrders);
    // Assert
    await truffleAssert.passes(
      assert.equal(
        buyOrders[0].amount,
        highestOrder,
        `⛔ Highest Order is not the first element of orders list`
      )
    );
  });
});
