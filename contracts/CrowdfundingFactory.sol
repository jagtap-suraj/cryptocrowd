// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Crowdfunding} from "./Crowdfunding.sol";

contract CrowdfundingFactory {
    address public owner;
    bool public paused;

    struct Campaign {
        address campaignAddress;
        address owner;
        string name;
        string imageHash; // IPFS hash for campaign image
        uint256 creationTime;
    }

    Campaign[] public campaigns;
    mapping(address => Campaign[]) public userCampaigns;

    event CampaignCreated(
        address indexed campaignAddress,
        address indexed owner,
        string name,
        string imageHash,
        uint256 timestamp
    );

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    modifier notPaused() {
        require(!paused, "Factory paused");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function createCampaign(
        string memory _name,
        string memory _description,
        string memory _imageHash,
        uint256 _goal,
        uint256 _durationInDays
    ) external notPaused {
        Crowdfunding newCampaign = new Crowdfunding(
            msg.sender,
            _name,
            _description,
            _imageHash,
            _goal,
            _durationInDays
        );

        Campaign memory campaign = Campaign({
            campaignAddress: address(newCampaign),
            owner: msg.sender,
            name: _name,
            imageHash: _imageHash,
            creationTime: block.timestamp
        });

        campaigns.push(campaign);
        userCampaigns[msg.sender].push(campaign);

        emit CampaignCreated(
            address(newCampaign),
            msg.sender,
            _name,
            _imageHash,
            block.timestamp
        );
    }

    function getUserCampaigns(address _user) external view returns (Campaign[] memory) {
        return userCampaigns[_user];
    }

    function getAllCampaigns() external view returns (Campaign[] memory) {
        return campaigns;
    }

    function togglePause() external onlyOwner {
        paused = !paused;
    }
}