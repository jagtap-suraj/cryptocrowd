// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

interface ICrowdfundingFactory {
    function trackBackerContribution(address _backer, address _campaign) external;
}

contract Crowdfunding is ReentrancyGuard {
    string public name;
    string public description;
    string public imageHash; // IPFS hash for campaign image
    uint256 public goal;
    uint256 public deadline;
    address public owner;
    bool public isDisabled; // Renamed from `paused`

    enum CampaignState { Active, Successful, Failed }
    CampaignState public state;

    struct Backer {
        uint256 totalContribution;
    }

    struct BackerDonation {
        address campaignAddress;
        uint256 donatedAmount;
    }

    struct CampaignDetails {
        address campaignAddress;
        string name;
        string description;
        string imageHash;
        uint256 goal;
        uint256 deadline;
        uint256 balance;
        uint8 state;
        address owner;
        bool isDisabled;
    }

    mapping(address => Backer) public backers;

    event Funded(address indexed backer, uint256 amount);
    event Withdrawn(uint256 amount);
    event DeadlineExtended(uint256 newDeadline);
    event DisabledToggled(bool indexed isDisabled); // Renamed from `Paused`
    event GoalChanged(uint256 indexed newGoal);
    event Refunded(address indexed backer, uint256 amount);
    event CommissionCharged(address indexed factoryOwner, uint256 amount);
    event BackerContribution(address indexed backer, address indexed campaign, uint256 amount);
    event CampaignDetailsUpdated(string indexed name, string indexed description, string indexed imageHash);

    uint256 public constant MAX_DURATION = 365 days; // 1 year
    uint256 public constant MAX_GOAL = 10000 ether; // 10000 ETH
    uint256 public constant REFUND_WINDOW = 7 days; // Constant for refund window
    uint256 public refundDeadline;

    address public factoryOwner; // Factory owner address
    address public factoryAddress; // Factory contract address

    uint256 public backerCount; // Number of backers

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    modifier onlyFactoryOwner() {
        require(msg.sender == factoryOwner, "Not factory owner");
        _;
    }

    modifier onlyFactory() {
        require(msg.sender == factoryAddress, "Not factory");
        _;
    }

    modifier campaignActive() {
        require(state == CampaignState.Active, "Campaign not active");
        _;
    }

    modifier notDisabled() {
        require(!isDisabled, "Contract disabled");
        _;
    }

    modifier checkState() {
        _checkCampaignState();
        _;
    }
    
    constructor(
        address _owner,
        string memory _name,
        string memory _description,
        string memory _imageHash,
        uint256 _goal,
        uint256 _durationInDays,
        address _factoryOwner,
        address _factoryAddress // New parameter
    ) {
        require(_goal <= MAX_GOAL, "Goal exceeds maximum");
        require(_durationInDays * 1 days <= MAX_DURATION, "Duration exceeds maximum");

        name = _name;
        description = _description;
        imageHash = _imageHash;
        goal = _goal;
        deadline = block.timestamp + (_durationInDays * 1 days);
        owner = _owner;
        factoryOwner = _factoryOwner;
        factoryAddress = _factoryAddress; // Store the factory address
        state = CampaignState.Active;
    }

    // Private function to check state
    function _checkCampaignState() private {
        if (state == CampaignState.Active) {
            if (block.timestamp >= deadline) {
                state = address(this).balance >= goal 
                    ? CampaignState.Successful 
                    : CampaignState.Failed;
                if (state == CampaignState.Failed) {
                    refundDeadline = block.timestamp + REFUND_WINDOW;
                }
            } else if (address(this).balance >= goal) {
                state = CampaignState.Successful;
            }
        }
    }

    // Public function to manually check state
    function checkCampaignState() public {
        _checkCampaignState();
    }

    function fund() external payable campaignActive notDisabled nonReentrant {
        require(msg.value > 0, "Amount must be > 0");
        if (backers[msg.sender].totalContribution == 0 && msg.value > 0) {
            backerCount++;
        }
        backers[msg.sender].totalContribution += msg.value;

        // Notify the factory of the contribution
        ICrowdfundingFactory(factoryAddress).trackBackerContribution(msg.sender, address(this));

        emit BackerContribution(msg.sender, address(this), msg.value);
        emit Funded(msg.sender, msg.value);

        // Check the campaign state after updating the balance
        _checkCampaignState();
    }

    function withdraw() external onlyOwner checkState nonReentrant {
        require(state == CampaignState.Successful, "Not successful");
        
        uint256 balance = address(this).balance;
        require(balance > 0, "No balance");

        (bool success, ) = payable(owner).call{value: balance}("");
        require(success, "Transfer failed");
        emit Withdrawn(balance);
    }

    function refund() external checkState nonReentrant {
        require(state == CampaignState.Failed, "Campaign not failed");
        require(block.timestamp <= deadline + REFUND_WINDOW, "Refund window closed");

        uint256 contribution = backers[msg.sender].totalContribution;
        require(contribution > 0, "No contribution to refund");

        // Reset the backer's contribution
        backers[msg.sender].totalContribution = 0;

        // Transfer the funds back to the backer
        (bool success, ) = payable(msg.sender).call{value: contribution}("");
        require(success, "Transfer failed");

        emit Refunded(msg.sender, contribution);
    }

    function chargeCommission() external checkState nonReentrant {
        require(state == CampaignState.Failed, "Campaign not failed");
        require(block.timestamp > refundDeadline, "Refund window still open");
        require(msg.sender == factoryOwner, "Only factory owner can charge commission");

        uint256 balance = address(this).balance;
        require(balance > 0, "No balance to charge");

        // Transfer the balance to the factory owner
        (bool success, ) = payable(factoryOwner).call{value: balance}("");
        require(success, "Transfer failed");

        emit CommissionCharged(factoryOwner, balance);
    }

    /// @notice Returns the current balance of the campaign contract.
    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }

    /// @notice Toggles the disabled state of the campaign.
    /// @dev Only the owner can call this function.
    function toggleDisabled() external onlyOwner campaignActive {
        isDisabled = !isDisabled;
        emit DisabledToggled(isDisabled);
    }
    
    /// @notice Returns the details of the campaign.
    /// @dev This function calculates the current state without updating the state variable.
    function getCampaignDetails() external view returns (CampaignDetails memory) {
        // Calculate current state without updating state variable
        CampaignState currentState = state;
        
        if (currentState == CampaignState.Active) {
            if (block.timestamp >= deadline) {
                currentState = address(this).balance >= goal 
                    ? CampaignState.Successful 
                    : CampaignState.Failed;
            } else if (address(this).balance >= goal) {
                currentState = CampaignState.Successful;
            }
        }
        
        return CampaignDetails(
            address(this),
            name,
            description,
            imageHash,
            goal,
            deadline,
            address(this).balance,
            uint8(currentState), // Use calculated state instead of state variable
            owner,
            isDisabled
        );
    }

    function updateCampaignDetails(
        uint256 _newGoal,
        uint256 _additionalDays,
        string memory _name,
        string memory _description,
        string memory _imageHash
    ) external onlyOwner campaignActive {
        // Update goal if provided
        if (_newGoal > 0) {
            require(_newGoal <= MAX_GOAL, "New goal exceeds maximum");
            require(_newGoal >= goal, "New goal must be equal to or greater than current goal");
            goal = _newGoal;
            emit GoalChanged(_newGoal);
        }

        // Extend deadline if provided
        if (_additionalDays > 0) {
            require(_additionalDays * 1 days <= MAX_DURATION, "Extension too long");
            uint256 newDeadline = deadline + (_additionalDays * 1 days);
            uint256 maxDeadline = block.timestamp + (2 * (deadline - block.timestamp)); // Twice the remaining duration
            require(newDeadline <= maxDeadline, "Deadline cannot be extended more than twice the original");
            deadline = newDeadline;
            emit DeadlineExtended(deadline);
        }

        // Update name if provided
        if (bytes(_name).length > 0) {
            name = _name;
        }

        // Update description if provided
        if (bytes(_description).length > 0) {
            description = _description;
        }

        // Update image hash if provided
        if (bytes(_imageHash).length > 0) {
            imageHash = _imageHash;
        }

        // Emit event for updated campaign details
        emit CampaignDetailsUpdated(_name, _description, _imageHash);
    }

    /// @notice Returns the total contribution of the caller to this campaign.
    /// @return The total contribution of the caller.
    function getBackerContribution(address _backer) external view returns (uint256) {
        return backers[_backer].totalContribution;
    }
    
    // For testing
    function setCampaignState(CampaignState _newState) external onlyFactory {
        require(state == CampaignState.Active, "Campaign must be active");
        require(_newState == CampaignState.Successful || _newState == CampaignState.Failed, "Invalid state");

        state = _newState;
        
        if (state == CampaignState.Failed) {
            refundDeadline = block.timestamp + REFUND_WINDOW;
        }
    }
}