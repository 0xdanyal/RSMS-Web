import { useState, useEffect } from 'react';
import './Marketplace.css';
// import SocietyDetails from './../../components/SocietyDetails/SocietyDetails';

export default function Marketplace() {
  const [listings, setListings] = useState([]);
  const [filter, setFilter] = useState('all');
  const [selectedListing, setSelectedListing] = useState(null);

  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/listings/all');
      if (!response.ok) {
        throw new Error('Failed to fetch listings');
      }
      const data = await response.json();
      setListings(data);
    } catch (error) {
      console.error('Error fetching listings:', error);
    }
  };

  const filteredListings = listings.filter(listing => {
    if (filter === 'all') return true;
    return listing.type === filter;
  });

  const openListingModal = (listing) => {
    setSelectedListing(listing);
  };

  const closeListingModal = () => {
    setSelectedListing(null);
  };

  return (
    <div className="marketplace">
      <div className="marketplace-header">
        <h1>Property Marketplace</h1>
        <div className="filters">
          <button
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All
          </button>
          <button
            className={`filter-btn ${filter === 'sale' ? 'active' : ''}`}
            onClick={() => setFilter('sale')}
          >
            For Sale
          </button>
          <button
            className={`filter-btn ${filter === 'rent' ? 'active' : ''}`}
            onClick={() => setFilter('rent')}
          >
            For Rent
          </button>
        </div>
      </div>

      <div className="listings-grid">
        {filteredListings.map(listing => (
          <div
            key={listing._id}
            className="listing-card"
            onClick={() => openListingModal(listing)}
          >
            <div className="listing-image-container">
              {listing.images[0] && (
                <img src={listing.images[0]} alt={listing.title} />
              )}
            </div>
            <div className="listing-content">
              <h3>{listing.title}</h3>
              <p className="price">${listing.price.toLocaleString()}</p>
              <p className="location">{listing.location}</p>
              <p className="society">Society: {listing.society?.name || 'Unknown'}</p>
              <div className="listing-details">
                <span>{listing.bedrooms} beds</span>
                <span>{listing.bathrooms} baths</span>
                <span>{listing.area} sqft</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedListing && (
        <div className="listing-modal">
          <div className="listing-modal-content">
            <button className="modal-close" onClick={closeListingModal}>
              &times;
            </button>
            <div className="listing-modal-images">
              {selectedListing.images.map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt={`${selectedListing.title} ${index + 1}`}
                  className="modal-image"
                />
              ))}
            </div>
            <div className="listing-modal-details">
              <h2>{selectedListing.title}</h2>
              <p className="modal-price">
                ${selectedListing.price.toLocaleString()}{' '}
                <span>({selectedListing.type === 'sale' ? 'for sale' : 'per month'})</span>
              </p>
              <p className="modal-location">{selectedListing.location}</p>
              <p className="modal-society">
                Society: {selectedListing.society?.name || 'Unknown'}
              </p>
              <p className="modal-owner">
                Owner: {selectedListing.ownerName} ({selectedListing.contact})
              </p>
               <p className="modal-owner">
               For more details, please contact the Helpline of the Society directly.
              </p>
              <div className="modal-details">
                <span>{selectedListing.bedrooms} bedrooms</span>
                <span>{selectedListing.bathrooms} bathrooms</span>
                <span>{selectedListing.area} sqft</span>
              </div>
              <p className="modal-description">{selectedListing.description}</p>
              <button className="modal-contact-btn">Contact Owner</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}