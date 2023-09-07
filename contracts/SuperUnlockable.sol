// SPDX-License-Identifier: MIT
pragma solidity 0.8.16;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import {ISuperToken} from "@superfluid-finance/ethereum-contracts/contracts/interfaces/superfluid/ISuperfluid.sol";
import {SuperTokenV1Library} from "@superfluid-finance/ethereum-contracts/contracts/apps/SuperTokenV1Library.sol";

contract SuperUnlockable is ERC721URIStorage {
    uint256 public currentTokenId = 0;

    using SuperTokenV1Library for ISuperToken;

    ISuperToken internal immutable supportedToken;
    address public owner;
    uint256 public requiredDeposit;

    mapping(address => uint256) public userUsedDeposit;

    constructor(
        ISuperToken _supportedToken,
        uint256 _requiredDeposit
    ) ERC721("SuperUnlockable", "SUNx") {
        supportedToken = _supportedToken;
        owner = msg.sender;
        requiredDeposit = _requiredDeposit;
    }

    function setRequiredDeposit(uint256 _amount) public {
        require(msg.sender == owner, "Not owner");
        requiredDeposit = _amount;
    }

    function mintItem(
        address _to,
        string memory _tokenURI
    ) public returns (uint256) {
        (, int96 flowRate, uint256 deposit, ) = supportedToken.getFlowInfo(
            msg.sender,
            address(this)
        );
        require(flowRate > 0, "No flow");
        // Check if the user has enough remaining deposit to mint
        require(
            deposit - userUsedDeposit[msg.sender] >= requiredDeposit,
            "Not enough deposit to mint"
        );
        userUsedDeposit[msg.sender] += requiredDeposit;
        _safeMint(_to, currentTokenId);
        _setTokenURI(currentTokenId, _tokenURI);
        currentTokenId++;
        return currentTokenId - 1;
    }

    function getFlowInfo(
        ISuperToken _token,
        address _sender,
        address _receiver
    )
        public
        view
        returns (
            uint256 lastUpdated,
            int96 flowRate,
            uint256 deposit,
            uint256 owedDeposit
        )
    {
        return _token.getFlowInfo(_sender, _receiver);
    }
}
