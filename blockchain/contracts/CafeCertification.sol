
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title CafeCertification
 * @author Academic Blockchain Project
 * @notice Simulates the administrative certification workflow
 *         for opening a first-category cafe in Tunisia.
 *
 * Main workflow:
 * Municipality + Civil Protection (parallel)
 *                |
 *          Tax Office
 *
 * Optional complementary procedures:
 * RNE and CNSS (independent, after Tax Office approval).
 */

contract CafeCertification {

    // =========================================================
    // 1. ENUMERATIONS
    // =========================================================

    enum Role {
        None,
        Admin,
        Entrepreneur,
        Municipality,
        CivilProtection,
        TaxOffice,
        RNE,
        CNSS
    }

    enum ValidationStatus {
        NotRequested,
        Pending,
        Approved,
        Rejected
    }

    enum MainStatus {
        AwaitingInitialValidations,
        AwaitingTaxOffice,
        CorrectionRequired,
        Completed
    }

    // =========================================================
    // 2. STRUCTURES
    // =========================================================

    struct Validation {
        ValidationStatus status;
        address decidedBy;
        uint256 decidedAt;
        string rejectionReason;
        string correctionNote;
        uint256 attempts;
    }

    struct Attachment {
        string attachmentId;
        string filename;
        string documentType;
        string sha256Hash;
        string storageReference;
        address uploadedBy;
        uint256 uploadedAt;
    }

    struct Application {
        uint256 id;
        address owner;

        string cafeName;
        string establishmentAddress;

        uint256 coveredArea;
        uint256 employeeCount;

        uint256 createdAt;

        Validation municipality;
        Validation civilProtection;
        Validation taxOffice;

        Validation rne;
        Validation cnss;
    }

    // =========================================================
    // 3. STATE VARIABLES
    // =========================================================

    address public administrator;

    mapping(address => Role) public roleOf;
    mapping(Role => address) public representativeOf;

    mapping(uint256 => Application) private applications;

    mapping(uint256 => Attachment[]) private applicationAttachments;

    mapping(address => uint256[]) private ownerApplications;

    uint256[] private allApplicationIds;

    uint256 public nextApplicationId = 1;

    // =========================================================
    // 4. EVENTS
    // =========================================================

    event RoleAssigned(
        address indexed account,
        Role indexed role
    );

    event RoleRevoked(
        address indexed account,
        Role indexed role
    );

    event ApplicationCreated(
        uint256 indexed applicationId,
        address indexed entrepreneur,
        string cafeName
    );

    event ValidationOpened(
        uint256 indexed applicationId,
        Role indexed organization
    );

    event ValidationDecided(
        uint256 indexed applicationId,
        Role indexed organization,
        bool approved,
        address indexed validator,
        string reason
    );

    event ValidationResubmitted(
        uint256 indexed applicationId,
        Role indexed organization,
        address indexed entrepreneur,
        string correctionNote
    );

    event SupplementaryValidationRequested(
        uint256 indexed applicationId,
        Role indexed organization
    );

    event ApplicationCompleted(
        uint256 indexed applicationId,
        address indexed entrepreneur
    );

    event AttachmentAdded(
        uint256 indexed applicationId,
        string attachmentId,
        string filename,
        string documentType,
        string sha256Hash,
        address indexed uploadedBy
    );

    // =========================================================
    // 5. MODIFIERS
    // =========================================================

    modifier onlyAdmin() {
        require(
            roleOf[msg.sender] == Role.Admin,
            "Access denied: Admin only"
        );
        _;
    }

    modifier onlyEntrepreneur() {
        require(
            roleOf[msg.sender] == Role.Entrepreneur,
            "Access denied: Entrepreneur only"
        );
        _;
    }

    // =========================================================
    // 6. CONSTRUCTOR
    // =========================================================

    constructor() {
        administrator = msg.sender;

        roleOf[msg.sender] = Role.Admin;
        representativeOf[Role.Admin] = msg.sender;
    }

    // =========================================================
    // 7. ROLE MANAGEMENT
    // =========================================================

    function assignRole(
        address account,
        Role role
    ) external onlyAdmin {

        require(account != address(0), "Invalid address");

        require(
            role != Role.None && role != Role.Admin,
            "Invalid role"
        );

        Role previousRole = roleOf[account];

        require(
            previousRole != Role.Admin,
            "Cannot reassign administrator"
        );

        // Remove the account's previous role if necessary.
        if (previousRole != Role.None) {
            representativeOf[previousRole] = address(0);
        }

        // Replace the previous representative of this role.
        address previousRepresentative = representativeOf[role];

        if (previousRepresentative != address(0)) {
            roleOf[previousRepresentative] = Role.None;
        }

        roleOf[account] = role;
        representativeOf[role] = account;

        emit RoleAssigned(account, role);
    }

    function revokeRole(
        Role role
    ) external onlyAdmin {

        require(
            role != Role.None && role != Role.Admin,
            "Cannot revoke this role"
        );

        address account = representativeOf[role];

        require(
            account != address(0),
            "Role has no representative"
        );

        roleOf[account] = Role.None;
        representativeOf[role] = address(0);

        emit RoleRevoked(account, role);
    }

    // =========================================================
    // 8. APPLICATION CREATION
    // =========================================================

    function createApplication(
        string calldata cafeName,
        string calldata establishmentAddress,
        uint256 coveredArea,
        uint256 employeeCount
    ) external onlyEntrepreneur returns (uint256) {

        require(
            bytes(cafeName).length > 0,
            "Cafe name required"
        );

        require(
            bytes(establishmentAddress).length > 0,
            "Address required"
        );

        require(
            coveredArea > 0,
            "Invalid covered area"
        );

        uint256 applicationId = nextApplicationId++;

        Application storage app = applications[applicationId];

        app.id = applicationId;
        app.owner = msg.sender;

        app.cafeName = cafeName;
        app.establishmentAddress = establishmentAddress;

        app.coveredArea = coveredArea;
        app.employeeCount = employeeCount;

        app.createdAt = block.timestamp;

        // Both initial organizations can evaluate independently.
        app.municipality.status = ValidationStatus.Pending;
        app.civilProtection.status = ValidationStatus.Pending;

        // The tax step is activated only after both approvals.
        app.taxOffice.status = ValidationStatus.NotRequested;

        // Complementary procedures are optional.
        app.rne.status = ValidationStatus.NotRequested;
        app.cnss.status = ValidationStatus.NotRequested;

        ownerApplications[msg.sender].push(applicationId);
        allApplicationIds.push(applicationId);

        emit ApplicationCreated(
            applicationId,
            msg.sender,
            cafeName
        );

        emit ValidationOpened(
            applicationId,
            Role.Municipality
        );

        emit ValidationOpened(
            applicationId,
            Role.CivilProtection
        );

        return applicationId;
    }

    // =========================================================
    // 9. APPLICATION CONSULTATION
    // =========================================================

    function getApplication(
        uint256 applicationId
    ) external view returns (Application memory) {

        Application storage app = applications[applicationId];

        require(
            app.id != 0,
            "Application does not exist"
        );

        require(
            msg.sender == app.owner ||
            roleOf[msg.sender] == Role.Admin,
            "Access denied"
        );

        return app;
    }

    function getMyApplicationIds()
        external
        view
        onlyEntrepreneur
        returns (uint256[] memory)
    {
        return ownerApplications[msg.sender];
    }

    function getPendingApplicationIds()
        external
        view
        returns (uint256[] memory)
    {
        Role currentRole = roleOf[msg.sender];

        require(
            _isOrganization(currentRole),
            "Organization access only"
        );

        uint256 count = 0;

        for (uint256 i = 0; i < allApplicationIds.length; i++) {
            Application storage app =
                applications[allApplicationIds[i]];

            if (_isPendingForRole(app, currentRole)) {
                count++;
            }
        }

        uint256[] memory result = new uint256[](count);

        uint256 index = 0;

        for (uint256 i = 0; i < allApplicationIds.length; i++) {
            uint256 applicationId = allApplicationIds[i];

            if (
                _isPendingForRole(
                    applications[applicationId],
                    currentRole
                )
            ) {
                result[index] = applicationId;
                index++;
            }
        }

        return result;
    }

    function getAllApplicationIds()
        external
        view
        onlyAdmin
        returns (uint256[] memory)
    {
        return allApplicationIds;
    }

    function getApplicationForReview(
        uint256 applicationId
    ) external view returns (Application memory) {

        Application storage app = applications[applicationId];

        require(
            app.id != 0,
            "Application does not exist"
        );

        Role currentRole = roleOf[msg.sender];

        require(
            _isOrganization(currentRole),
            "Organization access only"
        );

        require(
            _isPendingForRole(app, currentRole),
            "Application not available for review"
        );

        return app;
    }

    // =========================================================
    // 10. ADMINISTRATIVE VALIDATIONS
    // =========================================================

    function decideValidation(
        uint256 applicationId,
        Role organization,
        bool approved,
        string calldata reason
    ) external {

        require(
            roleOf[msg.sender] == organization,
            "Wrong organization"
        );

        require(
            _isOrganization(organization),
            "Invalid organization"
        );

        Application storage app = applications[applicationId];

        require(
            app.id != 0,
            "Application does not exist"
        );

        require(
            _isPendingForRole(app, organization),
            "Validation is not pending"
        );

        if (!approved) {
            require(
                bytes(reason).length > 0,
                "Rejection reason required"
            );
        }

        Validation storage validation =
            _getValidation(app, organization);

        _recordDecision(validation, approved, reason);

        emit ValidationDecided(
            applicationId,
            organization,
            approved,
            msg.sender,
            reason
        );

        // Activate the tax validation when both
        // independent initial validations are approved.
        if (
            organization == Role.Municipality ||
            organization == Role.CivilProtection
        ) {
            if (
                app.municipality.status == ValidationStatus.Approved &&
                app.civilProtection.status == ValidationStatus.Approved &&
                app.taxOffice.status == ValidationStatus.NotRequested
            ) {
                app.taxOffice.status = ValidationStatus.Pending;

                emit ValidationOpened(
                    applicationId,
                    Role.TaxOffice
                );
            }
        }

        // Complete the main administrative process.
        if (
            organization == Role.TaxOffice &&
            approved
        ) {
            emit ApplicationCompleted(
                applicationId,
                app.owner
            );
        }
    }

    // =========================================================
    // 11. CORRECTION AND RESUBMISSION
    // =========================================================

    function resubmitRejectedValidation(
        uint256 applicationId,
        Role organization,
        string calldata correctionNote
    ) external onlyEntrepreneur {

        Application storage app = applications[applicationId];

        require(
            app.id != 0,
            "Application does not exist"
        );

        require(
            app.owner == msg.sender,
            "Not application owner"
        );

        require(
            bytes(correctionNote).length > 0,
            "Correction note required"
        );

        require(
            _isOrganization(organization),
            "Invalid organization"
        );

        Validation storage validation =
            _getValidation(app, organization);

        require(
            validation.status == ValidationStatus.Rejected,
            "Validation is not rejected"
        );

        // Additional workflow checks.
        if (organization == Role.TaxOffice) {
            require(
                app.municipality.status == ValidationStatus.Approved &&
                app.civilProtection.status == ValidationStatus.Approved,
                "Initial validations incomplete"
            );
        }

        if (organization == Role.RNE || organization == Role.CNSS) {
            require(
                app.taxOffice.status == ValidationStatus.Approved,
                "Tax validation required"
            );
        }

        if (organization == Role.CNSS) {
            require(
                app.employeeCount > 0,
                "No employees declared"
            );
        }

        validation.status = ValidationStatus.Pending;
        validation.decidedBy = address(0);
        validation.decidedAt = 0;
        validation.rejectionReason = "";
        validation.correctionNote = correctionNote;

        emit ValidationResubmitted(
            applicationId,
            organization,
            msg.sender,
            correctionNote
        );

        emit ValidationOpened(
            applicationId,
            organization
        );
    }

    // =========================================================
    // 12. OPTIONAL COMPLEMENTARY PROCEDURES
    // =========================================================

    function requestSupplementaryValidation(
        uint256 applicationId,
        Role organization
    ) external onlyEntrepreneur {

        Application storage app = applications[applicationId];

        require(
            app.id != 0,
            "Application does not exist"
        );

        require(
            app.owner == msg.sender,
            "Not application owner"
        );

        require(
            app.taxOffice.status == ValidationStatus.Approved,
            "Tax validation required first"
        );

        require(
            organization == Role.RNE ||
            organization == Role.CNSS,
            "Invalid supplementary organization"
        );

        if (organization == Role.CNSS) {
            require(
                app.employeeCount > 0,
                "No employees declared"
            );
        }

        Validation storage validation =
            _getValidation(app, organization);

        require(
            validation.status == ValidationStatus.NotRequested,
            "Already requested or processed"
        );

        validation.status = ValidationStatus.Pending;

        emit SupplementaryValidationRequested(
            applicationId,
            organization
        );

        emit ValidationOpened(
            applicationId,
            organization
        );
    }

    // =========================================================
    // 13. MAIN WORKFLOW STATUS
    // =========================================================

    function getMainStatus(
        uint256 applicationId
    ) external view returns (MainStatus) {

        Application storage app = applications[applicationId];

        require(
            app.id != 0,
            "Application does not exist"
        );

        require(
            msg.sender == app.owner ||
            roleOf[msg.sender] == Role.Admin,
            "Access denied"
        );

        if (
            app.taxOffice.status == ValidationStatus.Approved
        ) {
            return MainStatus.Completed;
        }

        if (
            app.municipality.status == ValidationStatus.Rejected ||
            app.civilProtection.status == ValidationStatus.Rejected ||
            app.taxOffice.status == ValidationStatus.Rejected
        ) {
            return MainStatus.CorrectionRequired;
        }

        if (
            app.municipality.status == ValidationStatus.Approved &&
            app.civilProtection.status == ValidationStatus.Approved
        ) {
            return MainStatus.AwaitingTaxOffice;
        }

        return MainStatus.AwaitingInitialValidations;
    }

    // =========================================================
    // 14. ATTACHMENT MANAGEMENT
    // =========================================================

    function addAttachment(
        uint256 applicationId,
        string calldata attachmentId,
        string calldata filename,
        string calldata documentType,
        string calldata sha256Hash,
        string calldata storageReference
    ) external {

        Application storage app = applications[applicationId];

        require(
            app.id != 0,
            "Application does not exist"
        );

        require(
            app.owner == msg.sender,
            "Not application owner"
        );

        require(
            bytes(attachmentId).length > 0,
            "Attachment ID required"
        );

        require(
            bytes(filename).length > 0,
            "Filename required"
        );

        require(
            bytes(documentType).length > 0,
            "Document type required"
        );

        require(
            bytes(sha256Hash).length > 0,
            "SHA-256 hash required"
        );

        require(
            bytes(storageReference).length > 0,
            "Storage reference required"
        );

        applicationAttachments[applicationId].push(
            Attachment({
                attachmentId: attachmentId,
                filename: filename,
                documentType: documentType,
                sha256Hash: sha256Hash,
                storageReference: storageReference,
                uploadedBy: msg.sender,
                uploadedAt: block.timestamp
            })
        );

        emit AttachmentAdded(
            applicationId,
            attachmentId,
            filename,
            documentType,
            sha256Hash,
            msg.sender
        );
    }

    function getAttachments(
        uint256 applicationId
    ) external view returns (Attachment[] memory) {

        Application storage app = applications[applicationId];

        require(
            app.id != 0,
            "Application does not exist"
        );

        Role currentRole = roleOf[msg.sender];

        require(
            msg.sender == app.owner ||
            currentRole == Role.Admin ||
            _isOrganization(currentRole),
            "Access denied"
        );

        return applicationAttachments[applicationId];
    }

    function getAttachmentCount(
        uint256 applicationId
    ) external view returns (uint256) {

        Application storage app = applications[applicationId];

        require(
            app.id != 0,
            "Application does not exist"
        );

        Role currentRole = roleOf[msg.sender];

        require(
            msg.sender == app.owner ||
            currentRole == Role.Admin ||
            _isOrganization(currentRole),
            "Access denied"
        );

        return applicationAttachments[applicationId].length;
    }

    // =========================================================
    // 15. INTERNAL HELPERS
    // =========================================================

    function _isOrganization(
        Role role
    ) internal pure returns (bool) {

        return (
            role == Role.Municipality ||
            role == Role.CivilProtection ||
            role == Role.TaxOffice ||
            role == Role.RNE ||
            role == Role.CNSS
        );
    }

    function _isPendingForRole(
        Application storage app,
        Role role
    ) internal view returns (bool) {

        if (role == Role.Municipality) {
            return app.municipality.status == ValidationStatus.Pending;
        }

        if (role == Role.CivilProtection) {
            return app.civilProtection.status == ValidationStatus.Pending;
        }

        if (role == Role.TaxOffice) {
            return app.taxOffice.status == ValidationStatus.Pending;
        }

        if (role == Role.RNE) {
            return app.rne.status == ValidationStatus.Pending;
        }

        if (role == Role.CNSS) {
            return app.cnss.status == ValidationStatus.Pending;
        }

        return false;
    }

    function _getValidation(
        Application storage app,
        Role role
    ) internal view returns (Validation storage) {

        if (role == Role.Municipality) {
            return app.municipality;
        }

        if (role == Role.CivilProtection) {
            return app.civilProtection;
        }

        if (role == Role.TaxOffice) {
            return app.taxOffice;
        }

        if (role == Role.RNE) {
            return app.rne;
        }

        if (role == Role.CNSS) {
            return app.cnss;
        }

        revert("Invalid organization");
    }

    function _recordDecision(
        Validation storage validation,
        bool approved,
        string calldata reason
    ) internal {

        validation.status = approved
            ? ValidationStatus.Approved
            : ValidationStatus.Rejected;

        validation.decidedBy = msg.sender;
        validation.decidedAt = block.timestamp;

        validation.attempts++;

        validation.rejectionReason = approved ? "" : reason;
    }
}
