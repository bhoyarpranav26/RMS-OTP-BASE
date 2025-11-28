import React, { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { menuItems } from '../../data/menuItems'
import { useCart } from '../../context/CartContext'
import type { MenuItem } from '../../context/CartContext'
import { FaPlus, FaMinus } from 'react-icons/fa'

const Menu: React.FC = () => {
  const { addToCart, cart, updateQuantity } = useCart()
  const location = useLocation()
  
  // 🟢 FIX 1: Initialize selectedCategory using a function that reads the URL immediately
  const [selectedCategory, setSelectedCategory] = useState<string>(() => {
    const urlParams = new URLSearchParams(location.search)
    const category = urlParams.get('category')
    return (category && category !== 'All Items') ? category : 'All'
  })
  
  // Initialize selectedType to 'veg' as default if nothing is found
  const [selectedType, setSelectedType] = useState(
    localStorage.getItem('selectedType') || 'veg'
  )
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [selectedSpiceLevels, setSelectedSpiceLevels] = useState<{ [key: number]: 'mild' | 'medium' | 'hot' }>({})

  // 🟢 FIX 2: Refactor useEffect. It is now only needed for selectedType logic 
  // or external state changes, but we'll keep the category logic just in case 
  // the URL changes later in the app's lifecycle (though initial load is fixed above).
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search)
    const category = urlParams.get('category')
    const typeFromUrl = urlParams.get('type')

    // Set category if provided (for subsequent location changes, not initial load)
    if (category && category !== 'All Items' && category !== selectedCategory) {
      setSelectedCategory(category)
    }

    // Update selected type state
    const type = typeFromUrl || localStorage.getItem('selectedType') || 'veg'
    setSelectedType(type)
  }, [location.search, selectedCategory])

  // 🟢 Hide Veg/Non-Veg buttons only for Desserts, Beverages & Kids.
  // This now uses the correctly initialized selectedCategory.
  const hideTypeFilter = selectedCategory === 'Desserts' || selectedCategory === 'Beverages' || selectedCategory === 'Kids'

  const categories = ['All', ...Array.from(new Set(menuItems.map(item => item.category)))]

  // Filter items based on category, type, and search
  const filteredItems = menuItems.filter(item => {
    const matchCategory =
      selectedCategory === 'All' || item.category === selectedCategory

    // Logic to match all types if the filter is hidden (Desserts/Beverages/Kids)
    // For 'All' category, only show all types if no specific type is selected, otherwise filter by selected type
    const matchType = hideTypeFilter
      ? true
      : selectedCategory === 'All' && selectedType === 'all'
        ? true
        : item.type.toLowerCase().replace('-', '') === selectedType.toLowerCase().replace('-', '')
      
    const matchSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase())
    return matchCategory && matchType && matchSearch
  })

  // Group items by category for display when 'All' is selected
  const groupedItems =
    selectedCategory === 'All'
      ? filteredItems.reduce((acc, item) => {
          if (!acc[item.category]) acc[item.category] = []
          acc[item.category].push(item)
          return acc
        }, {} as Record<string, MenuItem[]>)
      : {}

  const handleAddToCart = (item: MenuItem) => {
    const spiceLevel = selectedSpiceLevels[item.id] || 'medium'
    addToCart(item, spiceLevel)
  }

  const handleSpiceLevelChange = (itemId: number, spiceLevel: 'mild' | 'medium' | 'hot') => {
    setSelectedSpiceLevels(prev => ({
      ...prev,
      [itemId]: spiceLevel
    }))
  }

  const renderItem = (item: MenuItem) => {
    const cartItem = cart.find(cartItem => cartItem.id === item.id)
    const quantity = cartItem ? cartItem.quantity : 0

    return (
      <div key={item.id} className="col-12 col-sm-6 col-lg-4">
        <div
          className="card border-0 shadow-sm position-relative"
          style={{
            borderRadius: '12px',
            overflow: 'hidden',
            transition: 'all 0.3s ease-in-out',
            background: 'white',
            boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
          }}
          onMouseEnter={e => {
            e.currentTarget.style.transform = 'translateY(-5px)'
            e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.15)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)'
          }}
        >
          {/* Image */}
          <div className="position-relative">
            <img
              src={item.image}
              className="card-img-top"
              alt={item.name}
              style={{
                height: '200px',
                width: '100%',
                objectFit: 'cover'
              }}
            />
            <div className="position-absolute top-0 end-0 p-2">
              {item.type === 'veg' && <span className="badge bg-success">🥦 Veg</span>}
              {item.type === 'nonveg' && <span className="badge bg-danger">🍗 Non-Veg</span>}
            </div>
          </div>

          {/* Content */}
          <div className="card-body p-3">
            <div className="d-flex justify-content-between align-items-start mb-2">
              <h6 className="card-title fw-bold text-dark mb-0" style={{ fontSize: '16px' }}>
                {item.name}
              </h6>
              <div className="d-flex gap-1">
                {(item.category === 'Starters' || item.category === 'Main Course') && (
                  <span
                    className={`badge ${
                      item.spiceLevel === 'hot'
                        ? 'bg-danger'
                        : item.spiceLevel === 'medium'
                        ? 'bg-warning'
                        : 'bg-success'
                    } text-white`}
                    style={{ fontSize: '10px' }}
                  >
                    {item.spiceLevel}
                  </span>
                )}
              </div>
            </div>

            <p className="card-text text-muted small mb-3" style={{ fontSize: '13px', lineHeight: '1.3' }}>
              {item.description}
            </p>

            <div className="d-flex justify-content-between align-items-center">
              <span
                className="fw-bold"
                style={{
                  fontSize: '16px',
                  background: 'linear-gradient(90deg, #FF6A00, #FF9900)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}
              >
                ₹{item.price.toFixed(2)}
              </span>

              <div className="d-flex align-items-center gap-2">
                {(item.category === 'Starters' || item.category === 'Main Course') && (
                  <div className="d-flex gap-1">
                    {(['mild', 'medium', 'hot'] as const).map(spice => (
                      <button
                        key={spice}
                        className={`btn btn-xs rounded-pill px-2 py-1 ${
                          selectedSpiceLevels[item.id] === spice ? 'text-white' : 'btn-outline-secondary'
                        }`}
                        style={{
                          fontSize: '11px',
                          padding: '2px 6px',
                          background:
                            selectedSpiceLevels[item.id] === spice
                              ? 'linear-gradient(90deg, #FF6A00, #FF9900)'
                              : undefined,
                          border: 'none',
                          transition: 'all 0.2s ease-in-out'
                        }}
                        onClick={() => handleSpiceLevelChange(item.id, spice)}
                      >
                        {spice.charAt(0).toUpperCase() + spice.slice(1)}
                      </button>
                    ))}
                  </div>
                )}

                {quantity > 0 && (
                  <div className="d-flex align-items-center ms-2">
                    <div
                      className="d-flex align-items-center rounded-pill px-2 py-1"
                      style={{
                        background: 'linear-gradient(90deg, #FF6A00, #FF9900)',
                        border: '2px solid #FF6A00',
                        minWidth: '80px',
                        justifyContent: 'space-between'
                      }}
                    >
                      <button
                        className="btn btn-xs fw-bold p-0"
                        style={{
                          backgroundColor: 'transparent',
                          color: 'white',
                          border: 'none',
                          width: '20px',
                          height: '20px',
                          fontSize: '12px'
                        }}
                        onClick={() => updateQuantity(item.id, quantity - 1)}
                      >
                        <FaMinus />
                      </button>
                      <span
                        className="fw-bold text-white"
                        style={{
                          fontSize: '14px',
                          minWidth: '20px',
                          textAlign: 'center'
                        }}
                      >
                        {quantity}
                      </span>
                      <button
                        className="btn btn-xs fw-bold p-0"
                        style={{
                          backgroundColor: 'transparent',
                          color: 'white',
                          border: 'none',
                          width: '20px',
                          height: '20px',
                          fontSize: '12px'
                        }}
                        onClick={() => handleAddToCart(item)}
                      >
                        <FaPlus />
                      </button>
                    </div>
                  </div>
                )}

                {quantity === 0 && (
                  <button
                    className="btn btn-sm rounded-pill px-3 py-2 fw-semibold ms-2"
                    style={{
                      background: 'linear-gradient(90deg, #FF6A00, #FF9900)',
                      color: 'white',
                      border: 'none',
                      fontSize: '13px'
                    }}
                    onClick={() => handleAddToCart(item)}
                  >
                    <FaPlus className="me-1" />
                    Add
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className="container py-5"
      style={{
        background: 'linear-gradient(to bottom, #fffaf4, #fff3e0)',
        minHeight: '100vh'
      }}
    >
      <div className="row">
        <div className="col-12 text-center">
          {/* 🔍 Search Bar */}
          <div className="d-flex justify-content-center mb-4">
            <input
              type="text"
              className="form-control w-75 w-md-50"
              placeholder="Search for an item..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                borderRadius: '50px',
                padding: '12px 20px',
                border: '2px solid #FF6A00',
                outline: 'none',
                maxWidth: '500px',
                background: 'white',
                color: '#333',
                boxShadow: '0 4px 15px rgba(255, 106, 0, 0.3)'
              }}
            />
          </div>

          {/* Filter Bar */}
          <div className="d-flex justify-content-center mb-5">
            <div
              className="d-flex gap-2 overflow-auto pb-2 px-2"
              style={{
                maxWidth: '100%',
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
                WebkitOverflowScrolling: 'touch'
              }}
            >
              {/* Veg/Non-Veg buttons are displayed/hidden based on selectedCategory */}
              {!hideTypeFilter && (
                <>
                  <button
                    type="button"
                    className={`btn ${
                      selectedType === 'veg' ? 'text-white shadow-sm' : 'btn-outline-secondary'
                    } px-3 py-2 px-md-4 py-md-2 rounded-pill fw-semibold d-flex align-items-center gap-2 flex-shrink-0`}
                    onClick={() => setSelectedType('veg')}
                    style={{
                      transition: 'all 0.2s ease',
                      background:
                        selectedType === 'veg'
                          ? 'linear-gradient(90deg, #28a745, #20c997)'
                          : undefined,
                      border: 'none',
                      whiteSpace: 'nowrap',
                      fontSize: '14px'
                    }}
                  >
                    🥦 Veg
                  </button>

                  <button
                    type="button"
                    className={`btn ${
                      selectedType === 'nonveg' ? 'text-white shadow-sm' : 'btn-outline-secondary'
                    } px-3 py-2 px-md-4 py-md-2 rounded-pill fw-semibold d-flex align-items-center gap-2 flex-shrink-0`}
                    onClick={() => setSelectedType('nonveg')}
                    style={{
                      transition: 'all 0.2s ease',
                      background:
                        selectedType === 'nonveg'
                          ? 'linear-gradient(90deg, #dc3545, #fd7e14)'
                          : undefined,
                      border: 'none',
                      whiteSpace: 'nowrap',
                      fontSize: '14px'
                    }}
                  >
                    🍗 Non-Veg
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 🍽 Menu Items */}
      {selectedCategory === 'All' ? (
        Object.entries(groupedItems).map(([category, items]) => (
          <div key={category} className="mb-5">
            <h3
              className="text-center mb-4 fw-bold"
              style={{
                background: 'linear-gradient(90deg, #FF6A00, #FF9900)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}
            >
              {category}
            </h3>
            <div className="row g-3 g-md-4">{items.map(item => renderItem(item))}</div>
          </div>
        ))
      ) : (
        <div className="row g-3 g-md-4">
          {filteredItems.map(item => renderItem(item))}
        </div>
      )}

      {/* Empty State */}
      {filteredItems.length === 0 && (
        <div className="text-center py-5">
          <div className="text-center p-4">
            <img src="/assets/images/no-dishes.png" alt="No dishes found" style={{ width: '230px' }} />
          </div>
        </div>
      )}
    </div>
  )
}

export default Menu