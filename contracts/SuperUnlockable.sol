// SPDX-License-Identifier: MIT
pragma solidity 0.8.16;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import {ISuperToken} from "@superfluid-finance/ethereum-contracts/contracts/interfaces/superfluid/ISuperfluid.sol";
import {SuperTokenV1Library} from "@superfluid-finance/ethereum-contracts/contracts/apps/SuperTokenV1Library.sol";

contract SuperUnlockable is ERC721URIStorage {
    using SuperTokenV1Library for ISuperToken;
    ISuperToken internal immutable supportedToken;

    uint256 public currentTokenId = 0;
    address public owner;
    uint256 public requiredDeposit;

    constructor(
        ISuperToken _supportedToken,
        uint256 _requiredDeposit
    ) ERC721("SuperUnlockable", "SUNx") {
        supportedToken = _supportedToken;
        owner = msg.sender;
        requiredDeposit = _requiredDeposit;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "SuperUnlockable: No permission");
        _;
    }

    function setRequiredDeposit(uint256 _amount) public onlyOwner {
        requiredDeposit = _amount;
    }

    function mintItem(address _to, string memory _tokenURI) public {
        (uint256 lastUpdated, int96 flowRate, , ) = supportedToken.getFlowInfo(
            msg.sender,
            address(this)
        );
        uint256 totalDeposited = uint256(uint96(flowRate)) *
            (block.timestamp - lastUpdated);
        require(
            totalDeposited >= requiredDeposit,
            "SuperUnlockable: Not enough deposit"
        );
        _safeMint(_to, currentTokenId);
        _setTokenURI(currentTokenId, _tokenURI);
        currentTokenId++;
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
