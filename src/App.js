import React, { Component } from 'react'
import MeetupEventContract from '../build/contracts/MeetupEvent.json'
import getWeb3 from './utils/getWeb3'
import Moment from 'moment'

import './css/roboto.css'
import './css/pure-min.css'
import './App.css'

class App extends Component {
  constructor(props) {
    super(props)

    this.state = {
      // dateOfEvent: Moment(1370001284000).format("MM-DD-YYYY h:mm"),
      groupName: 'Philly Ethereum Meetup',
      title: 'Presentation by FOAM: A \"Spatial Protocol\" built on Ethereum',
      description: "Geospatial data in Web 2.0 -- we use it to describe points of interest, navigate from place to place, and avoid speed traps. Geospatial data in Web 3.0 seems more important. On blockchains blind to the real world, trustworthy data about physical reality is in short supply and high demand. How can we talk about location reliably on a blockchain? How can we describe land ownership, or the location of a bystander relative to a car accident? The FOAM protocol is an ambitious project that seeks to solve geospatial coordinate consensus on Ethereum. Come learn about FOAM's 3-tiered protocol and cryptoeconomic approach to a consensus-driven map of the world. Learn more on their website, <a href='https://foam.space' target='_blank'>FOAM.space</a>, and check out <a href='https://blog.foam.space/introducing-the-foam-protocol-2598d2f71417' target='_blank'>this blog post</a>.",
      rsvpList: [0],
      attendeeInfo: [[[],[]], []],
      //eventCap: 0,
      //costOfEvent: 0,
      // owner: "magicians",
      //isOwner: false,
      //contractBalance: 0,
      name: "",
      loaded: false,
      error: ''
    }
  }

  componentWillMount() {
    // Get network provider and web3 instance.
    // See utils/getWeb3 for more info.

    getWeb3
    .then(results => {
      this.web3 = results.web3

      // Instantiate contract once web3 provided.
      this.instantiateContract()
    })
    .catch(() => {
      console.log('Error finding web3.')
      return this.setState({error: "Error finding web3. Please download a web3 browser plugin like metamask to get started."});
    })
  }

  instantiateContract() {

    const contract = require('truffle-contract')
    const meetupEvent = contract(MeetupEventContract)
    meetupEvent.setProvider(this.web3.currentProvider)

    // Get accounts
    this.web3.eth.getAccounts((error, accounts) => {

      this.web3accounts = accounts;

      meetupEvent.deployed().then((instance) => {
        this.meetupEventInstance = instance;
        let promises = [this.meetupEventInstance.owner(),
                        this.meetupEventInstance.getAttendeeAddresses(),
                        this.meetupEventInstance.dateOfEvent(),
                        this.meetupEventInstance.costOfEvent()
                       ];
        return Promise.all(promises);
      }).then((result) => {
        // Update state with the result.
        return this.setState({owner: result[0],
                              rsvpList: result[1],
                              dateOfEvent: Moment.unix(result[2].c).format("MM/DD/YYYY h:mm A"),
                              costOfEvent: result[3],
                              isOwner: accounts[0] === result[0],
                              loaded: true
                            })
      }).then((result) => {
        this.getAttendeeInfo(this.state.rsvpList);
        this.updateContractBalance();
      })
    })
  }

  getAttendeeInfo = (addressArr) => {
    var _attendeeInfo = [];
    var promises = addressArr.map((address) =>
      { return this.meetupEventInstance.getAttendeeInfo(address).then((result) =>
        { return _attendeeInfo[address] = result;
    })});
    return Promise.all(promises).then((results) => {
      console.log(_attendeeInfo);
      return this.setState({attendeeInfo: _attendeeInfo});
    })
  }

  updateContractBalance() {
    if(!this.web3) return;

    return this.web3.eth.getBalance(this.meetupEventInstance.address,
      (error, result) => {
        if(!error) {
          return this.setState({contractBalance: result.c[0]})
        } else {console.error(error)}
    });
}

  rsvpMe() {
      let account = this.web3accounts[0];
      this.meetupEventInstance.rsvpMe(
        this.state.name,
        {from: account, value: this.state.costOfEvent}
      ).then((result) => {
        // is it possible to wait until the next block / a few blocks before updating RSVP list / confirming TX?
      }).catch(function(err) {
        console.log(err.message);
      })
  }

  ownerWithdrawal() {
    return this.meetupEventInstance.ownerWithdrawal({from: this.web3accounts[0]});
  }

  handleChange = (event) => {
    return this.setState({name: event.target.value})
  }

  convertVal = (val, unit) => {
    if(!this.web3) return val;
    return this.web3.fromWei(val, unit) + ' ' + unit
  }

  render() {
    return (
      <div className="flex-container">
      <div className="App">
        <div className={["loading", (this.state.loaded ? 'hidden' : '')].join(' ')}>
          Loading info from Ethereum network...
        </div>

        <main className={["container", (this.state.loaded ? '' : 'hidden')].join(' ')}>
              <img alt="Ethereum logo" src="ETHEREUM-ICON_Black copy.png" width="200px"/>
              <p>{this.state.groupName}</p>
              <h1>{this.state.title}</h1>
              <h2>Date: {this.state.dateOfEvent}</h2>
                            <p className="description" dangerouslySetInnerHTML={{__html: this.state.description}}></p>

              <div>
              <input value={this.state.name} onChange={this.handleChange} placeholder="Your name"/>
              <button id="rsvp" className="pure-button-primary" onClick={this.rsvpMe.bind(this)}>RSVP ({this.convertVal(this.state.costOfEvent, 'ether')})</button>
              </div>
              <button id="owner-withdrawal"
                   className={["pure-button-primary", (this.state.isOwner ? "" : "hidden")].join(' ')}
                   onClick={this.ownerWithdrawal.bind(this)}>
                   Owner Only: Withdraw contract funds ({this.state.contractBalance/10000} ether)
              </button>
              <p>RSVPs ({this.state.rsvpList.length} total)</p>
              <ul>
              {this.state.rsvpList.map((item, index) => (
                <li key={index}>{(this.state.attendeeInfo[item] ? this.state.attendeeInfo[item][1] + ' - ' : null)}{item}</li>
              ))
              }
              </ul>

                            <p className="smaller">Contract Owner: {this.state.owner}</p>
        </main>
      </div>
      </div>
    );
  }
}

export default App
