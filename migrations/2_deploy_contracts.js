var MeetupEvent = artifacts.require("./MeetupEvent.sol");

module.exports = function(deployer) {
  deployer.deploy(MeetupEvent,"1000000000000000000", "0x17ec2f38cd06c01054e92bed8950bafa806f351b", 3, (Date.now() + /* 6 */ 100000) / 1000);
};
