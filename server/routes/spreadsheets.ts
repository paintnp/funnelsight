import express from 'express';
import multer from 'multer';
import { storage } from '../lib/storage/factory.js';
import { SpreadsheetParser, ColumnDetector } from '../lib/spreadsheet/parser.js';
import { SpreadsheetValidator } from '../lib/spreadsheet/validator.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB max
  },
  fileFilter: (req, file, cb) => {
    const ext = file.originalname.toLowerCase().split('.').pop();
    if (ext === 'csv' || ext === 'xlsx' || ext === 'xls') {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only CSV and Excel files are allowed.'));
    }
  },
});

const parser = new SpreadsheetParser();
const detector = new ColumnDetector();
const validator = new SpreadsheetValidator();

// POST /api/spreadsheets/upload
router.post('/api/spreadsheets/upload', authMiddleware(), upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    console.log(`[Upload] Processing file: ${req.file.originalname} (${req.file.size} bytes)`);

    // Parse spreadsheet
    const parsed = await parser.parse(req.file.originalname, req.file.buffer);

    console.log(`[Upload] Parsed ${parsed.rowCount} rows with ${parsed.headers.length} columns`);

    // Detect column mappings
    const suggestedMappings = detector.detectMappings(parsed.headers);

    console.log(`[Upload] Detected ${suggestedMappings.length} column mappings`);

    // Get preview (first 5 rows)
    const previewRows = parsed.rows.slice(0, 5);

    // Create import record
    const importRecord = await storage.createSpreadsheetImport({
      userId: req.user!.id,
      filename: req.file.originalname,
      fileSize: req.file.size,
      rowCount: parsed.rowCount,
      validRowCount: null,
      status: 'mapping_required',
      columnMappings: null,
      previewData: previewRows,
      validationErrors: null,
      errorSummary: null,
    });

    console.log(`[Upload] Created import record ${importRecord.id}`);

    res.json({
      importId: importRecord.id,
      status: 'mapping_required',
      columns: parsed.headers,
      previewRows,
      suggestedMappings,
    });
  } catch (error: any) {
    console.error('[Upload] Error:', error);
    res.status(500).json({ error: error.message || 'Upload failed' });
  }
});

// POST /api/spreadsheets/imports/:id/confirm
router.post('/api/spreadsheets/imports/:id/confirm', authMiddleware(), async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    let { mappings, columnMappings } = req.body;
    
    // Support both field names
    if (!mappings && columnMappings) {
      mappings = columnMappings;
    }
    
    if (!mappings || !Array.isArray(mappings)) {
      return res.status(400).json({ error: 'Column mappings are required' });
    }

    // Convert mappings from object format to array format if needed
    if (mappings && !Array.isArray(mappings)) {
      // If mappings is an object like { campaign_name: "campaignName", ... }
      // convert it to array format [{ sourceColumn: "campaign_name", targetField: "campaignName" }, ...]
      console.log('[Confirm] Converting mappings from object to array format');
      mappings = Object.entries(mappings).map(([sourceColumn, targetField]) => ({
        sourceColumn,
        targetField: targetField as string,
        confidence: 100 // Default confidence for manually mapped fields
      }));
    }

    const importRecord = await storage.getSpreadsheetImport(id);

    if (!importRecord || importRecord.userId !== req.user!.id) {
      return res.status(404).json({ error: 'Import not found' });
    }

    if (!importRecord.previewData || importRecord.previewData.length === 0) {
      return res.status(400).json({ error: 'No data to import' });
    }

    console.log(`[Confirm] Starting validation with ${mappings.length} mappings`);

    // Note: In production, this would validate ALL rows from the original file
    // For now, we're just validating the preview data as proof of concept
    const validationResult = validator.validate(importRecord.previewData, mappings);

    console.log(`[Confirm] Validation complete: ${validationResult.validCount} valid, ${validationResult.errorCount} errors`);

    // Update import record
    await storage.updateSpreadsheetImport(id, {
      status: validationResult.errorCount === 0 ? 'completed' : 'failed',
      columnMappings: mappings,
      validRowCount: validationResult.validCount,
      validationErrors: validationResult.errors,
      errorSummary: validationResult.errorCount > 0
        ? `${validationResult.errorCount} rows had validation errors`
        : null,
    });

    // Insert validated data into persistent tables
    if (validationResult.validCount > 0) {
      console.log(`[Confirm] Inserting ${validationResult.validCount} validated rows into database`);

      // Extract unique (campaign_name, utm_source) combinations from validated data
      const campaignChannelCombos = new Map<string, Set<string>>();
      validationResult.valid.forEach((row) => {
        if (row.campaignName) {
          const utmSource = row.utmSource || 'other';
          if (!campaignChannelCombos.has(row.campaignName)) {
            campaignChannelCombos.set(row.campaignName, new Set());
          }
          campaignChannelCombos.get(row.campaignName)!.add(utmSource);
        }
      });

      // Create campaigns for each (campaign_name, utm_source) combination
      const campaignMap = new Map<string, number>();
      for (const [campaignName, utmSources] of campaignChannelCombos) {
        for (const utmSource of utmSources) {
          try {
            // Determine channel from UTM source
            let channel: 'linkedin' | 'facebook' | 'google' | 'email' | 'organic' | 'other' = 'other';
            const source = utmSource.toLowerCase();
            if (source.includes('linkedin')) channel = 'linkedin';
            else if (source.includes('facebook') || source.includes('fb')) channel = 'facebook';
            else if (source.includes('google')) channel = 'google';
            else if (source.includes('email')) channel = 'email';
            else if (source === 'direct' || source === 'organic') channel = 'organic';

            // Check if this specific campaign+channel combination exists
            const campaigns = await storage.getCampaigns(req.user!.id);
            let campaign = campaigns.find((c) => c.name === campaignName && c.channel === channel);

            if (!campaign) {
              // Create new campaign with specific channel
              campaign = await storage.createCampaign({
                userId: req.user!.id,
                name: campaignName,
                channel,
                status: 'active',
                budget: null,
                spend: 0,
                impressions: 0,
                clicks: 0,
                registrations: 0,
                attendees: 0,
                conversionRate: null,
                qualityScore: null,
                startDate: new Date().toISOString(),
                endDate: null,
                metadata: { source: 'spreadsheet_import', importId: id, utmSource },
              });
              console.log(`[Confirm] Created campaign: ${campaignName} (channel: ${channel}, ID: ${campaign.id})`);
            }

            // Use composite key for mapping: campaign_name|utm_source
            const mapKey = `${campaignName}|${utmSource}`;
            campaignMap.set(mapKey, campaign.id);
          } catch (error) {
            console.error(`[Confirm] Error creating campaign ${campaignName} with source ${utmSource}:`, error);
          }
        }
      }

      // Extract unique events from validated data
      const eventNames = new Set<string>();
      validationResult.valid.forEach((row) => {
        if (row.eventName) {
          eventNames.add(row.eventName);
        }
      });

      // Create events if they don't exist
      const eventMap = new Map<string, number>();
      for (const eventName of eventNames) {
        try {
          const events = await storage.getEvents(req.user!.id);
          let event = events.find((e) => e.name === eventName);

          if (!event) {
            // Use event date from first matching row, or default to now
            const rowWithEvent = validationResult.valid.find((r) => r.eventName === eventName);
            const eventDate = rowWithEvent?.eventDate || rowWithEvent?.registrationDate || new Date();
            const startDate = eventDate instanceof Date ? eventDate.toISOString() : new Date(eventDate).toISOString();

            // Set end date to 2 hours after start for webinars, or same day for other events
            const endDateObj = new Date(startDate);
            endDateObj.setHours(endDateObj.getHours() + 2);

            event = await storage.createEvent({
              userId: req.user!.id,
              name: eventName,
              type: 'webinar', // Default type, can be enhanced later
              status: 'completed',
              startDate,
              endDate: endDateObj.toISOString(),
              targetRegistrations: null,
              actualRegistrations: 0,
              attendanceCount: 0,
              engagementScore: null,
              description: `Imported from spreadsheet ${importRecord.filename}`,
            });
            console.log(`[Confirm] Created event: ${eventName} (ID: ${event.id})`);
          }

          eventMap.set(eventName, event.id);
        } catch (error) {
          console.error(`[Confirm] Error creating event ${eventName}:`, error);
        }
      }

      // Insert campaign metrics if we have cost/impressions/clicks data
      for (const row of validationResult.valid) {
        if (row.campaignName && (row.cost || row.impressions || row.clicks || row.conversions || row.registrations || row.attendees)) {
          const mapKey = `${row.campaignName}|${row.utmSource || 'other'}`;
          const campaignId = campaignMap.get(mapKey);
          if (campaignId) {
            try {
              // Update campaign totals
              const campaign = await storage.getCampaign(campaignId);
              if (campaign) {
                await storage.updateCampaign(campaignId, {
                  impressions: (campaign.impressions || 0) + (row.impressions || 0),
                  clicks: (campaign.clicks || 0) + (row.clicks || 0),
                  registrations: (campaign.registrations || 0) + (row.registrations || row.conversions || 0),
                  attendees: (campaign.attendees || 0) + (row.attendees || 0),
                  spend: (campaign.spend || 0) + (row.cost || 0),
                });
              }

              // Create metric records for different metric types
              const metricDate = row.registrationDate
                ? (row.registrationDate instanceof Date
                    ? row.registrationDate.toISOString()
                    : new Date(row.registrationDate).toISOString())
                : new Date().toISOString();

              if (row.impressions) {
                await storage.createCampaignMetric({
                  campaignId,
                  metricType: 'impressions',
                  value: row.impressions,
                  date: metricDate,
                });
              }

              if (row.clicks) {
                await storage.createCampaignMetric({
                  campaignId,
                  metricType: 'clicks',
                  value: row.clicks,
                  date: metricDate,
                });
              }

              if (row.registrations || row.conversions) {
                await storage.createCampaignMetric({
                  campaignId,
                  metricType: 'registrations',
                  value: row.registrations || row.conversions || 0,
                  date: metricDate,
                });
              }

              if (row.attendees) {
                await storage.createCampaignMetric({
                  campaignId,
                  metricType: 'registrations', // attendees count as registrations
                  value: row.attendees,
                  date: metricDate,
                });
              }

              console.log(`[Confirm] Created metrics for campaign ${campaignId}`);
            } catch (error) {
              console.error(`[Confirm] Error creating metrics for campaign ${campaignId}:`, error);
            }
          }
        }
      }
    }

    res.json({
      status: 'completed',
      importId: id,
      validRows: validationResult.validCount,
      errorRows: validationResult.errorCount,
      errors: validationResult.errors,
    });
  } catch (error: any) {
    console.error('[Confirm] Error:', error);
    res.status(500).json({ error: error.message || 'Failed to confirm import' });
  }
});

// GET /api/spreadsheets/imports
router.get('/api/spreadsheets/imports', authMiddleware(), async (req, res) => {
  try {
    const imports = await storage.getSpreadsheetImports(req.user!.id);
    res.json({ imports });
  } catch (error: any) {
    console.error('[Get Imports] Error:', error);
    res.status(500).json({ error: error.message || 'Failed to get imports' });
  }
});

// GET /api/spreadsheets/imports/:id
router.get('/api/spreadsheets/imports/:id', authMiddleware(), async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const importRecord = await storage.getSpreadsheetImport(id);

    if (!importRecord || importRecord.userId !== req.user!.id) {
      return res.status(404).json({ error: 'Import not found' });
    }

    res.json({ import: importRecord });
  } catch (error: any) {
    console.error('[Get Import] Error:', error);
    res.status(500).json({ error: error.message || 'Failed to get import' });
  }
});

// GET /api/spreadsheets/imports/:id/status
router.get('/api/spreadsheets/imports/:id/status', authMiddleware(), async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const importRecord = await storage.getSpreadsheetImport(id);

    if (!importRecord || importRecord.userId !== req.user!.id) {
      return res.status(404).json({ error: 'Import not found' });
    }

    res.json({
      id: importRecord.id,
      status: importRecord.status,
      validRowCount: importRecord.validRowCount,
      validationErrors: importRecord.validationErrors,
      errorSummary: importRecord.errorSummary,
    });
  } catch (error: any) {
    console.error('[Get Status] Error:', error);
    res.status(500).json({ error: error.message || 'Failed to get import status' });
  }
});

// DELETE /api/spreadsheets/imports/:id
router.delete('/api/spreadsheets/imports/:id', authMiddleware(), async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const importRecord = await storage.getSpreadsheetImport(id);

    if (!importRecord || importRecord.userId !== req.user!.id) {
      return res.status(404).json({ error: 'Import not found' });
    }

    await storage.deleteSpreadsheetImport(id);
    res.json({ status: 'deleted' });
  } catch (error: any) {
    console.error('[Delete Import] Error:', error);
    res.status(500).json({ error: 'Failed to delete import' });
  }
});

export default router;
