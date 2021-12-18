// SPDX-License-Identifier: MIT

pragma solidity ^0.8.10;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "./MeatToken.sol";

contract MentalAsylum is ERC721Enumerable, Ownable {
    using Strings for uint256;
    event MintPatient(address indexed sender, uint256 startWith, uint256 times);

    mapping(address => uint256) public presales;

    uint256 public totalPatients;
    uint256 public totalCount = 9999;

    uint256 public maxBatch = 10;
    uint256 public price = 0.05 ether;

    string public baseURI;

    bool public started;
    bool public presaleStarted;

    MeatToken public meatToken;

    constructor(string memory name_, string memory symbol_, string memory baseURI_) ERC721(name_, symbol_) {
        baseURI = baseURI_;
    }

    function setBaseURI(string memory _newURI) external onlyOwner {
        baseURI = _newURI;
    }

    function setMeatToken(address token) external onlyOwner {
		meatToken = MeatToken(token);
	}

    function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
        require(_exists(tokenId), "Non-existent token");
        return bytes(baseURI).length > 0 ? string(abi.encodePacked(baseURI, tokenId.toString(), ".json")) : '.json';
    }

    function setStart(bool _start) external onlyOwner {
        started = _start;
    }

    function setPresaleStart(bool _start) external onlyOwner {
        presaleStarted = _start;
    }

    function setPresale(address _user, uint256 _times) external onlyOwner {
        presales[_user] = _times;
    }

    function premint(uint256 _times) payable external {
        require(presaleStarted && !started, "Presale not started");
        require(presales[_msgSender()] > 0 && _times <= presales[_msgSender()], "No presale for user");
        mintItem(_times, true);
    }

    function mint(uint256 _times) payable external {
        require(started, "Not started");
        require(_times > 0 && _times <= maxBatch, "Max mint reached");
        mintItem(_times, false);
    }

    function mintItem(uint256 _times, bool fromPremint) internal {
        require(totalPatients + _times <= totalCount, "Max supply hit");
        require(msg.value == _times * price, "Wrong mint price");
        payable(owner()).transfer(msg.value);
        if (fromPremint) {
            presales[_msgSender()] -= _times;
        }

        emit MintPatient(_msgSender(), totalPatients + 1, _times);
        meatToken.updateRewardOnMint(_msgSender(), _times);
        for(uint256 i = 0; i < _times; i++){
            _safeMint(_msgSender(), 1 + totalPatients++);
        }
    }

    fallback() external payable {}

    receive() external payable {}
}