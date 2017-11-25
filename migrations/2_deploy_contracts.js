var MeetupEvent = artifacts.require("./MeetupEvent.sol");

module.exports = function(deployer) {
  deployer.deploy(MeetupEvent,"10000000000000000", "0xe4ed7567f8bec5ad8b8969e6b0c9e745d6224bee", 75, 1511999100 /*(Date.now() + 100000) / 1000*/);
};
