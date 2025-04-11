// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Crowdfunding} from "./Crowdfunding.sol";

contract CrowdfundingFactory {
    address public owner;
    bool public isFactoryDisabled;

    struct FactoryCampaign {
        address campaignAddress;
        string name;
        string imageHash;
        uint256 creationTime;
    }

    FactoryCampaign[] public campaigns;
    mapping(address => uint256) public campaignIndices; // Track indices for faster lookup
    mapping(address => address[]) public userCampaignAddresses; // Just store addresses for user campaigns

    uint256 public constant MAX_CAMPAIGNS_PER_USER = 100;

    mapping(address => address[]) public backerCampaigns; // Tracks campaigns a backer has funded
    mapping(address => bool) public isOurCampaign; // Track campaigns created by the factory

    /// @notice Emitted when a new campaign is created.
    /// @param campaignAddress The address of the new campaign.
    /// @param owner The address of the campaign owner.
    /// @param name The name of the campaign.
    /// @param imageHash The IPFS hash of the campaign image.
    /// @param timestamp The timestamp of the campaign creation.
    event CampaignCreated(
        address campaignAddress,
        address owner,
        string name,
        string imageHash,
        uint256 timestamp
    );

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    modifier notDisabled() {
        require(!isFactoryDisabled, "Factory disabled");
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
    ) external notDisabled {
        require(_durationInDays > 0, "Duration must be > 0");
        require(_goal > 0, "Goal must be > 0");
        require(userCampaignAddresses[msg.sender].length < MAX_CAMPAIGNS_PER_USER, "Max campaigns reached");
        
        Crowdfunding newCampaign = new Crowdfunding(
            msg.sender,
            _name,
            _description,
            _imageHash,
            _goal,
            _durationInDays,
            owner,
            address(this) // Pass factory address to campaign
        );

        FactoryCampaign memory campaign = FactoryCampaign({
            campaignAddress: address(newCampaign),
            name: _name,
            imageHash: _imageHash,
            creationTime: block.timestamp
        });

        // Store the campaign index for faster lookups
        uint256 newIndex = campaigns.length;
        campaignIndices[address(newCampaign)] = newIndex;
        campaigns.push(campaign);
        
        // Only store addresses in userCampaignAddresses
        userCampaignAddresses[msg.sender].push(address(newCampaign));

        // Mark the campaign as created by the factory
        isOurCampaign[address(newCampaign)] = true;

        emit CampaignCreated(
            address(newCampaign),
            msg.sender,
            _name,
            _imageHash,
            block.timestamp
        );
    }

    /// @notice Returns the addresses of all campaigns created by the specified user.
    /// @param _user The address of the user.
    /// @return An array of campaign addresses.
    function getUserCampaignAddresses(address _user) external view returns (address[] memory) {
        return userCampaignAddresses[_user];
    }

    function getAllCampaignAddresses() external view returns (address[] memory) {
        address[] memory campaignAddresses = new address[](campaigns.length);

        for (uint i = 0; i < campaigns.length; i++) {
            campaignAddresses[i] = campaigns[i].campaignAddress;
        }

        return campaignAddresses;
    }

    function toggleFactoryDisabled() external onlyOwner {
        isFactoryDisabled = !isFactoryDisabled;
    }

    // To be used in crowdfunding.sol
    function trackBackerContribution(address _backer, address _campaign) external {
        require(isOurCampaign[msg.sender], "Only our campaigns can call this");
        require(_campaign == msg.sender, "Campaign can only track its own contributions");
        
        // Check if this campaign is already tracked for this backer
        bool alreadyTracked = false;
        address[] storage backedCampaigns = backerCampaigns[_backer];
        
        for (uint i = 0; i < backedCampaigns.length; i++) {
            if (backedCampaigns[i] == _campaign) {
                alreadyTracked = true;
                break;
            }
        }
        
        // Only add if not already tracked
        if (!alreadyTracked) {
            backerCampaigns[_backer].push(_campaign);
        }
    }

    function getBackerCampaignAddresses(address _backer) external view returns (address[] memory) {
        return backerCampaigns[_backer];
    }

    /// @notice Returns the donations made by the caller.
    /// @return An array of backer donations.
    function getBackerDonations(address _backer) external view returns (Crowdfunding.BackerDonation[] memory) {
        address[] memory backedCampaigns = backerCampaigns[_backer];
        
        Crowdfunding.BackerDonation[] memory donations = new Crowdfunding.BackerDonation[](backedCampaigns.length);

        for (uint i = 0; i < backedCampaigns.length; i++) {
            address campaignAddress = backedCampaigns[i];
            uint256 donatedAmount = Crowdfunding(campaignAddress).getBackerContribution(_backer);
            donations[i] = Crowdfunding.BackerDonation(campaignAddress, donatedAmount);
        }

        return donations;
    }

    // For testing
    function toggleCampaignState(address _campaign, Crowdfunding.CampaignState _newState) external onlyOwner {
        require(isOurCampaign[_campaign], "Invalid campaign");
        Crowdfunding(_campaign).setCampaignState(_newState);
    }
}