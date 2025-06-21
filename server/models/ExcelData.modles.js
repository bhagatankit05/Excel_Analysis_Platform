import mongoose from 'mongoose';

const excelDataSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    filename: {
      type: String,
      required: true,
    },
    originalName: {
      type: String,
      required: true,
    },
    data: {
      labels: [
        {
          type: String,
          required: true,
        },
      ],
      values: [
        {
          type: Number,
          required: true,
        },
      ],
    },
    chartData: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    analytics: {
      total: Number,
      average: Number,
      minimum: Number,
      maximum: Number,
      count: Number,
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
excelDataSchema.index({ userId: 1, uploadedAt: -1 });

export default mongoose.model('ExcelData', excelDataSchema);
