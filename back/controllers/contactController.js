const ContactModel = require('../models/ContactModel');
const { validationResult } = require('express-validator');
const { AppError, asyncHandler } = require('../middleware/error');

/**
 * Get contacts for the logged-in lawyer
 * @route GET /api/contacts
 * @access Private (Lawyer)
 */
exports.getContacts = asyncHandler(async (req, res) => {
    const lawyerId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const searchTerm = req.query.searchTerm;

    ContactModel.getContactsByLawyerId(lawyerId, { page, limit, searchTerm }, (err, result) => {
        if (err) {
            throw new AppError('Failed to fetch contacts', 500, err);
        }
        res.status(200).json({ success: true, ...result });
    });
});

/**
 * Create a new contact for the logged-in lawyer
 * @route POST /api/contacts
 * @access Private (Lawyer)
 */
exports.createContact = asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        throw new AppError('Validation failed', 400, errors.array());
    }

    const lawyerId = req.user.id;
    const { name, email, phone, company, notes, isClient, clientId } = req.body;

    // Basic validation
    if (!name) {
         throw new AppError('Contact name is required.', 400);
    }

    const contactData = { lawyerId, name, email, phone, company, notes, isClient, clientId };

    ContactModel.createContact(contactData, (err, result) => {
        if (err) {
            // Handle potential foreign key constraint errors if clientId is invalid
             if (err.message.includes('FOREIGN KEY constraint failed')) {
                throw new AppError('Invalid Client ID provided.', 400);
            }
            throw new AppError('Failed to create contact', 500, err);
        }
        res.status(201).json({ success: true, message: 'Contact created successfully', contactId: result.contactId });
    });
});

/**
 * Get a specific contact by ID
 * @route GET /api/contacts/:contactId
 * @access Private (Lawyer)
 */
exports.getContactById = asyncHandler(async (req, res) => {
     const errors = validationResult(req);
    if (!errors.isEmpty()) {
        throw new AppError('Validation failed', 400, errors.array());
    }

    const lawyerId = req.user.id;
    const contactId = parseInt(req.params.contactId, 10);

    ContactModel.getContactById(contactId, lawyerId, (err, contact) => {
        if (err) {
            throw new AppError('Failed to fetch contact', 500, err);
        }
        if (!contact) {
            throw new AppError('Contact not found or access denied', 404);
        }
        res.status(200).json({ success: true, contact });
    });
});


/**
 * Update a contact for the logged-in lawyer
 * @route PUT /api/contacts/:contactId
 * @access Private (Lawyer)
 */
exports.updateContact = asyncHandler(async (req, res) => {
     const errors = validationResult(req);
    if (!errors.isEmpty()) {
        throw new AppError('Validation failed', 400, errors.array());
    }

    const lawyerId = req.user.id;
    const contactId = parseInt(req.params.contactId, 10);
    const { name, email, phone, company, notes, isClient, clientId } = req.body;

    const contactData = { name, email, phone, company, notes, isClient, clientId };
    // Remove undefined fields so the model update works correctly
    Object.keys(contactData).forEach(key => contactData[key] === undefined && delete contactData[key]);

    ContactModel.updateContact(contactId, lawyerId, contactData, (err, result) => {
        if (err) {
             // Handle potential foreign key constraint errors if clientId is invalid
             if (err.message.includes('FOREIGN KEY constraint failed')) {
                throw new AppError('Invalid Client ID provided.', 400);
            }
            throw new AppError('Failed to update contact', 500, err);
        }
        if (result.changes === 0) {
             throw new AppError('Contact not found or access denied', 404);
        }
        res.status(200).json({ success: true, message: 'Contact updated successfully' });
    });
});

/**
 * Delete a contact for the logged-in lawyer
 * @route DELETE /api/contacts/:contactId
 * @access Private (Lawyer)
 */
exports.deleteContact = asyncHandler(async (req, res) => {
     const errors = validationResult(req);
    if (!errors.isEmpty()) {
        throw new AppError('Validation failed', 400, errors.array());
    }

    const lawyerId = req.user.id;
    const contactId = parseInt(req.params.contactId, 10);

    ContactModel.deleteContact(contactId, lawyerId, (err, result) => {
        if (err) {
            throw new AppError('Failed to delete contact', 500, err);
        }
         if (result.changes === 0) {
             throw new AppError('Contact not found or access denied', 404);
        }
        res.status(200).json({ success: true, message: 'Contact deleted successfully' });
    });
});