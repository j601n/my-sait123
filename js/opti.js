// Main App Controller
const App = {
    init() {
      this.domContentLoaded();
      this.addStyles();
    },
  
    domContentLoaded() {
      document.addEventListener('DOMContentLoaded', () => {
        // Initialize all components
        SliderComponent.init();
        PriceRangeComponent.init();
        FilterComponent.init();
        SortingComponent.init();
        CartComponent.init();
        PaginationComponent.init();
        ProductsComponent.init();
      });
    },
  
    addStyles() {
      const styleElement = document.createElement('style');
      styleElement.textContent = `
        .catalog__cart-button.clicked {
          background-color: #4CAF50;
        }
        
        .notification {
          position: fixed;
          bottom: 20px;
          right: 20px;
          background-color: #7c4dff;
          color: white;
          padding: 12px 20px;
          border-radius: 4px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.2);
          transform: translateY(100px);
          transition: transform 0.3s ease;
          z-index: 1000;
        }
        
        .price-slider {
          position: relative;
          height: 2px;
          background-color: #E6E6E6;
          margin: 10px 0;
        }
        
        .price-slider .bar {
          position: absolute;
          height: 100%;
          background-color: #7c4dff;
        }
        
        .price-slider .handle {
          position: absolute;
          width: 20px;
          height: 20px;
          background-color: #7c4dff;
          border-radius: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
          cursor: pointer;
        }
        
        .catalog__item.country-highlighted {
          border: 2px solid #7c4dff;
          box-shadow: 0 4px 12px rgba(124, 77, 255, 0.2);
          transition: all 0.3s ease;
        }
        
        .catalog__item.milk-highlighted {
          background-color: rgba(124, 77, 255, 0.05);
          transition: all 0.3s ease;
        }
        
        .catalog__item.price-highlighted .catalog__price {
          color: #7c4dff;
          font-weight: bold;
          transition: all 0.3s ease;
        }
        
        .cart-counter {
          position: absolute;
          top: -5px;
          right: -5px;
          background-color: #f85757;
          color: white;
          border-radius: 50%;
          width: 18px;
          height: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: bold;
        }
        
        .user__list-link {
          position: relative;
        }
      `;
      document.head.appendChild(styleElement);
    }
  };
  
  // UI helper for showing notifications
  const NotificationService = {
    show(message, duration = 3000) {
      if (!document.querySelector('.notification')) {
        const notification = document.createElement('div');
        notification.className = 'notification';
        document.body.appendChild(notification);
      }
      
      const notification = document.querySelector('.notification');
      notification.textContent = message;
      notification.style.transform = 'translateY(0)';
      
      setTimeout(() => {
        notification.style.transform = 'translateY(100px)';
      }, duration);
    }
  };
  
  // Slider Component
  const SliderComponent = {
    slideInterval: null,
    currentSlide: 0,
    
    init() {
      this.sliderItems = document.querySelectorAll('.slider__item');
      if (!this.sliderItems.length) return;
      
      this.dots = document.querySelectorAll('.slider__dot');
      this.prevButton = document.querySelector('.slider__nav-button.prev');
      this.nextButton = document.querySelector('.slider__nav-button.next');
      this.sliderContainer = document.querySelector('.slider');
      
      this.bindEvents();
      this.startAutoSlide();
    },
    
    bindEvents() {
      this.prevButton?.addEventListener('click', () => this.showPrevSlide());
      this.nextButton?.addEventListener('click', () => this.showNextSlide());
      
      this.dots.forEach((dot, index) => {
        dot.addEventListener('click', () => this.showSlide(index));
      });
      
      // Pause auto-slide on hover
      this.sliderContainer?.addEventListener('mouseenter', () => this.pauseAutoSlide());
      this.sliderContainer?.addEventListener('mouseleave', () => this.startAutoSlide());
    },
    
    showSlide(index) {
      this.sliderItems.forEach(item => item.classList.remove('active'));
      this.dots.forEach(dot => dot.classList.remove('active'));
      
      this.sliderItems[index].classList.add('active');
      this.dots[index].classList.add('active');
      this.currentSlide = index;
    },
    
    showPrevSlide() {
      const newIndex = (this.currentSlide - 1 + this.sliderItems.length) % this.sliderItems.length;
      this.showSlide(newIndex);
    },
    
    showNextSlide() {
      const newIndex = (this.currentSlide + 1) % this.sliderItems.length;
      this.showSlide(newIndex);
    },
    
    startAutoSlide() {
      this.pauseAutoSlide();
      this.slideInterval = setInterval(() => this.showNextSlide(), 5000);
    },
    
    pauseAutoSlide() {
      if (this.slideInterval) {
        clearInterval(this.slideInterval);
        this.slideInterval = null;
      }
    }
  };
  
  // Price Range Slider Component
  const PriceRangeComponent = {
    isDragging: false,
    activeHandle: null,
    sliderWidth: 0,
    minValue: 0,
    maxValue: 900,
    
    init() {
      this.priceSlider = document.querySelector('.price-slider');
      if (!this.priceSlider) return;
      
      this.handles = this.priceSlider.querySelectorAll('.handle');
      this.bar = this.priceSlider.querySelector('.bar');
      this.inputs = document.querySelectorAll('.price-inputs input');
      this.sliderWidth = this.priceSlider.offsetWidth;
      
      this.bindEvents();
      this.updateHandlePositions();
    },
    
    bindEvents() {
      // Handle drag events for price slider handles
      this.handles.forEach((handle, index) => {
        handle.addEventListener('mousedown', (e) => {
          this.isDragging = true;
          this.activeHandle = index;
          document.addEventListener('mousemove', this.handleDrag.bind(this));
          document.addEventListener('mouseup', this.stopDrag.bind(this));
          e.preventDefault();
        });
      });
      
      // Update on window resize
      window.addEventListener('resize', () => {
        this.sliderWidth = this.priceSlider.offsetWidth;
        this.updateHandlePositions();
      });
      
      // Update on input change
      this.inputs.forEach(input => {
        input.addEventListener('change', () => {
          input.value = Math.max(0, Math.min(this.maxValue, parseInt(input.value) || 0));
          this.updateHandlePositions();
        });
      });
    },
    
    handleDrag(e) {
      if (!this.isDragging) return;
      
      const sliderRect = this.priceSlider.getBoundingClientRect();
      let newPosition = e.clientX - sliderRect.left;
      newPosition = Math.max(0, Math.min(this.sliderWidth, newPosition));
      
      if (this.activeHandle === 0) {
        const rightHandlePosition = parseInt(this.handles[1].style.left) || this.sliderWidth;
        newPosition = Math.min(newPosition, rightHandlePosition);
      } else {
        const leftHandlePosition = parseInt(this.handles[0].style.left) || 0;
        newPosition = Math.max(newPosition, leftHandlePosition);
      }
      
      this.handles[this.activeHandle].style.left = `${newPosition}px`;
      this.updatePriceInputs();
    },
    
    stopDrag() {
      this.isDragging = false;
      document.removeEventListener('mousemove', this.handleDrag.bind(this));
      document.removeEventListener('mouseup', this.stopDrag.bind(this));
    },
    
    updatePriceInputs() {
      const leftPosition = parseInt(this.handles[0].style.left) || 0;
      const rightPosition = parseInt(this.handles[1].style.left) || 100;
      
      const minPrice = Math.round((leftPosition / this.sliderWidth) * this.maxValue);
      const maxPrice = Math.round((rightPosition / this.sliderWidth) * this.maxValue);
      
      this.inputs[0].value = minPrice;
      this.inputs[1].value = maxPrice;
      this.bar.style.left = `${leftPosition}px`;
      this.bar.style.width = `${rightPosition - leftPosition}px`;
    },
    
    updateHandlePositions() {
      const minPrice = parseInt(this.inputs[0].value) || 0;
      const maxPrice = parseInt(this.inputs[1].value) || this.maxValue;       
      const leftPosition = (minPrice / this.maxValue) * this.sliderWidth;
      const rightPosition = (maxPrice / this.maxValue) * this.sliderWidth;      
      
      this.handles[0].style.left = `${leftPosition}px`;
      this.handles[1].style.left = `${rightPosition}px`;
      this.bar.style.left = `${leftPosition}px`;
      this.bar.style.width = `${rightPosition - leftPosition}px`;
    }
  };
  
  // Product management
  const ProductsComponent = {
    init() {
      this.assignCountryData();
    },
    
    assignCountryData() {
      const products = document.querySelectorAll('.catalog__item');
      
      products.forEach(product => {
        const description = product.querySelector('.catalog__item-desc')?.textContent.toLowerCase() || '';
        
        // Assign country data attribute based on product description
        if (description.includes('дніпр')) {
          product.setAttribute('data-country', 'dnipro');
        } else if (description.includes('київ')) {
          product.setAttribute('data-country', 'kyiv');
        } else if (description.includes('льві')) {
          product.setAttribute('data-country', 'lwow');
        } else if (description.includes('праг') || description.includes('коста-рики')) {
          product.setAttribute('data-country', 'prague');
        } else if (description.includes('крак')) {
          product.setAttribute('data-country', 'kracow');
        } else {
          product.setAttribute('data-country', 'unknown');
        }
      });
    },
    
    highlightByCountries(selectedCountries) {
      const products = document.querySelectorAll('.catalog__item');
      
      // If no countries selected, show all products
      if (!selectedCountries.length) {
        products.forEach(product => {
          product.style.opacity = '1';
          product.classList.remove('country-highlighted');
        });
        return;
      }
      
      // Highlight products from selected countries
      products.forEach(product => {
        const productCountry = product.getAttribute('data-country');
        
        if (selectedCountries.includes(productCountry)) {
          product.style.opacity = '1';
          product.classList.add('country-highlighted');
        } else {
          product.style.opacity = '0.4';
          product.classList.remove('country-highlighted');
        }
      });
    },
    
    filter(minPrice, maxPrice, milkOption, selectedCountries) {
      const products = document.querySelectorAll('.catalog__item');
      
      products.forEach(product => {
        // Reset styling
        product.style.opacity = '1';
        product.classList.remove('country-highlighted', 'milk-highlighted', 'price-highlighted');
        
        // Get product data
        const price = parseInt(product.querySelector('.catalog__price')?.textContent.replace(/\D/g, '') || 0);
        const description = product.querySelector('.catalog__item-desc')?.textContent.toLowerCase() || '';
        const productCountry = product.getAttribute('data-country');
        
        // Check price range
        const priceMatch = price >= minPrice && price <= maxPrice;
        
        // Check milk type
        let milkMatch = true;
        if (milkOption === 'animal-milk') {
          milkMatch = description.includes('контракт');
        } else if (milkOption === 'plant-milk') {
          milkMatch = description.includes('бюджет');
        } else if (milkOption === 'no-milk') {
          milkMatch = !description.includes('молок');
        }
        
        // Check country
        const countryMap = {
         'київ': 'kyiv',
          'львів': 'lwow',
          'дніпро': 'dnipro',
          'прага': 'prague',
          'краків': 'krakov'
        };
        
        let countryMatch = selectedCountries.length === 0;
        
        for (const country of selectedCountries) {
          const countryCode = countryMap[country.toLowerCase()] || country;
          if (productCountry === countryCode) {
            countryMatch = true;
            break;
          }
        }
        
        // Apply filtering
        if (priceMatch && milkMatch && countryMatch) {
          product.style.opacity = '1';
          if (priceMatch) product.classList.add('price-highlighted');
          if (milkMatch) product.classList.add('milk-highlighted');
          if (countryMatch) product.classList.add('country-highlighted');
        } else {
          product.style.opacity = '0.4';
        }
      });
    },
    
    reset() {
      const products = document.querySelectorAll('.catalog__item');
      products.forEach(product => {
        product.style.opacity = '1';
        product.classList.remove('country-highlighted', 'milk-highlighted', 'price-highlighted');
      });
    },
    
    sort(option) {
      const productCards = Array.from(document.querySelectorAll('.catalog__item'));
      const productsContainer = document.querySelector('.catalog__list');
      
      if (!productsContainer || !productCards.length) return;
      
      productCards.forEach(card => card.remove());
      switch(option) {
        case 'expensive':
          productCards.sort((a, b) => {
            const priceA = parseInt(a.querySelector('.catalog__price')?.textContent.replace(/\D/g, '') || 0);
            const priceB = parseInt(b.querySelector('.catalog__price')?.textContent.replace(/\D/g, '') || 0);
            return priceB - priceA;
          });
          break;
        case 'cheap':
          productCards.sort((a, b) => {
            const priceA = parseInt(a.querySelector('.catalog__price')?.textContent.replace(/\D/g, '') || 0);
            const priceB = parseInt(b.querySelector('.catalog__price')?.textContent.replace(/\D/g, '') || 0);
            return priceA - priceB;
          });
          break;
      }
      
      const fragment = document.createDocumentFragment();
      productCards.forEach(card => fragment.appendChild(card));
      productsContainer.appendChild(fragment);
      
      NotificationService.show('Сортування застосовано');
    }
  };
  
  const FilterComponent = {
    init() {
      this.applyButton = document.querySelector('.filter__button');
      this.resetButton = document.querySelector('.filter__button-reset');
      this.countryCheckboxes = document.querySelectorAll('.country-options input[type="checkbox"]');
      
      if (!this.applyButton || !this.resetButton) return;
      
      this.bindEvents();
    },
    
    bindEvents() {
      this.applyButton.addEventListener('click', (e) => {
        e.preventDefault();
        this.applyFilters();
      });
      
      this.resetButton.addEventListener('click', (e) => {
        e.preventDefault();
        this.resetFilters();
      });
      
      this.countryCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', () => {
          this.updateCountryFilters();
        });
      });
    },
    
    applyFilters() {
      const priceInputs = document.querySelectorAll('.price-inputs input');
      const minPrice = parseInt(priceInputs[0].value) || 0;
      const maxPrice = parseInt(priceInputs[1].value) || 900;
      
      const milkOption = document.querySelector('input[name="milk"]:checked')?.id || 'any-milk';
      
      const selectedCountries = [];
      document.querySelectorAll('.country-options input[type="checkbox"]:checked').forEach(checkbox => {
        const countryText = checkbox.nextElementSibling?.nextElementSibling?.textContent?.trim().toLowerCase() || '';
        selectedCountries.push(countryText);
      });
      
      ProductsComponent.filter(minPrice, maxPrice, milkOption, selectedCountries);
      NotificationService.show('Фільтри застосовані');
    },
    
    resetFilters() {
      const priceInputs = document.querySelectorAll('.price-inputs input');
      priceInputs[0].value = 0;
      priceInputs[1].value = 900;
      
      if (document.getElementById('any-milk')) {
        document.getElementById('any-milk').checked = true;
      }
      
      document.querySelectorAll('.country-options input[type="checkbox"]').forEach((checkbox, index) => {
        checkbox.checked = index === 0;
      });
      
      PriceRangeComponent.updateHandlePositions();
      ProductsComponent.reset();
      NotificationService.show('Фільтри скинуто');
    },
    
    updateCountryFilters() {
      const selectedCountries = [];
      
      document.querySelectorAll('.country-options input[type="checkbox"]:checked').forEach(checkbox => {
        const countryText = checkbox.nextElementSibling?.nextElementSibling?.textContent?.trim().toLowerCase() || '';
        
        const countryMap = {
          'київ': 'kyiv',
          'львів': 'lwow',
          'дніпро': 'dnipro',
          'прага': 'prague',
          'краків': 'krakov'
        };
        
        selectedCountries.push(countryMap[countryText] || '');
      });
      
      ProductsComponent.highlightByCountries(selectedCountries);
    }
  };
  
  const SortingComponent = {
    init() {
      this.sortingSelect = document.getElementById('sorting');
      
      if (!this.sortingSelect) return;
      
      this.bindEvents();
    },
    
    bindEvents() {
      this.sortingSelect.addEventListener('change', () => {
        const selectedOption = this.sortingSelect.value;
        ProductsComponent.sort(selectedOption);
      });
    }
  };
  
  const CartComponent = {
    init() {
      this.initCartButtons();
      this.initSliderCartButtons();
      this.updateCartCounter();
    },
    
    initCartButtons() {
      const addToCartButtons = document.querySelectorAll('.catalog__cart-button');
      
      addToCartButtons.forEach(button => {
        button.addEventListener('click', () => {
          const productCard = button.closest('.catalog__item');
          if (!productCard) return;
          
          const productName = productCard.querySelector('.catalog__item-title')?.textContent || '';
          const productPrice = productCard.querySelector('.catalog__price')?.textContent || '';
          const productImage = productCard.querySelector('.catalog__img')?.getAttribute('src') || '';
          
          this.addToCart(productName, productPrice, productImage);
          this.animateButton(button);
        });
      });
    },
    
    initSliderCartButtons() {
      const slideButtons = document.querySelectorAll('.slider__button');
      
      slideButtons.forEach(button => {
        button.addEventListener('click', () => {
          const slideItem = button.closest('.slider__item');
          if (!slideItem) return;
          
          const productName = slideItem.querySelector('.slider__title')?.textContent || '';
          const productPrice = slideItem.querySelector('.slider__new-price')?.textContent || '';
          const productImage = slideItem.querySelector('.slider__image img')?.getAttribute('src') || '';
          
          this.addToCart(productName, productPrice, productImage);
        });
      });
    },
    
    getCart() {
      const cartItems = localStorage.getItem('drink2goCart');
      return cartItems ? JSON.parse(cartItems) : [];
    },
    
    addToCart(productTitle, productPrice, productImage) {
      const cart = this.getCart();
      
      const existingProductIndex = cart.findIndex(item => item.title === productTitle);
      
      if (existingProductIndex !== -1) {
        cart[existingProductIndex].quantity += 1;
      } else {
        cart.push({
          title: productTitle,
          price: productPrice,
          image: productImage,
          quantity: 1
        });
      }
      
      localStorage.setItem('drink2goCart', JSON.stringify(cart));
      this.updateCartCounter();
      NotificationService.show(`"${productTitle}" додано до кошика`);
    },
    
    updateCartCounter() {
      const cart = this.getCart();
      const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
      const cartIconContainer = document.querySelector('.user__list-item:last-child .user__list-link');
      
      if (!cartIconContainer) return;
      
      let cartCounter = cartIconContainer.querySelector('.cart-counter');
      
      if (!cartCounter && totalItems > 0) {
        cartCounter = document.createElement('span');
        cartCounter.className = 'cart-counter';
        cartIconContainer.appendChild(cartCounter);
      }
      
      if (cartCounter) {
        if (totalItems > 0) {
          cartCounter.textContent = totalItems;
          cartCounter.style.display = 'block';
        } else {
          cartCounter.style.display = 'none';
        }
      }
    },
    
    animateButton(button) {
      button.classList.add('clicked');
      
      const buttonText = button.querySelector('span');
      if (buttonText) {
        buttonText.textContent = 'Додано';
      }
      
      setTimeout(() => {
        button.classList.remove('clicked');
        if (buttonText) {
          buttonText.textContent = 'В кошик';
        }
      }, 1500);
    }
  };

  const PaginationComponent = {
    init() {
      this.paginationItems = document.querySelectorAll('.pagination__item a');
      this.prevButton = document.querySelector('.pagination__button-back');
      this.nextButton = document.querySelector('.pagination__button-next');
      
      if (!this.paginationItems.length) return;
      
      this.bindEvents();
    },
    
    bindEvents() {
      this.paginationItems.forEach(item => {
        item.addEventListener('click', (e) => {
          e.preventDefault();
          this.setActivePage(item);
        });
      });
      
      this.prevButton?.addEventListener('click', (e) => {
        e.preventDefault();
        this.goToPrevPage();
      });
      
      this.nextButton?.addEventListener('click', (e) => {
        e.preventDefault();
        this.goToNextPage();
      });
    },
    
    setActivePage(pageLink) {
      this.paginationItems.forEach(i => {
        i.classList.remove('padination__link__link-active');
        i.parentElement?.classList.remove('pagination__item-active');
      });
    
      pageLink.classList.add('padination__link__link-active');
      pageLink.parentElement?.classList.add('pagination__item-active');
      
      const page = pageLink.textContent;
      NotificationService.show(`Перехід на сторінку ${page}`);
    },
    
    goToPrevPage() {
      const currentActive = document.querySelector('.pagination__item-active');
      if (!currentActive) return;
      
      const prevItem = currentActive.previousElementSibling;
      if (prevItem && prevItem.classList.contains('pagination__item')) {
        const pageLink = prevItem.querySelector('a');
        if (pageLink) {
          this.setActivePage(pageLink);
        }
      }
    },
    
    goToNextPage() {
      const currentActive = document.querySelector('.pagination__item-active');
      if (!currentActive) return;
      
      const nextItem = currentActive.nextElementSibling;
      if (nextItem && nextItem.classList.contains('pagination__item')) {
        const pageLink = nextItem.querySelector('a');
        if (pageLink) {
          this.setActivePage(pageLink);
        }
      }
    }
  };
  
  App.init();
document.addEventListener('DOMContentLoaded', function() {
    initializeModals();
    initializeShoppingCart();
    initializeMobileMenu();
    
    if (document.querySelector('.slider')) {
      initializeSlider();
    }
  });
  
  // MODAL FUNCTIONALITY
  function initializeModals() {
    // Modal elements
    const loginButton = document.querySelector('.user__list-item:first-child .user__list-link');
    const body = document.body;
    
    if (!document.getElementById('loginModal')) {
      createLoginModal();
    }
    
    if (!document.getElementById('cartModal')) {
      createCartModal();
    }
    
    const loginModal = document.getElementById('loginModal');
    const cartModal = document.getElementById('cartModal');
    const closeButtons = document.querySelectorAll('.modal-close');
    
    loginButton.addEventListener('click', function(e) {
      e.preventDefault();
      openModal(loginModal);
    });
    
    closeButtons.forEach(button => {
      button.addEventListener('click', function() {
        closeModal(this.closest('.modal'));
      });
    });
    
    window.addEventListener('click', function(e) {
      if (e.target.classList.contains('modal')) {
        closeModal(e.target);
      }
    });
    
    setupEmailValidation();
    
    addModalStyles();
  }
  
  function openModal(modal) {
    modal.style.display = 'flex';
    document.body.classList.add('modal-open');
    
    if (modal.id === 'cartModal') {
      updateCartModal();
    }
  }
  
  function closeModal(modal) {
    modal.style.display = 'none';
    document.body.classList.remove('modal-open');
  }
  function createLoginModal() {
    const loginModalHTML = `
      <div id="loginModal" class="modal">
        <div class="modal-content">
          <span class="modal-close">&times;</span>
          <h2>Увійти</h2>
          <form class="login-form" id="loginForm">
            <div class="form-group">
              <input type="email" id="email" name="email" placeholder="Email (тільки @gmail.com)" required pattern="[a-zA-Z0-9._%+-]+@gmail\\.com$">
              <div class="error-message" id="emailError">Будь ласка, використовуйте пошту з доменом @gmail.com</div>
            </div>
            <div class="form-group">
              <input type="password" id="password" name="password" placeholder="Пароль" required>
            </div>
            <button type="submit" class="login-button">Логін</button>
          </form>
        </div>
      </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', loginModalHTML);
  }
  
  function setupEmailValidation() {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
      const emailInput = document.getElementById('email');
      const emailError = document.getElementById('emailError');
      
      emailInput.addEventListener('input', function() {
        validateEmail(this);
      });
      
      emailInput.addEventListener('blur', function() {
        validateEmail(this);
      });
      
      loginForm.addEventListener('submit', function(e) {
        if (!validateEmail(emailInput)) {
          e.preventDefault();
        }
      });
      
      function validateEmail(input) {
        const emailRegex = /[a-zA-Z0-9._%+-]+@gmail\.com$/;
        const isValid = emailRegex.test(input.value);
        
        if (isValid) {
          emailError.style.display = 'none';
          input.classList.remove('invalid');
          input.classList.add('valid');
          return true;
        } else {
          emailError.style.display = 'block';
          input.classList.remove('valid');
          input.classList.add('invalid');
          return false;
        }
      }
    }
  }
  
  function createCartModal() {
    const cartModalHTML = `
      <div id="cartModal" class="modal">
        <div class="modal-content">
          <span class="modal-close">&times;</span>
          <h2>Кошик</h2>
          <div class="cart-items">
            <div class="cart-empty">Ваш кошик порожній</div>
            <!-- Cart items will be added here dynamically -->
          </div>
          <div class="cart-total">
            <div class="total-label">Загальна сума:</div>
            <div class="total-amount">0 грн</div>
          </div>
          <button class="checkout-button">Оформити замовлення</button>
        </div>
      </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', cartModalHTML);
  }
  
  // SHOPPING CART FUNCTIONALITY
  function initializeShoppingCart() {
    const addToCartButtons = document.querySelectorAll('.catalog__cart-button');
    const cartIconContainer = document.querySelector('.user__list-item:last-child .user__list-link');
    
    addToCartButtons.forEach(button => {
      button.addEventListener('click', function() {
        const productItem = this.closest('.catalog__item');
        const productTitle = productItem.querySelector('.catalog__item-title').textContent;
        const productPrice = productItem.querySelector('.catalog__price').textContent;
        const productImage = productItem.querySelector('.catalog__img').getAttribute('src');
        
        addToCart(productTitle, productPrice, productImage);
      });
    });
    
    cartIconContainer.addEventListener('click', function(e) {
      e.preventDefault();
      const cartModal = document.getElementById('cartModal');
      if (cartModal) {
        openModal(cartModal);
      }
    });
    
    setupSliderCartButtons();
    
    addCartStyles();
    
    updateCartCounter();
  }
  
  function getCart() {
    const cartItems = localStorage.getItem('drink2goCart');
    return cartItems ? JSON.parse(cartItems) : [];
  }
  
  function addToCart(productTitle, productPrice, productImage) {
    const cart = getCart();
    
    const existingProductIndex = cart.findIndex(item => item.title === productTitle);
    
    if (existingProductIndex !== -1) {
      cart[existingProductIndex].quantity += 1;
      showNotification(`Кількість "${productTitle}" збільшено до ${cart[existingProductIndex].quantity}`);
    } else {
      cart.push({
        title: productTitle,
        price: productPrice,
        image: productImage,
        quantity: 1
      });
      showNotification(`"${productTitle}" додано до кошика`);
    }
    
    localStorage.setItem('drink2goCart', JSON.stringify(cart));
    
    updateCartCounter();
    updateCartModal();
  }
  
  function updateCartCounter() {
    const cart = getCart();
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    const cartIconContainer = document.querySelector('.user__list-item:last-child .user__list-link');
    
    let cartCounter = cartIconContainer.querySelector('.cart-counter');
    
    if (!cartCounter && totalItems > 0) {
      cartCounter = document.createElement('span');
      cartCounter.className = 'cart-counter';
      cartIconContainer.appendChild(cartCounter);
    }
    
    if (cartCounter) {
      if (totalItems > 0) {
        cartCounter.textContent = totalItems;
        cartCounter.style.display = 'block';
      } else {
        cartCounter.style.display = 'none';
      }
    }
  }
  
  function updateCartModal() {
    const cartModal = document.getElementById('cartModal');
    if (!cartModal) return;
    
    const cartItemsContainer = cartModal.querySelector('.cart-items');
    const totalAmountElement = cartModal.querySelector('.total-amount');
    
    const cart = getCart();
    
    cartItemsContainer.innerHTML = '';
    
    if (cart.length === 0) {
      cartItemsContainer.innerHTML = '<div class="cart-empty">Ваш кошик порожній</div>';
      totalAmountElement.textContent = '0 грн';
      return;
    }
    
    let totalAmount = 0;
    
    cart.forEach((item, index) => {
      const price = parseInt(item.price.replace(/\\D/g, ''));
      const itemTotal = price * item.quantity;
      totalAmount += itemTotal;
      
      const cartItemHTML = `
        <div class="cart-item" data-index="${index}">
          <img src="${item.image}" alt="${item.title}" class="cart-item-image">
          <div class="cart-item-details">
            <div class="cart-item-name">${item.title}</div>
            <div class="cart-item-price">${price} грн × ${item.quantity} = ${itemTotal} грн</div>
          </div>
          <div class="cart-item-quantity">
            <button class="quantity-btn decrease-btn">-</button>
            <span class="quantity-value">${item.quantity}</span>
            <button class="quantity-btn increase-btn">+</button>
          </div>
          <button class="remove-item-button">×</button>
        </div>
      `;
      
      cartItemsContainer.insertAdjacentHTML('beforeend', cartItemHTML);
    });
    
    totalAmountElement.textContent = `${totalAmount} грн`;
    
    setupCartItemControls(cart);
  }
  
  function setupCartItemControls(cart) {
    const cartModal = document.getElementById('cartModal');
    const removeButtons = cartModal.querySelectorAll('.remove-item-button');
    const increaseButtons = cartModal.querySelectorAll('.increase-btn');
    const decreaseButtons = cartModal.querySelectorAll('.decrease-btn');
    const cartItemsContainer = cartModal.querySelector('.cart-items');
    const totalAmountElement = cartModal.querySelector('.total-amount');
    
    removeButtons.forEach(button => {
      button.addEventListener('click', function() {
        const cartItem = this.closest('.cart-item');
        const index = parseInt(cartItem.dataset.index);
        
        cart.splice(index, 1);
        cartItem.remove();
        
        cartModal.querySelectorAll('.cart-item').forEach((item, i) => {
          item.dataset.index = i;
        });
        
        if (cart.length === 0) {
          cartItemsContainer.innerHTML = '<div class="cart-empty">Ваш кошик порожній</div>';
        }
        
        localStorage.setItem('drink2goCart', JSON.stringify(cart));
        
        updateCartTotal();
        updateCartCounter();
      });
    });
    
    increaseButtons.forEach(button => {
      button.addEventListener('click', function() {
        const cartItem = this.closest('.cart-item');
        const index = parseInt(cartItem.dataset.index);
        const quantityElement = cartItem.querySelector('.quantity-value');
        
        cart[index].quantity += 1;
        quantityElement.textContent = cart[index].quantity;
        
        const price = parseInt(cart[index].price.replace(/\\D/g, ''));
        const itemTotal = price * cart[index].quantity;
        cartItem.querySelector('.cart-item-price').textContent = `${price} грн × ${cart[index].quantity} = ${itemTotal} грн`;
        
        localStorage.setItem('drink2goCart', JSON.stringify(cart));
        
        updateCartTotal();
        updateCartCounter();
      });
    });
    
    decreaseButtons.forEach(button => {
      button.addEventListener('click', function() {
        const cartItem = this.closest('.cart-item');
        const index = parseInt(cartItem.dataset.index);
        const quantityElement = cartItem.querySelector('.quantity-value');
        
        if (cart[index].quantity > 1) {
          cart[index].quantity -= 1;
          quantityElement.textContent = cart[index].quantity;
          
          const price = parseInt(cart[index].price.replace(/\\D/g, ''));
          const itemTotal = price * cart[index].quantity;
          cartItem.querySelector('.cart-item-price').textContent = `${price} грн × ${cart[index].quantity} = ${itemTotal} грн`;
          
          localStorage.setItem('drink2goCart', JSON.stringify(cart));
          
          updateCartTotal();
          updateCartCounter();
        }
      });
    });
    
    function updateCartTotal() {
      let total = 0;
      
      cart.forEach(item => {
        const price = parseInt(item.price.replace(/\\D/g, ''));
        total += price * item.quantity;
      });
      
      totalAmountElement.textContent = `${total} грн`;
    }
  }
  
  function setupSliderCartButtons() {
    const sliderButtons = document.querySelectorAll('.slider__button');
    
    sliderButtons.forEach(button => {
      button.addEventListener('click', function() {
        const activeSlide = document.querySelector('.slider__item.active');
        if (!activeSlide) return;
        
        const productTitle = activeSlide.querySelector('.slider__title').textContent;
        const productPrice = activeSlide.querySelector('.slider__new-price').textContent;
        const productImage = activeSlide.querySelector('.slider__image img').getAttribute('src');
        
        addToCart(productTitle, productPrice, productImage);
      });
    });
  }
  
  // SLIDER FUNCTIONALITY
  function initializeSlider() {
    const slides = document.querySelectorAll('.slider__item');
    const dots = document.querySelectorAll('.slider__dot');
    const prevButton = document.querySelector('.slider__nav-button.prev');
    const nextButton = document.querySelector('.slider__nav-button.next');
    let currentSlide = 0;
    let autoSlideInterval;
    
    showSlide(currentSlide);
    
    if (prevButton && nextButton) {
      nextButton.addEventListener('click', () => {
        currentSlide = (currentSlide + 1) % slides.length;
        showSlide(currentSlide);
        resetAutoSlide();
      });
      
      prevButton.addEventListener('click', () => {
        currentSlide = (currentSlide - 1 + slides.length) % slides.length;
        showSlide(currentSlide);
        resetAutoSlide();
      });
    }
    
    dots.forEach((dot, index) => {
      dot.addEventListener('click', () => {
        currentSlide = index;
        showSlide(currentSlide);
        resetAutoSlide();
      });
    });
    
    setupSliderTouchNavigation(slides);
    
    startAutoSlide();
    
    function showSlide(index) {
      slides.forEach((slide, i) => {
        slide.classList.remove('active');
        dots[i]?.classList.remove('active');
      });
      
      slides[index].classList.add('active');
      dots[index]?.classList.add('active');
    }
    
    function startAutoSlide() {
      autoSlideInterval = setInterval(() => {
        currentSlide = (currentSlide + 1) % slides.length;
        showSlide(currentSlide);
      }, 5000);
    }
    
    function resetAutoSlide() {
      clearInterval(autoSlideInterval);
      startAutoSlide();
    }
  }
  
  function setupSliderTouchNavigation(slides) {
    let touchStartX = 0;
    let touchEndX = 0;
    
    const slider = document.querySelector('.slider');
    
    if (slider) {
      slider.addEventListener('touchstart', function(e) {
        touchStartX = e.changedTouches[0].screenX;
      }, false);
      
      slider.addEventListener('touchend', function(e) {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
      }, false);
      
      function handleSwipe() {
        const sliderDots = document.querySelectorAll('.slider__dot');
        let currentSlide = Array.from(slides).findIndex(slide => slide.classList.contains('active'));
        
        if (touchEndX < touchStartX - 50) {
          
          currentSlide = currentSlide === slides.length - 1 ? 0 : currentSlide + 1;
        } else if (touchEndX > touchStartX + 50) {
          
          currentSlide = currentSlide === 0 ? slides.length - 1 : currentSlide - 1;
        } else {
          return; 
        }
        
        
        slides.forEach((slide, i) => {
          slide.classList.remove('active');
          sliderDots[i]?.classList.remove('active');
        });
        
        slides[currentSlide].classList.add('active');
        sliderDots[currentSlide]?.classList.add('active');
      }
    }
  }
  
  // MOBILE MENU FUNCTIONALITY
  function initializeMobileMenu() {
    const headerContainer = document.querySelector('.header__container');
    if (!headerContainer) return;
    
    
    if (!document.querySelector('.menu-toggle')) {
      const menuToggle = document.createElement('button');
      menuToggle.classList.add('menu-toggle');
      menuToggle.innerHTML = '<span></span>';
      headerContainer.insertBefore(menuToggle, document.querySelector('.menu__list-block'));
      
      
      const menuOverlay = document.createElement('div');
      menuOverlay.classList.add('menu-overlay');
      document.body.appendChild(menuOverlay);
      
      
      menuToggle.addEventListener('click', function() {
        this.classList.toggle('active');
        document.querySelector('.menu__list-block').classList.toggle('active');
        menuOverlay.classList.toggle('active');
        document.body.classList.toggle('no-scroll');
      });
      
      
      menuOverlay.addEventListener('click', function() {
        menuToggle.classList.remove('active');
        document.querySelector('.menu__list-block').classList.remove('active');
        this.classList.remove('active');
        document.body.classList.remove('no-scroll');
      });
    }
    
    
    setupMobileFilters();
    
    
    window.addEventListener('resize', function() {
      if (window.innerWidth > 767) {
        document.querySelector('.menu__list-block')?.classList.remove('active');
        document.querySelector('.menu-toggle')?.classList.remove('active');
        document.querySelector('.menu-overlay')?.classList.remove('active');
        document.body.classList.remove('no-scroll');
      }
    });
  }
  
  function setupMobileFilters() {
    if (window.innerWidth <= 767) {
      const filterContainer = document.querySelector('.filter-container');
      
      if (filterContainer && !filterContainer.querySelector('.filter-toggle')) {
        
        const filterToggle = document.createElement('button');
        filterToggle.classList.add('filter-toggle');
        filterToggle.textContent = 'Фільтри';
        
        
        const filterCollapse = document.createElement('div');
        filterCollapse.classList.add('filter-collapse');
        
        
        Array.from(filterContainer.querySelectorAll('fieldset')).forEach(fieldset => {
          filterCollapse.appendChild(fieldset);
        });
        
        
        filterContainer.appendChild(filterToggle);
        filterContainer.appendChild(filterCollapse);
        
        
        filterToggle.addEventListener('click', function() {
          filterCollapse.classList.toggle('active');
        });
      }
    }
  }
  
  // UTILITY FUNCTIONS
  function showNotification(message) {
    if (!document.getElementById('notification')) {
      const notificationHTML = `
        <div id="notification" class="notification"></div>
      `;
      document.body.insertAdjacentHTML('beforeend', notificationHTML);
      
      
      const style = document.createElement('style');
      style.textContent = `
        .notification {
          position: fixed;
          bottom: 20px;
          right: 20px;
          background-color: #7859cf;
          color: white;
          padding: 10px 20px;
          border-radius: 5px;
          z-index: 1000;
          box-shadow: 0 2px 5px rgba(0,0,0,0.2);
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        
        .notification.show {
          opacity: 1;
        }
      `;
      document.head.appendChild(style);
    }
    
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.classList.add('show');
    
    setTimeout(() => {
      notification.classList.remove('show');
    }, 3000);
  }
  
  // STYLES
  function addModalStyles() {
    const style = document.createElement('style');
    style.textContent = `
      .modal {
        display: none;
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
        z-index: 1000;
        justify-content: center;
        align-items: center;
      }
      
      .modal-content {
        background-color: white;
        padding: 20px;
        border-radius: 5px;
        width: 80%;
        max-width: 500px;
        max-height: 80vh;
        overflow-y: auto;
        position: relative;
      }
      
      .modal-close {
        position: absolute;
        top: 10px;
        right: 10px;
        font-size: 24px;
        cursor: pointer;
      }
      
      .cart-items {
        margin: 20px 0;
        max-height: 300px;
        overflow-y: auto;
      }
      
      .cart-total {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-weight: bold;
        margin: 20px 0;
        padding-top: 10px;
        border-top: 1px solid #eee;
      }
      
      .checkout-button {
        background-color: #7859cf;
        color: white;
        border: none;
        padding: 10px 20px;
        border-radius: 4px;
        cursor: pointer;
        width: 100%;
        font-weight: bold;
      }
      
      .checkout-button:hover {
        background-color: #6344b1;
      }
      
      .cart-empty {
        text-align: center;
        padding: 20px;
        color: #888;
      }
      
      .modal-open {
        overflow: hidden;
      }
      
      .error-message {
        color: red;
        font-size: 0.8em;
        margin-top: 5px;
        display: none;
      }
      
      input.invalid {
        border-color: red;
      }
      
      input.valid {
        border-color: green;
      }
    `;
    document.head.appendChild(style);
  }
  
  function addCartStyles() {
    const style = document.createElement('style');
    style.textContent = `
      .cart-counter {
        position: absolute;
        top: -5px;
        right: -5px;
        background-color: #f85757;
        color: white;
        border-radius: 50%;
        width: 18px;
        height: 18px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        font-weight: bold;
      }
      
      .user__list-link {
        position: relative;
      }
      
      .cart-item {
        display: flex;
        align-items: center;
        padding: 10px;
        border-bottom: 1px solid #eee;
      }
      
      .cart-item-image {
        width: 50px;
        height: 50px;
        object-fit: contain;
        margin-right: 10px;
      }
      
      .cart-item-details {
        flex-grow: 1;
      }
      
      .cart-item-name {
        font-weight: bold;
        margin-bottom: 5px;
      }
      
      .cart-item-price {
        color: #7859cf;
      }
      
      .cart-item-quantity {
        display: flex;
        align-items: center;
        margin-left: 10px;
      }
      
      .quantity-btn {
        width: 25px;
        height: 25px;
        background-color: #f5f5f5;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      
      .quantity-value {
        margin: 0 10px;
      }
      
      .remove-item-button {
        background: none;
        border: none;
        color: #f85757;
        font-size: 20px;
        cursor: pointer;
        padding: 0 5px;
      }
        /* Покращені стилі виділення для фільтрів */
        .catalog__item {
          transition: all 0.3s ease;
          border: 2px solid transparent;
        }
        
        .catalog__item.country-highlighted {
          border: 3px solid #FF6B35;
          box-shadow: 0 6px 20px rgba(255, 107, 53, 0.3);
          transform: translateY(-2px);
        }
        
        .catalog__item.milk-highlighted {
          background: linear-gradient(135deg, rgba(76, 175, 80, 0.1), rgba(76, 175, 80, 0.05));
          border-left: 4px solid #4CAF50;
        }
        
        .catalog__item.price-highlighted .catalog__price {
          background: linear-gradient(45deg, #7c4dff, #9c27b0);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          font-weight: bold;
          font-size: 1.2em;
          text-shadow: 0 2px 4px rgba(124, 77, 255, 0.3);
        }
        
        /* Комбіновані виділення */
        .catalog__item.country-highlighted.milk-highlighted {
          background: linear-gradient(135deg, rgba(255, 107, 53, 0.1), rgba(76, 175, 80, 0.1));
          border: 3px solid #FF6B35;
          border-left: 6px solid #4CAF50;
        }
        
        .catalog__item.country-highlighted.price-highlighted {
          box-shadow: 0 8px 25px rgba(255, 107, 53, 0.4);
        }
        
        .catalog__item.milk-highlighted.price-highlighted {
          background: linear-gradient(135deg, rgba(76, 175, 80, 0.15), rgba(124, 77, 255, 0.1));
        }
        
        .catalog__item.country-highlighted.milk-highlighted.price-highlighted {
          background: linear-gradient(135deg, rgba(255, 107, 53, 0.1), rgba(76, 175, 80, 0.1), rgba(124, 77, 255, 0.1));
          border: 3px solid #FF6B35;
          border-left: 6px solid #4CAF50;
          box-shadow: 0 8px 25px rgba(124, 77, 255, 0.4);
        }
        
        /* Анімація для не виділених товарів */
        .catalog__item.filtered-out {
          opacity: 0.3;
          transform: scale(0.98);
          filter: grayscale(0.5);
        }
        
        .cart-counter {
          position: absolute;
          top: -5px;
          right: -5px;
          background-color: #f85757;
          color: white;
          border-radius: 50%;
          width: 18px;
          height: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: bold;
        }
        
        .user__list-link {
          position: relative;
        }

        /* Стилі для індикаторів фільтрів */
        .filter-indicator {
          display: inline-block;
          padding: 2px 6px;
          border-radius: 3px;
          font-size: 0.8em;
          font-weight: bold;
          margin: 2px;
          color: white;
        }
        
        .filter-indicator.country {
          background-color: #FF6B35;
        }
        
        .filter-indicator.milk {
          background-color: #4CAF50;
        }
        
        .filter-indicator.price {
          background-color: #7c4dff;
        }
      `;
    
    document.head.appendChild(style);
  }