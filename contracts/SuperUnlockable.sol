// SPDX-License-Identifier: MIT
pragma solidity 0.8.16;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {ISuperToken} from "@superfluid-finance/ethereum-contracts/contracts/interfaces/superfluid/ISuperfluid.sol";
import {SuperTokenV1Library} from "@superfluid-finance/ethereum-contracts/contracts/apps/SuperTokenV1Library.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/Base64.sol";

contract SuperUnlockable is ERC721 {
    using Strings for uint256;
    using Strings for int96;
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

    function tokenURI(
        uint256 tokenId
    ) public view override returns (string memory) {
        return getTokenURI(tokenId);
    }

    function getTokenURI(uint256 tokenId) public view returns (string memory) {
        address tokenOwner = ownerOf(tokenId);

        (uint256 lastUpdated, int96 flowRate, , ) = supportedToken.getFlowInfo(
            tokenOwner,
            address(this)
        );
        uint256 duration = block.timestamp - lastUpdated;
        uint256 totalDeposited = uint256(uint96(flowRate)) * duration;

        // Define the metadata attributes
        string memory name = string(
            abi.encodePacked("SuperUnlockable #", tokenId.toString())
        );
        string
            memory description = "An NFT from the SuperUnlockable collection, showcasing your money streaming powers";
        string
            memory imageURI = "https://ipfs.io/ipfs/QmPDYdFGZCEKXgsVmVq4CMH9JoPCYqyBfD2ELEg53LNd5G"; // Customize with the actual image URI

        // Create the JSON metadata object
        bytes memory json = abi.encodePacked(
            "{",
            '"name": "',
            name,
            '",',
            '"description": "',
            description,
            '",',
            '"image": "',
            imageURI,
            '",',
            '"attributes": [',
            '{"trait_type": "Power", "value": ',
            totalDeposited.toString(),
            "},",
            '{"trait_type": "Speed", "value": ',
            flowRate.toString(),
            "},",
            '{"trait_type": "Age", "value": ',
            duration.toString(),
            "}",
            "]",
            "}"
        );

        return
            string(
                abi.encodePacked(
                    "data:application/json;base64,",
                    Base64.encode(json)
                )
            );
    }

    function mintItem(address _to) public {
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
