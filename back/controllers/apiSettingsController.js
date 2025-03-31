const ApiSettingsModel = require('../models/ApiSettingsModel');

/**
 * Get all API settings
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getAllApiSettings = (req, res) => {
  ApiSettingsModel.getAllApiSettings((err, settings) => {
    if (err) {
      console.error('Erreur lors de la récupération des paramètres API:', err.message);
      return res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des paramètres API'
      });
    }
    
    // Mask API keys for security
    const maskedSettings = settings.map(setting => {
      const { apiKey, ...rest } = setting;
      return {
        ...rest,
        apiKey: apiKey ? `${apiKey.substring(0, 4)}...${apiKey.substring(apiKey.length - 4)}` : null
      };
    });
    
    res.status(200).json({
      success: true,
      settings: maskedSettings
    });
  });
};

/**
 * Get API setting by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getApiSettingById = (req, res) => {
  const { id } = req.params;
  
  ApiSettingsModel.getApiSettingById(id, (err, setting) => {
    if (err) {
      console.error('Erreur lors de la récupération du paramètre API:', err.message);
      
      if (err.message === 'Paramètre API non trouvé') {
        return res.status(404).json({
          success: false,
          message: 'Paramètre API non trouvé'
        });
      }
      
      return res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération du paramètre API'
      });
    }
    
    // Mask API key for security
    const { apiKey, ...rest } = setting;
    const maskedSetting = {
      ...rest,
      apiKey: apiKey ? `${apiKey.substring(0, 4)}...${apiKey.substring(apiKey.length - 4)}` : null
    };
    
    res.status(200).json({
      success: true,
      setting: maskedSetting
    });
  });
};

/**
 * Get API setting by provider
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getApiSettingByProvider = (req, res) => {
  const { provider } = req.params;
  
  ApiSettingsModel.getApiSettingByProvider(provider, (err, setting) => {
    if (err) {
      console.error('Erreur lors de la récupération du paramètre API:', err.message);
      
      if (err.message === 'Paramètre API non trouvé') {
        return res.status(404).json({
          success: false,
          message: 'Paramètre API non trouvé'
        });
      }
      
      return res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération du paramètre API'
      });
    }
    
    // Mask API key for security
    const { apiKey, ...rest } = setting;
    const maskedSetting = {
      ...rest,
      apiKey: apiKey ? `${apiKey.substring(0, 4)}...${apiKey.substring(apiKey.length - 4)}` : null
    };
    
    res.status(200).json({
      success: true,
      setting: maskedSetting
    });
  });
};

/**
 * Create a new API setting
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.createApiSetting = (req, res) => {
  const { provider, apiKey, endpointUrl, modelName } = req.body;
  
  // Validate input
  if (!provider || !apiKey || !endpointUrl || !modelName) {
    return res.status(400).json({
      success: false,
      message: 'Veuillez fournir tous les champs requis'
    });
  }
  
  // Create API setting
  ApiSettingsModel.createApiSetting(
    {
      provider,
      apiKey,
      endpointUrl,
      modelName
    },
    (err, result) => {
      if (err) {
        console.error('Erreur lors de la création du paramètre API:', err.message);
        
        if (err.message === 'Un paramètre API pour ce fournisseur existe déjà') {
          return res.status(400).json({
            success: false,
            message: 'Un paramètre API pour ce fournisseur existe déjà'
          });
        }
        
        return res.status(500).json({
          success: false,
          message: 'Erreur lors de la création du paramètre API'
        });
      }
      
      res.status(201).json({
        success: true,
        message: 'Paramètre API créé avec succès',
        settingId: result.settingId
      });
    }
  );
};

/**
 * Update API setting
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.updateApiSetting = (req, res) => {
  const { id } = req.params;
  const { provider, apiKey, endpointUrl, modelName } = req.body;
  
  // Update API setting
  ApiSettingsModel.updateApiSetting(
    id,
    {
      provider,
      apiKey,
      endpointUrl,
      modelName
    },
    (err, result) => {
      if (err) {
        console.error('Erreur lors de la mise à jour du paramètre API:', err.message);
        
        if (err.message === 'Paramètre API non trouvé') {
          return res.status(404).json({
            success: false,
            message: 'Paramètre API non trouvé'
          });
        }
        
        if (err.message === 'Un paramètre API pour ce fournisseur existe déjà') {
          return res.status(400).json({
            success: false,
            message: 'Un paramètre API pour ce fournisseur existe déjà'
          });
        }
        
        return res.status(500).json({
          success: false,
          message: 'Erreur lors de la mise à jour du paramètre API'
        });
      }
      
      res.status(200).json({
        success: true,
        message: 'Paramètre API mis à jour avec succès',
        settingId: result.settingId
      });
    }
  );
};

/**
 * Delete API setting
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.deleteApiSetting = (req, res) => {
  const { id } = req.params;
  
  ApiSettingsModel.deleteApiSetting(id, (err, result) => {
    if (err) {
      console.error('Erreur lors de la suppression du paramètre API:', err.message);
      
      if (err.message === 'Paramètre API non trouvé') {
        return res.status(404).json({
          success: false,
          message: 'Paramètre API non trouvé'
        });
      }
      
      return res.status(500).json({
        success: false,
        message: 'Erreur lors de la suppression du paramètre API'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Paramètre API supprimé avec succès',
      settingId: result.settingId
    });
  });
};

/**
 * Get default API setting
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getDefaultApiSetting = (req, res) => {
  ApiSettingsModel.getDefaultApiSetting((err, setting) => {
    if (err) {
      console.error('Erreur lors de la récupération du paramètre API par défaut:', err.message);
      
      if (err.message === 'Aucun paramètre API trouvé') {
        return res.status(404).json({
          success: false,
          message: 'Aucun paramètre API trouvé'
        });
      }
      
      return res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération du paramètre API par défaut'
      });
    }
    
    // Mask API key for security
    const { apiKey, ...rest } = setting;
    const maskedSetting = {
      ...rest,
      apiKey: apiKey ? `${apiKey.substring(0, 4)}...${apiKey.substring(apiKey.length - 4)}` : null
    };
    
    res.status(200).json({
      success: true,
      setting: maskedSetting
    });
  });
};

/**
 * Set default API setting
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.setDefaultApiSetting = (req, res) => {
  const { id } = req.params;
  
  ApiSettingsModel.setDefaultApiSetting(id, (err, result) => {
    if (err) {
      console.error('Erreur lors de la définition du paramètre API par défaut:', err.message);
      
      if (err.message === 'Paramètre API non trouvé') {
        return res.status(404).json({
          success: false,
          message: 'Paramètre API non trouvé'
        });
      }
      
      return res.status(500).json({
        success: false,
        message: 'Erreur lors de la définition du paramètre API par défaut'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Paramètre API défini par défaut avec succès',
      settingId: result.settingId
    });
  });
};
