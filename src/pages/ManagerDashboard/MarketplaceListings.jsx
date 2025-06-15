// import React, { useState, useEffect } from 'react';
// import './ManagerDashboard.css';

// export default function MarketplaceListings({ listings, setListings, showPopup, societyId }) {
//   const [formData, setFormData] = useState({
//     title: '',
//     description: '',
//     type: 'sale',
//     price: '',
//     location: '',
//     bedrooms: '',
//     bathrooms: '',
//     area: '',
//     image: '',
//     ownerName: '',
//     contact: ''
//   });
//   const [formErrors, setFormErrors] = useState({});

//   useEffect(() => {
//     if (!societyId) {
//       console.error('societyId is undefined');
//       showPopup('Society ID is missing', true);
//       return;
//     }

//     const fetchListings = async () => {
//       try {
//         console.log('Fetching listings for societyId:', societyId);
//         const token = localStorage.getItem('token');
//         const response = await fetch(`http://localhost:5000/api/societies/${societyId}/listings`, {
//           headers: { 'Authorization': `Bearer ${token}` }
//         });

//         if (!response.ok) {
//           const errorData = await response.json();
//           console.error('Error fetching listings:', errorData);
//           showPopup(errorData.message || 'Error fetching listings', true);
//           return;
//         }

//         const listingsData = await response.json();
//         setListings(listingsData);
//       } catch (error) {
//         console.error('Fetch error:', error);
//         showPopup(`Error fetching listings: ${error.message}`, true);
//       }
//     };

//     fetchListings();
//   }, [societyId, setListings, showPopup]);

//   const validateForm = () => {
//     const errors = {};
//     if (!formData.title) errors.title = 'Title is required';
//     if (!formData.description) errors.description = 'Description is required';
//     if (!formData.price || isNaN(formData.price) || formData.price <= 0) errors.price = 'Valid price is required';
//     if (!formData.location) errors.location = 'Location is required';
//     if (!formData.bedrooms || isNaN(formData.bedrooms) || formData.bedrooms < 0) errors.bedrooms = 'Valid number of bedrooms is required';
//     if (!formData.bathrooms || isNaN(formData.bathrooms) || formData.bathrooms < 0) errors.bathrooms = 'Valid number of bathrooms is required';
//     if (!formData.area || isNaN(formData.area) || formData.area <= 0) errors.area = 'Valid area is required';
//     if (!formData.image) errors.image = 'Image is required';
//     if (!formData.ownerName) errors.ownerName = 'Owner name is required';
//     if (!formData.contact) errors.contact = 'Contact info is required';
//     return errors;
//   };

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({ ...prev, [name]: value }));
//     setFormErrors(prev => ({ ...prev, [name]: '' }));
//   };

//   const handleImageChange = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       const reader = new FileReader();
//       reader.onloadend = () => {
//         setFormData(prev => ({ ...prev, image: reader.result }));
//         setFormErrors(prev => ({ ...prev, image: '' }));
//       };
//       reader.readAsDataURL(file);
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     const errors = validateForm();

//     if (Object.keys(errors).length > 0) {
//       setFormErrors(errors);
//       showPopup('Please fix form errors', true);
//       return;
//     }

//     if (!societyId) {
//       console.error('societyId is undefined during submit');
//       showPopup('Society ID is missing', true);
//       return;
//     }

//     try {
//       const token = localStorage.getItem('token');
//       console.log('Posting listing with token:', token, 'societyId:', societyId);
//       const response = await fetch(`http://localhost:5000/api/societies/${societyId}/listings`, {
//         method: 'POST',
//         headers: {
//           'Authorization': `Bearer ${token}`,
//           'Content-Type': 'application/json'
//         },
//         body: JSON.stringify(formData)
//       });

//       console.log('Response status:', response.status);
//       if (!response.ok) {
//         let errorData;
//         try {
//           errorData = await response.json();
//         } catch (jsonError) {
//           const errorText = await response.text();
//           console.error('Non-JSON response:', errorText);
//           showPopup(`Error creating listing: Server returned status ${response.status}`, true);
//           return;
//         }
//         console.error('Error data:', errorData);
//         showPopup(errorData.message || 'Error creating listing', true);
//         return;
//       }

//       const newListing = await response.json();
//       setListings(prev => [...prev, newListing]);
//       setFormData({
//         title: '',
//         description: '',
//         type: 'sale',
//         price: '',
//         location: '',
//         bedrooms: '',
//         bathrooms: '',
//         area: '',
//         image: '',
//         ownerName: '',
//         contact: ''
//       });
//       showPopup('✅ Listing created successfully!', false);
//     } catch (error) {
//       console.error('Fetch error:', error);
//       showPopup(`Error creating listing: ${error.message}`, true);
//     }
//   };

//   const handleChangeType = async (listingId, newType) => {
//     if (!societyId) {
//       console.error('societyId is undefined during type change');
//       showPopup('Society ID is missing', true);
//       return;
//     }

//     try {
//       const token = localStorage.getItem('token');
//       const response = await fetch(`http://localhost:5000/api/societies/${societyId}/listings/${listingId}`, {
//         method: 'PATCH',
//         headers: {
//           'Authorization': `Bearer ${token}`,
//           'Content-Type': 'application/json'
//         },
//         body: JSON.stringify({ type: newType })
//       });

//       if (!response.ok) {
//         const errorData = await response.json();
//         showPopup(errorData.message || 'Error updating listing type', true);
//         return;
//       }

//       const updatedListing = await response.json();
//       setListings(prev => prev.map(listing => listing._id === listingId ? updatedListing : listing));
//       showPopup('✅ Listing type changed successfully!', false);
//     } catch (error) {
//       console.error('Error updating type:', error);
//       showPopup(`Error updating listing type: ${error.message}`, true);
//     }
//   };

//   const handleDelete = async (listingId) => {
//     if (!societyId) {
//       console.error('societyId is undefined during delete');
//       showPopup('Society ID is missing', true);
//       return;
//     }

//     try {
//       const token = localStorage.getItem('token');
//       const response = await fetch(`http://localhost:5000/api/societies/${societyId}/listings/${listingId}`, {
//         method: 'DELETE',
//         headers: { 'Authorization': `Bearer ${token}` }
//       });

//       if (!response.ok) {
//         const errorData = await response.json();
//         showPopup(errorData.message || 'Error deleting listing', true);
//         return;
//       }

//       setListings(prev => prev.filter(listing => listing._id !== listingId));
//       showPopup('✅ Listing deleted successfully!', false);
//     } catch (error) {
//       console.error('Error deleting listing:', error);
//       showPopup(`Error deleting listing: ${error.message}`, true);
//     }
//   };

//   return (
//     <div className="marketplace-listings">
//       <h2>Marketplace Listings</h2>
//       <div className="form-container">
//         <form onSubmit={handleSubmit}>
//           <div className="form-group">
//             <label htmlFor="title">Title</label>
//             <input
//               type="text"
//               id="title"
//               name="title"
//               value={formData.title}
//               onChange={handleInputChange}
//               placeholder="e.g., Modern 3-Bedroom Villa"
//             />
//             {formErrors.title && <span className="error">{formErrors.title}</span>}
//           </div>
//           <div className="form-group">
//             <label htmlFor="description">Description</label>
//             <textarea
//               id="description"
//               name="description"
//               value={formData.description}
//               onChange={handleInputChange}
//               placeholder="Describe the property..."
//             />
//             {formErrors.description && <span className="error">{formErrors.description}</span>}
//           </div>
//           <div className="form-group">
//             <label htmlFor="type">Type</label>
//             <select id="type" name="type" value={formData.type} onChange={handleInputChange}>
//               <option value="sale">Sale</option>
//               <option value="rent">Rent</option>
//             </select>
//           </div>
//           <div className="form-group">
//             <label htmlFor="price">Price ($)</label>
//             <input
//               type="number"
//               id="price"
//               name="price"
//               value={formData.price}
//               onChange={handleInputChange}
//               placeholder="e.g., 250000"
//             />
//             {formErrors.price && <span className="error">{formErrors.price}</span>}
//           </div>
//           <div className="form-group">
//             <label htmlFor="location">Location</label>
//             <input
//               type="text"
//               id="location"
//               name="location"
//               value={formData.location}
//               onChange={handleInputChange}
//               placeholder="e.g., 123 Main St, Springfield"
//             />
//             {formErrors.location && <span className="error">{formErrors.location}</span>}
//           </div>
//           <div className="form-group">
//             <label htmlFor="bedrooms">Bedrooms</label>
//             <input
//               type="number"
//               id="bedrooms"
//               name="bedrooms"
//               value={formData.bedrooms}
//               onChange={handleInputChange}
//               placeholder="e.g., 3"
//             />
//             {formErrors.bedrooms && <span className="error">{formErrors.bedrooms}</span>}
//           </div>
//           <div className="form-group">
//             <label htmlFor="bathrooms">Bathrooms</label>
//             <input
//               type="number"
//               id="bathrooms"
//               name="bathrooms"
//               value={formData.bathrooms}
//               onChange={handleInputChange}
//               placeholder="e.g., 2"
//             />
//             {formErrors.bathrooms && <span className="error">{formErrors.bathrooms}</span>}
//           </div>
//           <div className="form-group">
//             <label htmlFor="area">Area (sqft)</label>
//             <input
//               type="number"
//               id="area"
//               name="area"
//               value={formData.area}
//               onChange={handleInputChange}
//               placeholder="e.g., 1500"
//             />
//             {formErrors.area && <span className="error">{formErrors.area}</span>}
//           </div>
//           <div className="form-group">
//             <label htmlFor="image">Image</label>
//             <input
//               type="file"
//               id="image"
//               name="image"
//               accept="image/*"
//               onChange={handleImageChange}
//             />
//             {formErrors.image && <span className="error">{formErrors.image}</span>}
//             {formData.image && (
//               <div className="selected-items-container">
//                 <span className="selected-item-label">Image selected</span>
//               </div>
//             )}
//           </div>
//           <div className="form-group">
//             <label htmlFor="ownerName">Owner Name</label>
//             <input
//               type="text"
//               id="ownerName"
//               name="ownerName"
//               value={formData.ownerName}
//               onChange={handleInputChange}
//               placeholder="e.g., John Doe"
//             />
//             {formErrors.ownerName && <span className="error">{formErrors.ownerName}</span>}
//           </div>
//           <div className="form-group">
//             <label htmlFor="contact">Contact</label>
//             <input
//               type="text"
//               id="contact"
//               name="contact"
//               value={formData.contact}
//               onChange={handleInputChange}
//               placeholder="e.g., john.doe@example.com or 123-456-7890"
//             />
//             {formErrors.contact && <span className="error">{formErrors.contact}</span>}
//           </div>
//           <button type="submit" className="submit-button">Create Listing</button>
//         </form>
//       </div>

//       <div className="listing-list">
//         <h3>Existing Listings</h3>
//         {listings.length === 0 ? (
//           <p className="no-listings">No listings available.</p>
//         ) : (
//           <ul>
//             {listings.map(listing => (
//               <li key={listing._id}>
//                 <div className="listing-item">
//                   <img src={listing.image} alt={listing.title} className="listing-image" />
//                   <div className="listing-info">
//                     <h4>{listing.title}</h4>
//                     <p>Type: {listing.type}</p>
//                     <p>Price: ${listing.price.toLocaleString()}</p>
//                     <p>Location: {listing.location}</p>
//                     <p>Owner: {listing.ownerName} ({listing.contact})</p>
//                   </div>
//                   <div className="listing-actions">
//                     <select
//                       value={listing.type}
//                       onChange={(e) => handleChangeType(listing._id, e.target.value)}
//                     >
//                       <option value="sale">Sale</option>
//                       <option value="rent">Rent</option>
//                     </select>
//                     <button
//                       className="delete-btn"
//                       onClick={() => handleDelete(listing._id)}
//                     >
//                       Delete
//                     </button>
//                   </div>
//                 </div>
//               </li>
//             ))}
//           </ul>
//         )}
//       </div>
//     </div>
//   );
// }


import React, { useState, useEffect } from 'react';
import './ManagerDashboard.css';

export default function MarketplaceListings({ listings, setListings, showPopup, societyId }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'sale',
    price: '',
    location: '',
    bedrooms: '',
    bathrooms: '',
    area: '',
    images: [],
    ownerName: '',
    contact: ''
  });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    if (!societyId) {
      console.error('societyId is undefined');
      showPopup('Society ID is missing', true);
      return;
    }

    const fetchListings = async () => {
      try {
        console.log('Fetching listings for societyId:', societyId);
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:5000/api/listings/${societyId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error('Error fetching listings:', errorData);
          showPopup(errorData.message || 'Error fetching listings', true);
          return;
        }

        const listingsData = await response.json();
        setListings(listingsData);
      } catch (error) {
        console.error('Fetch error:', error);
        showPopup(`Error fetching listings: ${error.message}`, true);
      }
    };

    fetchListings();
  }, [societyId]);

  const validateForm = () => {
    const errors = {};
    if (!formData.title) errors.title = 'Title is required';
    if (!formData.description) errors.description = 'Description is required';
    if (!formData.price || isNaN(formData.price) || formData.price <= 0) errors.price = 'Valid price is required';
    if (!formData.location) errors.location = 'Location is required';
    if (!formData.bedrooms || isNaN(formData.bedrooms) || formData.bedrooms < 0) errors.bedrooms = 'Valid number of bedrooms is required';
    if (!formData.bathrooms || isNaN(formData.bathrooms) || formData.bathrooms < 0) errors.bathrooms = 'Valid number of bathrooms is required';
    if (!formData.area || isNaN(formData.area) || formData.area <= 0) errors.area = 'Valid area is required';
    if (formData.images.length < 3) errors.images = 'At least 3 images are required';
    if (formData.images.length > 5) errors.images = 'Maximum 5 images allowed';
    if (!formData.ownerName) errors.ownerName = 'Owner name is required';
    if (!formData.contact) errors.contact = 'Contact info is required';
    return errors;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setFormErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 5) {
      setFormErrors(prev => ({ ...prev, images: 'Maximum 5 images allowed' }));
      showPopup('Maximum 5 images allowed', true);
      return;
    }

    const imagePromises = files.map(file => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(file);
      });
    });

    Promise.all(imagePromises).then(imageResults => {
      setFormData(prev => ({ ...prev, images: imageResults }));
      setFormErrors(prev => ({ ...prev, images: '' }));
    });
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validateForm();

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      showPopup('Please fix form errors', true);
      return;
    }

    if (!societyId) {
      console.error('societyId is undefined during submit');
      showPopup('Society ID is missing', true);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/listings`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ ...formData, societyId })
      });

      if (!response.ok) {
        const errorData = await response.json();
        showPopup(errorData.message || 'Error creating listing', true);
        return;
      }

      const newListing = await response.json();
      setListings(prev => [...prev, newListing]);
      setFormData({
        title: '',
        description: '',
        type: 'sale',
        price: '',
        location: '',
        bedrooms: '',
        bathrooms: '',
        area: '',
        images: [],
        ownerName: '',
        contact: ''
      });
      showPopup('✅ Listing created successfully!', false);
    } catch (error) {
      console.error('Fetch error:', error);
      showPopup(`Error creating listing: ${error.message}`, true);
    }
  };

  const handleChangeType = async (listingId, newType) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/listings/${listingId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ type: newType, societyId })
      });

      if (!response.ok) {
        const errorData = await response.json();
        showPopup(errorData.message || 'Error updating listing type', true);
        return;
      }

      const updatedListing = await response.json();
      setListings(prev => prev.map(listing => listing._id === listingId ? updatedListing : listing));
      showPopup('✅ Listing type changed successfully!', false);
    } catch (error) {
      console.error('Error updating type:', error);
      showPopup(`Error updating listing type: ${error.message}`, true);
    }
  };

  const handleDelete = async (listingId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/listings/${listingId}?societyId=${societyId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) {
        const errorData = await response.json();
        showPopup(errorData.message || 'Error deleting listing', true);
        return;
      }

      setListings(prev => prev.filter(listing => listing._id !== listingId));
      showPopup('✅ Listing deleted successfully!', false);
    } catch (error) {
      console.error('Error deleting listing:', error);
      showPopup(`Error deleting listing: ${error.message}`, true);
    }
  };

  return (
    <div className="marketplace-listings">
      <h2>Marketplace Listings</h2>
      <div className="form-container">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">Title</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="e.g., Modern 3-Bedroom Villa"
            />
            {formErrors.title && <span className="error">{formErrors.title}</span>}
          </div>
          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Describe the property..."
            />
            {formErrors.description && <span className="error">{formErrors.description}</span>}
          </div>
          <div className="form-group">
            <label htmlFor="type">Type</label>
            <select id="type" name="type" value={formData.type} onChange={handleInputChange}>
              <option value="sale">Sale</option>
              <option value="rent">Rent</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="price">Price ($)</label>
            <input
              type="number"
              id="price"
              name="price"
              value={formData.price}
              onChange={handleInputChange}
              placeholder="e.g., 250000"
            />
            {formErrors.price && <span className="error">{formErrors.price}</span>}
          </div>
          <div className="form-group">
            <label htmlFor="location">Location</label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              placeholder="e.g., 123 Main St, Springfield"
            />
            {formErrors.location && <span className="error">{formErrors.location}</span>}
          </div>
          <div className="form-group">
            <label htmlFor="bedrooms">Bedrooms</label>
            <input
              type="number"
              id="bedrooms"
              name="bedrooms"
              value={formData.bedrooms}
              onChange={handleInputChange}
              placeholder="e.g., 3"
            />
            {formErrors.bedrooms && <span className="error">{formErrors.bedrooms}</span>}
          </div>
          <div className="form-group">
            <label htmlFor="bathrooms">Bathrooms</label>
            <input
              type="number"
              id="bathrooms"
              name="bathrooms"
              value={formData.bathrooms}
              onChange={handleInputChange}
              placeholder="e.g., 2"
            />
            {formErrors.bathrooms && <span className="error">{formErrors.bathrooms}</span>}
          </div>
          <div className="form-group">
            <label htmlFor="area">Area (sqft)</label>
            <input
              type="number"
              id="area"
              name="area"
              value={formData.area}
              onChange={handleInputChange}
              placeholder="e.g., 1500"
            />
            {formErrors.area && <span className="error">{formErrors.area}</span>}
          </div>
          <div className="form-group">
            <label htmlFor="images">Images (3-5 required)</label>
            <input
              type="file"
              id="images"
              name="images"
              accept="image/*"
              multiple
              onChange={handleImageChange}
            />
            {formErrors.images && <span className="error">{formErrors.images}</span>}
            {formData.images.length > 0 && (
              <div className="selected-items-container">
                {formData.images.map((image, index) => (
                  <div key={index} className="selected-item">
                    <img src={image} alt={`Preview ${index + 1}`} style={{ width: '100px', height: '100px' }} />
                    <button type="button" onClick={() => removeImage(index)}>Remove</button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="form-group">
            <label htmlFor="ownerName">Owner Name</label>
            <input
              type="text"
              id="ownerName"
              name="ownerName"
              value={formData.ownerName}
              onChange={handleInputChange}
              placeholder="e.g., John Doe"
            />
            {formErrors.ownerName && <span className="error">{formErrors.ownerName}</span>}
          </div>
          <div className="form-group">
            <label htmlFor="contact">Contact</label>
            <input
              type="text"
              id="contact"
              name="contact"
              value={formData.contact}
              onChange={handleInputChange}
              placeholder="e.g., john.doe@example.com or 123-456-7890"
            />
            {formErrors.contact && <span className="error">{formErrors.contact}</span>}
          </div>
          <button type="submit" className="submit-button">Create Listing</button>
        </form>
      </div>

      <div className="listing-list">
        <h3>Existing Listings</h3>
        {listings.length === 0 ? (
          <p className="no-listings">No listings available.</p>
        ) : (
          <ul>
            {listings.map(listing => (
              <li key={listing._id}>
                <div className="listing-item">
                  <div className="listing-images">
                    {listing.images.map((image, index) => (
                      <img key={index} src={image} alt={`${listing.title} ${index + 1}`} className="listing-image" />
                    ))}
                  </div>
                  <div className="listing-info">
                    <h4>{listing.title}</h4>
                    <p>Type: {listing.type}</p>
                    <p>Price: ${listing.price.toLocaleString()}</p>
                    <p>Location: {listing.location}</p>
                    <p>Owner: {listing.ownerName} ({listing.contact})</p>
                  </div>
                  <div className="listing-actions">
                    <select
                      value={listing.type}
                      onChange={(e) => handleChangeType(listing._id, e.target.value)}
                    >
                      <option value="sale">Sale</option>
                      <option value="rent">Rent</option>
                    </select>
                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(listing._id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}