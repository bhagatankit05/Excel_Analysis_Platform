import express from 'express';
import multer from 'multer';
import { auth } from '../middleware/Auth.middleware.js';
import ExcelData from '../models/ExcelData.modles.js';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype ===
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
      file.mimetype === 'application/vnd.ms-excel'
    ) {
      cb(null, true);
    } else {
      cb(new Error('Only Excel files are allowed'), false);
    }
  },
});

// Save Excel data
router.post('/save-excel', auth, async (req, res) => {
  try {
    const { filename, originalName, data, chartData } = req.body;

    if (!data || !data.labels || !data.values) {
      return res.status(400).json({
        success: false,
        message: 'Invalid data format',
      });
    }

    // Calculate analytics
    const values = data.values.map(Number);
    const total = values.reduce((acc, val) => acc + val, 0);
    const average = total / values.length;
    const minimum = Math.min(...values);
    const maximum = Math.max(...values);

    const analytics = {
      total,
      average: parseFloat(average.toFixed(2)),
      minimum,
      maximum,
      count: values.length,
    };

    // Save to database
    const excelData = new ExcelData({
      userId: req.user.userId,
      filename: filename || `excel_${Date.now()}`,
      originalName: originalName || 'Unknown',
      data,
      chartData,
      analytics,
    });

    await excelData.save();

    res.status(201).json({
      success: true,
      message: 'Excel data saved successfully',
      data: excelData,
    });
  } catch (error) {
    console.error('Save Excel data error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save Excel data',
    });
  }
});

// Get user's Excel data history
router.get('/excel-history', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const excelData = await ExcelData.find({ userId: req.user.userId })
      .sort({ uploadedAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-data -chartData'); // Exclude large data fields for list view

    const total = await ExcelData.countDocuments({ userId: req.user.userId });

    res.json({
      success: true,
      data: excelData,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get Excel history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch Excel data history',
    });
  }
});

// Get specific Excel data by ID
router.get('/excel/:id', auth, async (req, res) => {
  try {
    const excelData = await ExcelData.findOne({
      _id: req.params.id,
      userId: req.user.userId,
    });

    if (!excelData) {
      return res.status(404).json({
        success: false,
        message: 'Excel data not found',
      });
    }

    res.json({
      success: true,
      data: excelData,
    });
  } catch (error) {
    console.error('Get Excel data error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch Excel data',
    });
  }
});

// Get latest Excel data for reports
router.get('/latest-excel', auth, async (req, res) => {
  try {
    const latestData = await ExcelData.findOne({
      userId: req.user.userId,
    }).sort({ uploadedAt: -1 });

    if (!latestData) {
      return res.status(404).json({
        success: false,
        message: 'No Excel data found',
      });
    }

    res.json({
      success: true,
      data: latestData,
    });
  } catch (error) {
    console.error('Get latest Excel data error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch latest Excel data',
    });
  }
});

// Delete Excel data
router.delete('/excel/:id', auth, async (req, res) => {
  try {
    const excelData = await ExcelData.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.userId,
    });

    if (!excelData) {
      return res.status(404).json({
        success: false,
        message: 'Excel data not found',
      });
    }

    res.json({
      success: true,
      message: 'Excel data deleted successfully',
    });
  } catch (error) {
    console.error('Delete Excel data error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete Excel data',
    });
  }
});

export default router;
