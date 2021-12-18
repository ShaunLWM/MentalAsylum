// SPDX-License-Identifier: MIT

pragma solidity ^0.8.10;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

interface BaseContract {
	function balanceOf(address owner) external view returns(uint256);
}


contract MeatToken is ERC20("Meat", "MEAT") {

	uint256 constant public INITIAL_ISSUANCE = 300 ether;
	uint256 constant public BASE_RATE = 10 ether; 
    uint256 constant public END_DATE = 1931622407;

    BaseContract public BASE_CONTRACT;

    mapping(address => uint256) public rewards;
	mapping(address => uint256) public lastUpdate;

	event RewardsClaimed(address indexed user, uint256 reward);

    modifier ensureBaseContract() {
        require(msg.sender == address(BASE_CONTRACT), "Not called from base contract");
        _;
    }

    constructor(address _base) {
        BASE_CONTRACT = BaseContract(_base);
    }

    function min(uint256 a, uint256 b) internal pure returns (uint256) {
		return a < b ? a : b;
	}

    function updateRewardOnMint(address _user, uint256 _amount) ensureBaseContract external  {
        uint256 time = min(block.timestamp, END_DATE);
        uint256 userLastUpdated = lastUpdate[_user];

        if (userLastUpdated > 0) {
            /*

                rewards[_user] = rewards[_user].add(BASE_CONTRACT.balanceOG(_user).mul(BASE_RATE.mul((time.sub(userLastUpdated)))).div(86400).add(_amount.mul(INITIAL_ISSUANCE)));
                                 currentRewards +  (currentAmount                    *           (BASE_RATE *  (cur - last))         / 86400)                    )

                let's say user has minted before, and now minting a second NFT
                user token when he minted the first NFT = 300 tokens

                userCurrentReward + ((currentNFTcount * BASE_RATE * (currentTime - lastUpdated)) / 86400 + (_amount * 300 tokens))

                minted 1st token at:    1639192800 (Saturday, 11 December 2021 11:20:00 GMT+08:00)
                minted 2nd NFT at:      1639279200 (Sunday, 12 December 2021 11:20:00 GMT+08:00)

                userCurrentReward for the 1st NFT he minted = 300 + 10 = 310
                BUT rewards[_user] IS NEVER UPDATED WHEN NOT MINTING -> so it is actually only 300
                
                300 token +   (      ((2 * (10 token * (1639279200 - 1639192800)) / 86400)  + (1 * 300)  )
                = 300 token + (      ((2 * (10 token *            86400)          / 86400)  +   300      )
                = 300 token + (       (2 *             864000                     / 86400)  +   300      )
                = 300 token + (20 + 300)
                = 300 + 320
                = 620
            */

            rewards[_user] = rewards[_user] + (((BASE_CONTRACT.balanceOf(_user) * (BASE_RATE * (time - userLastUpdated))/86400)) + (_amount * INITIAL_ISSUANCE));
        } else {
            rewards[_user] += _amount * INITIAL_ISSUANCE;
        }

        lastUpdate[_user] = time;
    }

    function getReward(address _to) ensureBaseContract external {
		uint256 reward = rewards[_to];
		if (reward > 0) {
			rewards[_to] = 0;
			_mint(_to, reward);
			emit RewardsClaimed(_to, reward);
		}
	}

	function burn(address _from, uint256 _amount) ensureBaseContract external {
		_burn(_from, _amount);
	}

    function getPending(address _user) external view returns(uint256) {
		uint256 time = min(block.timestamp, END_DATE);
        uint256 pending = (BASE_CONTRACT.balanceOf(_user) * BASE_RATE * (time - lastUpdate[_user])) / 86400;
        /*
            (amount  * (10 ethers * (currentTime - lastMintedTime))) /86400
            let's say user just minted 1 NFT, the rewards will now be 300 ethers for this user

            minted time:            1639192800 (Saturday, 11 December 2021 11:20:00 GMT+08:00)
            check pending time:     1639193100 (Saturday, 11 December 2021 11:25:00 GMT+08:00)

            pending will be
            1 * (10 * (1639193100 - 1639192800))) / 86400
            = (1 * (10 * 300)) / 86400
            = 3000 / 86400
            = 0.00347222222
            = 0 (rounded off in Solidity)

            which means 0 token per 5 mins

            if we calculate it for 1 day later
            check pending time:     1639279200 (Sunday, 12 December 2021 11:20:00 GMT+08:00)

            1 * (10 * (1639279200 - 1639192800))) / 86400
            = (1 * (10 * 86400)) / 86400
            = 864000 / 86400
            = 10

            which shows that 10 tokens are minted per NFT for user per day
        */
		return rewards[_user] + pending;
	}
}
