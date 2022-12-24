/**
 * Environment: Truffle Console
 */

const accounts = [
  "0x3950D8e59314cE1666735E66829ff3c73d5047CC",
  "0xdFD97b318c6e6A6D58F7Db307FACD8648895E265",
  "0xbD2D520842886078b3eFB7F5dd96CDA2a803E70A",
  "0x1692dDfa06b19a06558b0f04148996a7f615BF92",
  "0x870f28094e488914f0CF8e308285480B846F3a90",
  "0x80099f07294720BB710929F4c326eAe59B7C5cA0",
  "0xE1ED1e5f75dc2BA3a2e9Acf7681D684647b4fA0E",
  "0xa5458e7Cb45cE51DC864732A48257d37d787611c",
  "0x31c6c6daae2AAbF4e3263fC459F4ECF7fbA8b135",
  "0x03D068F7ebF3c6418F80800c792f3383F0675DAE",
];

let orders = [];
let buyOrders = [];
let sellOrders = [];

const orderSide = {
  BUY: "buy",
  SELL: "sell",
};

let twei = v => { return web3.utils.toWei(v) }

function createLimitOrder(msgSender, orderType, symbol, orderAmount, pairPrice) {
  const newOrder = {
    id: orders.length,
    trader: msgSender,
    buyOrder: orderType, //orderSide.BUY/SELL
    ticker: symbol, // :bytes32
    amount: orderAmount, //
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
  /**
   * maybe instead of sorting JS way, better to find a way to insert
   * the order in the right place in the array
   */
  buyOrders.sort((a, b) => {
    return (a.amount) - (b.amount);
  });
  sellOrders.sort((a, b) => {
    return (b.amount) - (a.amount);
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

createLimitOrder(accounts[4], "buy", "0x455448", twei("0.066"), "2000");
createLimitOrder(accounts[5], "buy", "0x455448", twei("0.018"), "2000");
createLimitOrder(accounts[8], "buy", "0x455448", twei("0.024"), "2000");
createLimitOrder(accounts[3], "buy", "0x455448", twei("0.084"), "2000");
createLimitOrder(accounts[2], "buy", "0x455448", twei("0.012"), "2000");
createLimitOrder(accounts[6], "buy", "0x455448", twei("0.005"), "2000");

console.log(getLimit(buyOrders));

console.table(buyOrders);
