// SPDX-License-Identifier: MIT

pragma solidity ^0.8.10;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract MentalAsylum is ERC721Enumerable, Ownable {
    using Strings for uint256;
    event MintPatient(address indexed sender, uint256 startWith, uint256 times);

    uint256 public totalPatients;
    uint256 public totalCount = 9999;

    uint256 public maxBatch = 10;
    uint256 public price = 50000000000000000;

    string public baseURI;

    bool private started;

    constructor(string memory name_, string memory symbol_, string memory baseURI_) ERC721(name_, symbol_) {
        baseURI = baseURI_;
    }

    //basic functions. 
    function _baseURI() internal view virtual override returns (string memory){
        return baseURI;
    }
    function setBaseURI(string memory _newURI) public onlyOwner {
        baseURI = _newURI;
    }

    function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
        require(_exists(tokenId), "ERC721Metadata: URI query for nonexistent token.");
        string memory baseURI = _baseURI();
        return bytes(baseURI).length > 0 ? string(abi.encodePacked(baseURI, tokenId.toString(), ".json")) : '.json';
    }
    function setStart(bool _start) public onlyOwner {
        started = _start;
    }

    function mint(uint256 _times) payable public {
        require(started, "not started");
        require(_times > 0 && _times <= maxBatch, "must mint fewer in each batch");
        require(totalPatients + _times <= totalCount, "max supply reached!");
        require(msg.value == _times * price, "value error, please check price.");
        payable(owner()).transfer(msg.value);
        emit MintPatient(_msgSender(), totalPatients + 1, _times);
        for(uint256 i = 0; i < _times; i++){
            _mint(_msgSender(), 1 + totalPatients++);
        }
    }  
}