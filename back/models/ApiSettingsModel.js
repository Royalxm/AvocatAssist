const { db } = require('../config/database');

/**
 * API Settings model
 * Handles database operations for API settings
 */
const ApiSettingsModel = {
  /**
   * Get all API settings
   * @param {Function} callback - Callback function
   */
  getAllApiSettings: (callback) => {
    const sql = `
      SELECT id, provider, apiKey, endpointUrl, modelName, isDefault, lastUpdated
      FROM APISettings
      ORDER BY lastUpdated DESC
    `;
    
    db.all(sql, [], (err, settings) => {
      if (err) {
        return callback(err);
      }
      
      callback(null, settings);
    });
  },
  
  /**
   * Get API setting by ID
   * @param {Number} id - API setting ID
   * @param {Function} callback - Callback function
   */
  getApiSettingById: (id, callback) => {
    const sql = `
      SELECT id, provider, apiKey, endpointUrl, modelName, isDefault, lastUpdated
      FROM APISettings
      WHERE id = ?
    `;
    
    db.get(sql, [id], (err, setting) => {
      if (err) {
        return callback(err);
      }
      
      if (!setting) {
        return callback(null, null);
      }
      
      callback(null, setting);
    });
  },
  
  /**
   * Get default API setting
   * @param {Function} callback - Callback function
   */
  getDefaultApiSetting: (callback) => {
    const sql = `
      SELECT id, provider, apiKey, endpointUrl, modelName, isDefault, lastUpdated
      FROM APISettings
      WHERE isDefault = 1
      LIMIT 1
    `;
    
    db.get(sql, [], (err, setting) => {
      if (err) {
        return callback(err);
      }
      
      if (!setting) {
        return callback(null, null);
      }
      
      callback(null, setting);
    });
  },
  
  /**
   * Create API setting
   * @param {Object} settingData - API setting data
   * @param {Function} callback - Callback function
   */
  createApiSetting: (settingData, callback) => {
    // Start a transaction
    db.serialize(() => {
      db.run('BEGIN TRANSACTION');
      
      // If setting is default, unset other default settings
      if (settingData.isDefault) {
        db.run('UPDATE APISettings SET isDefault = 0', (err) => {
          if (err) {
            db.run('ROLLBACK');
            return callback(err);
          }
          
          // Insert new API setting
          const sql = `
            INSERT INTO APISettings (provider, apiKey, endpointUrl, modelName, isDefault)
            VALUES (?, ?, ?, ?, ?)
          `;
          
          db.run(
            sql,
            [
              settingData.provider,
              settingData.apiKey,
              settingData.endpointUrl,
              settingData.modelName,
              settingData.isDefault ? 1 : 0
            ],
            function(err) {
              if (err) {
                db.run('ROLLBACK');
                return callback(err);
              }
              
              // Commit transaction
              db.run('COMMIT');
              
              // Get the created API setting
              ApiSettingsModel.getApiSettingById(this.lastID, callback);
            }
          );
        });
      } else {
        // Insert new API setting
        const sql = `
          INSERT INTO APISettings (provider, apiKey, endpointUrl, modelName, isDefault)
          VALUES (?, ?, ?, ?, ?)
        `;
        
        db.run(
          sql,
          [
            settingData.provider,
            settingData.apiKey,
            settingData.endpointUrl,
            settingData.modelName,
            settingData.isDefault ? 1 : 0
          ],
          function(err) {
            if (err) {
              db.run('ROLLBACK');
              return callback(err);
            }
            
            // Commit transaction
            db.run('COMMIT');
            
            // Get the created API setting
            ApiSettingsModel.getApiSettingById(this.lastID, callback);
          }
        );
      }
    });
  },
  
  /**
   * Update API setting
   * @param {Number} id - API setting ID
   * @param {Object} settingData - API setting data
   * @param {Function} callback - Callback function
   */
  updateApiSetting: (id, settingData, callback) => {
    // Start a transaction
    db.serialize(() => {
      db.run('BEGIN TRANSACTION');
      
      // If setting is default, unset other default settings
      if (settingData.isDefault) {
        db.run('UPDATE APISettings SET isDefault = 0', (err) => {
          if (err) {
            db.run('ROLLBACK');
            return callback(err);
          }
          
          // Update API setting
          const sql = `
            UPDATE APISettings
            SET provider = ?, apiKey = ?, endpointUrl = ?, modelName = ?, isDefault = ?, lastUpdated = CURRENT_TIMESTAMP
            WHERE id = ?
          `;
          
          db.run(
            sql,
            [
              settingData.provider,
              settingData.apiKey,
              settingData.endpointUrl,
              settingData.modelName,
              settingData.isDefault ? 1 : 0,
              id
            ],
            function(err) {
              if (err) {
                db.run('ROLLBACK');
                return callback(err);
              }
              
              // Commit transaction
              db.run('COMMIT');
              
              // Get the updated API setting
              ApiSettingsModel.getApiSettingById(id, callback);
            }
          );
        });
      } else {
        // Update API setting
        const sql = `
          UPDATE APISettings
          SET provider = ?, apiKey = ?, endpointUrl = ?, modelName = ?, isDefault = ?, lastUpdated = CURRENT_TIMESTAMP
          WHERE id = ?
        `;
        
        db.run(
          sql,
          [
            settingData.provider,
            settingData.apiKey,
            settingData.endpointUrl,
            settingData.modelName,
            settingData.isDefault ? 1 : 0,
            id
          ],
          function(err) {
            if (err) {
              db.run('ROLLBACK');
              return callback(err);
            }
            
            // Commit transaction
            db.run('COMMIT');
            
            // Get the updated API setting
            ApiSettingsModel.getApiSettingById(id, callback);
          }
        );
      }
    });
  },
  
  /**
   * Delete API setting
   * @param {Number} id - API setting ID
   * @param {Function} callback - Callback function
   */
  deleteApiSetting: (id, callback) => {
    // Check if setting is default
    db.get('SELECT isDefault FROM APISettings WHERE id = ?', [id], (err, setting) => {
      if (err) {
        return callback(err);
      }
      
      if (!setting) {
        return callback(new Error('Paramètre API non trouvé'));
      }
      
      // If setting is default, don't delete it
      if (setting.isDefault) {
        return callback(new Error('Impossible de supprimer le paramètre API par défaut'));
      }
      
      // Delete API setting
      const sql = `
        DELETE FROM APISettings
        WHERE id = ?
      `;
      
      db.run(sql, [id], function(err) {
        if (err) {
          return callback(err);
        }
        
        callback(null, { success: true, message: 'Paramètre API supprimé' });
      });
    });
  },
  
  /**
   * Set default API setting
   * @param {Number} id - API setting ID
   * @param {Function} callback - Callback function
   */
  setDefaultApiSetting: (id, callback) => {
    // Start a transaction
    db.serialize(() => {
      db.run('BEGIN TRANSACTION');
      
      // Unset all default settings
      db.run('UPDATE APISettings SET isDefault = 0', (err) => {
        if (err) {
          db.run('ROLLBACK');
          return callback(err);
        }
        
        // Set new default setting
        db.run(
          'UPDATE APISettings SET isDefault = 1, lastUpdated = CURRENT_TIMESTAMP WHERE id = ?',
          [id],
          function(err) {
            if (err) {
              db.run('ROLLBACK');
              return callback(err);
            }
            
            // Check if any rows were affected
            if (this.changes === 0) {
              db.run('ROLLBACK');
              return callback(new Error('Paramètre API non trouvé'));
            }
            
            // Commit transaction
            db.run('COMMIT');
            
            // Get the updated API setting
            ApiSettingsModel.getApiSettingById(id, callback);
          }
        );
      });
    });
  }
};

module.exports = ApiSettingsModel;
