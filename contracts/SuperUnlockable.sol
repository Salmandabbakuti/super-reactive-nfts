// SPDX-License-Identifier: MIT
pragma solidity 0.8.16;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {ISuperToken} from "@superfluid-finance/ethereum-contracts/contracts/interfaces/superfluid/ISuperfluid.sol";
import {SuperTokenV1Library} from "@superfluid-finance/ethereum-contracts/contracts/apps/SuperTokenV1Library.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/Base64.sol";

/// @title SuperUnlockable - Stream to Unlock In-Game Items with ever-evolving Levels
/// @author Salman Dev
/// @notice This contract allows users to mint in-game items with ever-evolving levels while they stream SuperTokens
/// @dev All function calls are currently implemented without side effects
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

    /// @notice Set the required deposit for minting
    /// @param _amount The amount of SuperToken deposit required to mint a new SuperUnlockable item
    /// @dev Only the owner can call this function
    function setRequiredDeposit(uint256 _amount) public onlyOwner {
        requiredDeposit = _amount;
    }

    /// @notice Withdraw the SuperToken funds from the contract
    /// @dev Only the owner can call this function
    function withdrawFunds() public onlyOwner {
        supportedToken.transfer(
            msg.sender,
            supportedToken.balanceOf(address(this))
        );
    }

    /// @notice deletes supportedToken flow from caller to contract
    function deleteFlowToContract() public returns (bool) {
        return supportedToken.deleteFlow(msg.sender, address(this));
    }

    /// @notice Mints a new SuperUnlockable item
    /// @param _to The address of the user who will receive the new SuperUnlockable item
    /// @dev This function will mint a new SuperUnlockable item if the user has deposited enough SuperTokens through a stream into the contract
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

    /// @notice Get the flow information for a user
    /// @param _token The address of the SuperToken
    /// @param _sender The address of the user who is sending the stream
    /// @param _receiver The address of the user who is receiving the stream
    /// @dev This function will return the flow information for a user
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

    /// @notice Get the URI for a token
    /// @param tokenId The ID of the token
    /// @dev This function will return token the URI in json based on the flow opened by the token owner. overrides ERC721 tokenURI function
    function tokenURI(
        uint256 tokenId
    ) public view override returns (string memory) {
        return _getTokenURI(tokenId);
    }

    /// @notice Prepare and return the URI for a token(internal)
    /// @param _tokenId The ID of the token
    /// @dev This function will return token the URI in json based on the flow opened by the token owner
    function _getTokenURI(
        uint256 _tokenId
    ) internal view returns (string memory) {
        address tokenOwner = ownerOf(_tokenId);

        (uint256 lastUpdated, int96 flowRate, , ) = supportedToken.getFlowInfo(
            tokenOwner,
            address(this)
        );
        uint256 duration = block.timestamp - lastUpdated;
        uint256 totalDeposited = uint256(uint96(flowRate)) * duration;
        uint256 age = lastUpdated == 0 ? 0 : block.timestamp - lastUpdated;

        // Define the metadata attributes
        string memory name = string(
            abi.encodePacked("FlowMancer #", _tokenId.toString())
        );
        string
            memory description = "Unleash your money-streaming powers with SuperUnlockable collection. These in-game items showcase your ever-evolving powers, speed, and age, all while you continue to stream";
        bytes memory svgImage = _generateSvgImageForToken(
            _tokenId,
            totalDeposited,
            flowRate,
            age
        );
        string memory imageURI = string(
            abi.encodePacked(
                "data:image/svg+xml;base64,",
                Base64.encode(svgImage)
            )
        );

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
            age.toString(),
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

    /// @notice Generate the SVG image for a token based on flow information
    /// @param _tokenId The ID of the token
    /// @param _power The total amount of SuperTokens deposited by the token owner
    /// @param _speed The flow rate of the stream
    /// @param _age The age of the stream since last update
    /// @dev This function will return the SVG image for a token based on flow information
    function _generateSvgImageForToken(
        uint256 _tokenId,
        uint256 _power,
        int96 _speed,
        uint256 _age
    ) internal pure returns (bytes memory) {
        bytes memory svgImage = abi.encodePacked(
            '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 350 350" fill="#161B1D">',
            '<g xmlns="http://www.w3.org/2000/svg" style="transform-origin:50% 50%;animation:rotate 10s linear infinite">',
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 350 350">',
            '<circle cx="50%" cy="50%" r="40%" fill="none" stroke-width="2.5" stroke="#10BB35" mask="url(#cut)"/>',
            "<defs>",
            '<mask id="cut">',
            '<circle cx="50%" cy="50%" r="40%" stroke-width="1.8" stroke="white"/>',
            '<line x1="240" y1="280" x2="10" y2="10" stroke="black" stroke-width="5.8" transform="rotate(305)" transform-origin="center"/>',
            '<line x1="240" y1="280" x2="10" y2="10" stroke="black" stroke-width="5.8" transform="rotate(315)" transform-origin="center"/>',
            '<line x1="240" y1="280" x2="10" y2="10" stroke="black" stroke-width="5.8" transform="rotate(325)" transform-origin="center"/>',
            "</mask>",
            "</defs>",
            "</svg>",
            _speed > 0
                ? '<animateTransform attributeName="transform" attributeType="XML" dur="5s" keyTimes="0;1" repeatCount="indefinite" type="rotate" values="0;360" calcMode="linear"/>'
                : "",
            "</g>",
            '<rect x="25%" y="25%" width="50%" height="50%" fill="#161B1D"/>',
            '<text x="50%" y="50%" text-anchor="middle" alignment-baseline="middle" font-size="48" fill="#fff">&#9889;</text>',
            '<text x="28%" y="65%" text-anchor="start" alignment-baseline="middle" font-size="5" fill="#fff">#',
            _tokenId.toString(),
            "</text>",
            '<text x="28%" y="68%" text-anchor="start" alignment-baseline="middle" font-size="5" fill="#fff">&#9889; ',
            _power.toString(),
            "</text>",
            '<text x="28%" y="71%" text-anchor="start" alignment-baseline="middle" font-size="5" fill="#fff">&#127939; ',
            _speed.toString(),
            "</text>",
            '<text x="28%" y="74%" text-anchor="start" alignment-baseline="middle" font-size="5" fill="#fff">&#8986; ',
            _age.toString(),
            "</text>",
            '<a xlink:href="https://superunlockable.vercel.app" target="_blank">',
            '<text x="50%" y="95%" text-anchor="start" alignment-baseline="middle" font-size="4" fill="#10BB35">With &#10084; By superunlockable.vercel.app</text>',
            "</a>",
            "</svg>"
        );
        return svgImage;
    }
}
