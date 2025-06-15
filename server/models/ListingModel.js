// import mongoose from 'mongoose';

// const listingSchema = new mongoose.Schema({
//   title: {
//     type: String,
//     required: true
//   },
//   description: {
//     type: String,
//     required: true
//   },
//   type: {
//     type: String,
//     enum: ['sale', 'rent'],
//     required: true
//   },
//   price: {
//     type: Number,
//     required: true
//   },
//   location: {
//     type: String,
//     required: true
//   },
//   bedrooms: {
//     type: Number,
//     required: true
//   },
//   bathrooms: {
//     type: Number,
//     required: true
//   },
//   area: {
//     type: Number,
//     required: true
//   },
//   image: {
//     type: String, // Store base64 string
//     required: true
//   },
//   society: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Society',
//     required: true
//   },
//   ownerName: {
//     type: String,
//     required: true
//   },
//   contact: {
//     type: String,
//     required: true
//   },
//   createdAt: {
//     type: Date,
//     default: Date.now
//   }
// });

// export default mongoose.model('Listing', listingSchema);

import mongoose from 'mongoose';

const listingSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['sale', 'rent'],
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  bedrooms: {
    type: Number,
    required: true
  },
  bathrooms: {
    type: Number,
    required: true
  },
  area: {
    type: Number,
    required: true
  },
  images: {
    type: [String],
    required: true,
    validate: {
      validator: function (v) {
        return v.length >= 3 && v.length <= 5;
      },
      message: 'At least 3 and up to 5 images are required'
    }
  },
  society: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Society',
    required: true
  },
  ownerName: {
    type: String,
    required: true
  },
  contact: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('Listing', listingSchema);