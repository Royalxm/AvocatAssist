const LawyerTemplateModel = require('../models/LawyerTemplateModel');
const { validationResult } = require('express-validator');
const { AppError, asyncHandler } = require('../middleware/error');

/**
 * Get custom templates for the logged-in lawyer
 * @route GET /api/lawyer-templates
 * @access Private (Lawyer)
 */
exports.getTemplates = asyncHandler(async (req, res) => {
    const lawyerId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const searchTerm = req.query.searchTerm;
    const category = req.query.category;

    LawyerTemplateModel.getTemplatesByLawyerId(lawyerId, { page, limit, searchTerm, category }, (err, result) => {
        if (err) {
            throw new AppError('Failed to fetch lawyer templates', 500, err);
        }
        res.status(200).json({ success: true, ...result });
    });
});

/**
 * Create a new custom template for the logged-in lawyer
 * @route POST /api/lawyer-templates
 * @access Private (Lawyer)
 */
exports.createTemplate = asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        throw new AppError('Validation failed', 400, errors.array());
    }

    const lawyerId = req.user.id;
    const { name, description, category, content } = req.body;

    if (!name || !content) {
         throw new AppError('Template name and content are required.', 400);
    }

    // Automatically extract variables from content
    const variables = LawyerTemplateModel.extractVariables(content);

    const templateData = { lawyerId, name, description, category, content, variables };

    LawyerTemplateModel.createTemplate(templateData, (err, result) => {
        if (err) {
            throw new AppError('Failed to create template', 500, err);
        }
        res.status(201).json({ success: true, message: 'Template created successfully', templateId: result.templateId });
    });
});

/**
 * Get a specific custom template by ID
 * @route GET /api/lawyer-templates/:templateId
 * @access Private (Lawyer)
 */
exports.getTemplateById = asyncHandler(async (req, res) => {
     const errors = validationResult(req);
    if (!errors.isEmpty()) {
        throw new AppError('Validation failed', 400, errors.array());
    }

    const lawyerId = req.user.id;
    const templateId = parseInt(req.params.templateId, 10);

    LawyerTemplateModel.getTemplateById(templateId, lawyerId, (err, template) => {
        if (err) {
            throw new AppError('Failed to fetch template', 500, err);
        }
        if (!template) {
            throw new AppError('Template not found or access denied', 404);
        }
        res.status(200).json({ success: true, template });
    });
});


/**
 * Update a custom template for the logged-in lawyer
 * @route PUT /api/lawyer-templates/:templateId
 * @access Private (Lawyer)
 */
exports.updateTemplate = asyncHandler(async (req, res) => {
     const errors = validationResult(req);
    if (!errors.isEmpty()) {
        throw new AppError('Validation failed', 400, errors.array());
    }

    const lawyerId = req.user.id;
    const templateId = parseInt(req.params.templateId, 10);
    const { name, description, category, content } = req.body;

    // If content is updated, re-extract variables
    let variables;
    if (content !== undefined) {
        variables = LawyerTemplateModel.extractVariables(content);
    }

    const templateData = { name, description, category, content, variables };
    // Remove undefined fields so the model update works correctly
    Object.keys(templateData).forEach(key => templateData[key] === undefined && delete templateData[key]);

    // Ensure at least one field is being updated
     if (Object.keys(templateData).length === 0) {
        throw new AppError('No valid fields provided for update.', 400);
    }


    LawyerTemplateModel.updateTemplate(templateId, lawyerId, templateData, (err, result) => {
        if (err) {
            throw new AppError('Failed to update template', 500, err);
        }
        if (result.changes === 0) {
             throw new AppError('Template not found or access denied', 404);
        }
        res.status(200).json({ success: true, message: 'Template updated successfully' });
    });
});

/**
 * Delete a custom template for the logged-in lawyer
 * @route DELETE /api/lawyer-templates/:templateId
 * @access Private (Lawyer)
 */
exports.deleteTemplate = asyncHandler(async (req, res) => {
     const errors = validationResult(req);
    if (!errors.isEmpty()) {
        throw new AppError('Validation failed', 400, errors.array());
    }

    const lawyerId = req.user.id;
    const templateId = parseInt(req.params.templateId, 10);

    LawyerTemplateModel.deleteTemplate(templateId, lawyerId, (err, result) => {
        if (err) {
            throw new AppError('Failed to delete template', 500, err);
        }
         if (result.changes === 0) {
             throw new AppError('Template not found or access denied', 404);
        }
        res.status(200).json({ success: true, message: 'Template deleted successfully' });
    });
});