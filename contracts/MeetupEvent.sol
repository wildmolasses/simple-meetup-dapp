pragma solidity ^0.4.0;

contract MeetupEvent {

    address public creator;
    address public owner;
    uint public eventCap;
    uint public costOfEvent;
    uint public dateOfEvent;
    struct rsvpSingle {
        uint balance;
        string name;
        bool isRsvped;
    }
    mapping (address => rsvpSingle) public rsvpData;
    address[] public rsvpList;

    event EventRsvp(
        address indexed _from,
        string _name,
        uint _value
        );

    event EventOwnerWithdrawal(
        address indexed _from,
        uint _value
        );

//    event EventRsvpDeclined(
//        address indexed _from,
//        string _reason
//        );

    modifier mustHaveSpace() {
        if(eventCap != 0) require(rsvpList.length < eventCap);
        _;
    }

    modifier isEnded() {
        // require(now >= dateOfEvent + 3 hours);
        require(now >= dateOfEvent); // while testing...
        _;
    }

    modifier isOwner() {
        require(owner == msg.sender);
        _;
    }

    function isRsvped(address _address) public constant returns(bool isIndeed) {
      return rsvpData[_address].isRsvped;
    }

    function MeetupEvent(uint _price,
                        address _meetupOwner,
                        uint _cap,
                        uint _date) public {
        require(_date > now);
        creator = msg.sender;
        costOfEvent = _price;
        owner = _meetupOwner;
        eventCap = _cap;
        dateOfEvent = _date;
        // some defaults:
        // "1000000000000000000", "0xca35b7d915458ef540ade6068dfe2f44e8fa733c", 3, "1508274109"
    }

    function rsvpMe(string _name) public payable mustHaveSpace {
        require(!isRsvped(msg.sender));
        require(msg.value == costOfEvent);
        rsvpData[msg.sender].balance = msg.value;
        rsvpData[msg.sender].name = _name;
        rsvpData[msg.sender].isRsvped = true;
        rsvpList.push(msg.sender);
        EventRsvp(msg.sender, _name, msg.value);
    }

    function getAttendeeAddresses() view public returns (address[]) {
        return rsvpList;
    }

    function getAttendeeInfo(address _address) view public returns (uint, string) {
        return (rsvpData[_address].balance, rsvpData[_address].name);
    }

    function ownerWithdrawal() public isEnded isOwner {
        var _balance = this.balance;
        owner.transfer(_balance);
        EventOwnerWithdrawal(owner, _balance);
    }
}
