pragma solidity ^0.4.2;

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../contracts/MeetupEvent.sol";

contract TestMeetupEvent {

  MeetupEvent meetupEvent = MeetupEvent(DeployedAddresses.MeetupEvent("1000000000000000000", "0xb72c93b655efdae0d13af387fe559ace0e26f0a2", 3, now + 10 seconds));

  function testOwnerCantWithdrawFunds() {

    meetupEvent.ownerWithdrawal();

    uint expected = 89;

    Assert.equal(simpleStorage.get(), expected, "It should store the value 89.");
  }

}
