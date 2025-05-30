document.addEventListener('DOMContentLoaded', function() {
  initSlider();
  initPriceRangeSlider();
  initFilterButtons();
  initSorting();
  initCartButtons();
  initPagination();
});

function initSlider() {
  const sliderItems = document.querySelectorAll('.slider__item');
  const dots = document.querySelectorAll('.slider__dot');
  const prevButton = document.querySelector('.slider__nav-button.prev');
  const nextButton = document.querySelector('.slider__nav-button.next');
  let currentSlide = 0;

  function showSlide(index) {
      // Скрываем все слайды и удаляем активный класс с точек
      sliderItems.forEach(item => item.classList.remove('active'));
      dots.forEach(dot => dot.classList.remove('active'));
      
      // Показываем текущий слайд и активируем соответствующую точку
      sliderItems[index].classList.add('active');
      dots[index].classList.add('active');
      currentSlide = index;
  }

  // Навигация по стрелкам
  prevButton.addEventListener('click', function() {
      let newIndex = currentSlide - 1;
      if (newIndex < 0) newIndex = sliderItems.length - 1;
      showSlide(newIndex);
  });

  nextButton.addEventListener('click', function() {
      let newIndex = currentSlide + 1;
      if (newIndex >= sliderItems.length) newIndex = 0;
      showSlide(newIndex);
  });

  // Навигация по точкам
  dots.forEach((dot, index) => {
      dot.addEventListener('click', function() {
          showSlide(index);
      });
  });

  // Автоматическая смена слайдов
  let slideInterval = setInterval(function() {
      let newIndex = currentSlide + 1;
      if (newIndex >= sliderItems.length) newIndex = 0;
      showSlide(newIndex);
  }, 5000);

  // Остановка автоматической смены при наведении на слайдер
  const sliderContainer = document.querySelector('.slider');
  sliderContainer.addEventListener('mouseenter', function() {
      clearInterval(slideInterval);
  });

  sliderContainer.addEventListener('mouseleave', function() {
      slideInterval = setInterval(function() {
          let newIndex = currentSlide + 1;
          if (newIndex >= sliderItems.length) newIndex = 0;
          showSlide(newIndex);
      }, 5000);
  });
}

function initPriceRangeSlider() {
  const priceSlider = document.querySelector('.price-slider');
  if (!priceSlider) return;
  
  const handles = priceSlider.querySelectorAll('.handle');
  const bar = priceSlider.querySelector('.bar');
  const inputs = document.querySelectorAll('.price-inputs input');
  
  let isDragging = false;
  let activeHandle = null;
  let sliderWidth = priceSlider.offsetWidth;
  let minValue = 0;
  let maxValue = 900;
  
  // Инициализация позиций ползунков
  updateHandlePositions();
  
  function updatePriceInputs() {
      const leftPosition = parseInt(handles[0].style.left) || 0;
      const rightPosition = parseInt(handles[1].style.left) || 100;
      
      const minPrice = Math.round((leftPosition / sliderWidth) * maxValue);
      const maxPrice = Math.round((rightPosition / sliderWidth) * maxValue);
      
      inputs[0].value = minPrice;
      inputs[1].value = maxPrice;
      bar.style.left = `${leftPosition}px`;
      bar.style.width = `${rightPosition - leftPosition}px`;
  }
  
  function updateHandlePositions() {
      const minPrice = parseInt(inputs[0].value) || 0;
      const maxPrice = parseInt(inputs[1].value) || maxValue;       
      const leftPosition = (minPrice / maxValue) * sliderWidth;
      const rightPosition = (maxPrice / maxValue) * sliderWidth;      
      handles[0].style.left = `${leftPosition}px`;
      handles[1].style.left = `${rightPosition}px`;
      bar.style.left = `${leftPosition}px`;
      bar.style.width = `${rightPosition - leftPosition}px`;
  }
  
  handles.forEach((handle, index) => {
      handle.addEventListener('mousedown', function(e) {
          isDragging = true;
          activeHandle = index;
          document.addEventListener('mousemove', handleDrag);
          document.addEventListener('mouseup', stopDrag);
          e.preventDefault();
      });
  });
  
  function handleDrag(e) {
      if (!isDragging) return;
      const sliderRect = priceSlider.getBoundingClientRect();
      let newPosition = e.clientX - sliderRect.left;
      newPosition = Math.max(0, Math.min(sliderWidth, newPosition));
      
      if (activeHandle === 0) {
          const rightHandlePosition = parseInt(handles[1].style.left) || sliderWidth;
          newPosition = Math.min(newPosition, rightHandlePosition);
      } else {
          const leftHandlePosition = parseInt(handles[0].style.left) || 0;
          newPosition = Math.max(newPosition, leftHandlePosition);
      }
      
      handles[activeHandle].style.left = `${newPosition}px`;
      updatePriceInputs();
  }   
  
  function stopDrag() {
      isDragging = false;
      document.removeEventListener('mousemove', handleDrag);
      document.removeEventListener('mouseup', stopDrag);
  }
  
  window.addEventListener('resize', function() {
      sliderWidth = priceSlider.offsetWidth;
      updateHandlePositions();
  });
  
  inputs.forEach(input => {
      input.addEventListener('change', function() {
          this.value = Math.max(0, Math.min(maxValue, parseInt(this.value) || 0));
          updateHandlePositions();
      });
  });
}

function initFilterButtons() {
  const applyButton = document.querySelector('.filter__button');
  const resetButton = document.querySelector('.filter__button-reset');
  
  if (!applyButton || !resetButton) return;
  
  applyButton.addEventListener('click', function(e) {
      e.preventDefault();
      const priceInputs = document.querySelectorAll('.price-inputs input');
      const minPrice = priceInputs[0].value;
      const maxPrice = priceInputs[1].value;
      
      const milkOption = document.querySelector('input[name="milk"]:checked').id;
      
      const selectedCountries = [];
      document.querySelectorAll('.country-options input[type="checkbox"]:checked').forEach(checkbox => {
          selectedCountries.push(checkbox.nextElementSibling.nextElementSibling.textContent);
      });
      
      console.log('Применяем фильтры:', {
          ценовойДиапазон: { минимум: minPrice, максимум: maxPrice },
          молоко: milkOption,
          страны: selectedCountries
      });
      
      showNotification('Фільтри застосовані');
      simulateFilteredProducts();
  });
  
  resetButton.addEventListener('click', function(e) {
      e.preventDefault();
      const priceInputs = document.querySelectorAll('.price-inputs input');
      priceInputs[0].value = 0;
      priceInputs[1].value = 900;
      
      document.getElementById('any-milk').checked = true;
      
      document.querySelectorAll('.country-options input[type="checkbox"]').forEach((checkbox, index) => {
          checkbox.checked = index === 0; // Только первый (Бразилия) отмечен
      });
      
      initPriceRangeSlider();
      showNotification('Фільтри скинуто');
      resetProducts();
  });
}

function initSorting() {
  const sortingSelect = document.getElementById('sorting');
  
  if (!sortingSelect) return;
  
  sortingSelect.addEventListener('change', function() {
      const selectedOption = this.value;
      console.log('Сортируем по:', selectedOption);
      simulateSorting(selectedOption);
  });
}

function simulateSorting(sortOption) {
  const productCards = Array.from(document.querySelectorAll('.catalog__item'));
  const productsContainer = document.querySelector('.catalog__list');
  
  if (!productsContainer || productCards.length === 0) return;
  
  productCards.forEach(card => card.remove());
  
  switch(sortOption) {
      case 'expensive':
          productCards.sort((a, b) => {
              const priceA = parseInt(a.querySelector('.catalog__price').textContent.replace(/\D/g, ''));
              const priceB = parseInt(b.querySelector('.catalog__price').textContent.replace(/\D/g, ''));
              return priceB - priceA;
          });
          break;
      case 'cheap':
          productCards.sort((a, b) => {
              const priceA = parseInt(a.querySelector('.catalog__price').textContent.replace(/\D/g, ''));
              const priceB = parseInt(b.querySelector('.catalog__price').textContent.replace(/\D/g, ''));
              return priceA - priceB;
          });
          break;
  }
  
  productCards.forEach(card => productsContainer.appendChild(card));
  showNotification('Сортування застосовано');
}

function initCartButtons() {
  const addToCartButtons = document.querySelectorAll('.catalog__cart-button');
  
  if (!addToCartButtons.length) return;
  
  addToCartButtons.forEach(button => {
      button.addEventListener('click', function() {
          const productCard = this.closest('.catalog__item');
          const productName = productCard.querySelector('.catalog__item-title').textContent;
          const productPrice = productCard.querySelector('.catalog__price').textContent;
          
          console.log('Добавлено в корзину:', { название: productName, цена: productPrice });
          showNotification(`"${productName}" додано до кошика`);
          animateAddToCart(this);
      });
  });
  
  // Кнопка "Придбати" в слайдере
  const slideButtons = document.querySelectorAll('.slider__button');
  slideButtons.forEach(button => {
      button.addEventListener('click', function() {
          const slideItem = this.closest('.slider__item');
          const productName = slideItem.querySelector('.slider__title').textContent;
          const productPrice = slideItem.querySelector('.slider__new-price').textContent;
          
          console.log('Добавлено в корзину из слайдера:', { название: productName, цена: productPrice });
          showNotification(`"${productName}" додано до кошика`);
      });
  });
}

function animateAddToCart(button) {
  button.classList.add('clicked');
  
  // Добавляем класс для анимации
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

function initPagination() {
  const paginationItems = document.querySelectorAll('.pagination__item a');
  const prevButton = document.querySelector('.pagination__button-back');
  const nextButton = document.querySelector('.pagination__button-next');
  
  if (!paginationItems.length) return;
  
  paginationItems.forEach(item => {
      item.addEventListener('click', function(e) {
          e.preventDefault();
          
          // Удаляем активный класс со всех элементов
          paginationItems.forEach(i => {
              i.classList.remove('padination__link__link-active');
              i.parentElement.classList.remove('pagination__item-active');
          });
          
          // Добавляем активный класс текущему элементу
          this.classList.add('padination__link__link-active');
          this.parentElement.classList.add('pagination__item-active');
          
          const page = this.textContent;
          console.log('Переход на страницу:', page);
          showNotification(`Перехід на сторінку ${page}`);
      });
  });
  
  if (prevButton) {
      prevButton.addEventListener('click', function(e) {
          e.preventDefault();
          const currentActive = document.querySelector('.pagination__item-active');
          if (!currentActive) return;
          
          const prevItem = currentActive.previousElementSibling;
          if (prevItem && prevItem.classList.contains('pagination__item')) {
              currentActive.classList.remove('pagination__item-active');
              prevItem.classList.add('pagination__item-active');
              
              const page = prevItem.querySelector('a').textContent;
              showNotification(`Перехід на сторінку ${page}`);
          }
      });
  }
  
  if (nextButton) {
      nextButton.addEventListener('click', function(e) {
          e.preventDefault();
          const currentActive = document.querySelector('.pagination__item-active');
          if (!currentActive) return;
          
          const nextItem = currentActive.nextElementSibling;
          if (nextItem && nextItem.classList.contains('pagination__item')) {
              currentActive.classList.remove('pagination__item-active');
              nextItem.classList.add('pagination__item-active');
              
              const page = nextItem.querySelector('a').textContent;
              showNotification(`Перехід на сторінку ${page}`);
          }
      });
  }
}

function showNotification(message) {
  if (!document.querySelector('.notification')) {
      const notification = document.createElement('div');
      notification.className = 'notification';
      notification.style.cssText = `
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
      `;
      document.body.appendChild(notification);
  }
  
  const notification = document.querySelector('.notification');
  notification.textContent = message;
  notification.style.transform = 'translateY(0)';
  
  setTimeout(() => {
      notification.style.transform = 'translateY(100px)';
  }, 3000);
}

function simulateFilteredProducts() {
  const productCards = document.querySelectorAll('.catalog__item');
  productCards.forEach((card, index) => {
      if (index % 2 === 0) {
          card.style.opacity = '0.3';
      } else {
          card.style.opacity = '1';
      }
  });
}

function resetProducts() {
  const productCards = document.querySelectorAll('.catalog__item');
  productCards.forEach(card => {
      card.style.opacity = '1';
  });
}

function addStyles() {
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
      
      /* Стили для ползунка цены */
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
  `;
  document.head.appendChild(styleElement);
}

addStyles();
document.addEventListener('DOMContentLoaded', function() {
  initSlider();
  initPriceRangeSlider();
  initFilterButtons();
  initSorting();
  initCartButtons();
  initPagination();
  initCountryFilters(); // Добавляем инициализацию фильтрации по странам
});

function initSlider() {
  const sliderItems = document.querySelectorAll('.slider__item');
  const dots = document.querySelectorAll('.slider__dot');
  const prevButton = document.querySelector('.slider__nav-button.prev');
  const nextButton = document.querySelector('.slider__nav-button.next');
  let currentSlide = 0;

  function showSlide(index) {
      // Скрываем все слайды и удаляем активный класс с точек
      sliderItems.forEach(item => item.classList.remove('active'));
      dots.forEach(dot => dot.classList.remove('active'));
      
      // Показываем текущий слайд и активируем соответствующую точку
      sliderItems[index].classList.add('active');
      dots[index].classList.add('active');
      currentSlide = index;
  }

  // Навигация по стрелкам
  prevButton.addEventListener('click', function() {
      let newIndex = currentSlide - 1;
      if (newIndex < 0) newIndex = sliderItems.length - 1;
      showSlide(newIndex);
  });

  nextButton.addEventListener('click', function() {
      let newIndex = currentSlide + 1;
      if (newIndex >= sliderItems.length) newIndex = 0;
      showSlide(newIndex);
  });

  // Навигация по точкам
  dots.forEach((dot, index) => {
      dot.addEventListener('click', function() {
          showSlide(index);
      });
  });

  // Автоматическая смена слайдов
  let slideInterval = setInterval(function() {
      let newIndex = currentSlide + 1;
      if (newIndex >= sliderItems.length) newIndex = 0;
      showSlide(newIndex);
  }, 5000);

  // Остановка автоматической смены при наведении на слайдер
  const sliderContainer = document.querySelector('.slider');
  sliderContainer.addEventListener('mouseenter', function() {
      clearInterval(slideInterval);
  });

  sliderContainer.addEventListener('mouseleave', function() {
      slideInterval = setInterval(function() {
          let newIndex = currentSlide + 1;
          if (newIndex >= sliderItems.length) newIndex = 0;
          showSlide(newIndex);
      }, 5000);
  });
}

function initPriceRangeSlider() {
  const priceSlider = document.querySelector('.price-slider');
  if (!priceSlider) return;
  
  const handles = priceSlider.querySelectorAll('.handle');
  const bar = priceSlider.querySelector('.bar');
  const inputs = document.querySelectorAll('.price-inputs input');
  
  let isDragging = false;
  let activeHandle = null;
  let sliderWidth = priceSlider.offsetWidth;
  let minValue = 0;
  let maxValue = 900;
  
  // Инициализация позиций ползунков
  updateHandlePositions();
  
  function updatePriceInputs() {
      const leftPosition = parseInt(handles[0].style.left) || 0;
      const rightPosition = parseInt(handles[1].style.left) || 100;
      
      const minPrice = Math.round((leftPosition / sliderWidth) * maxValue);
      const maxPrice = Math.round((rightPosition / sliderWidth) * maxValue);
      
      inputs[0].value = minPrice;
      inputs[1].value = maxPrice;
      bar.style.left = `${leftPosition}px`;
      bar.style.width = `${rightPosition - leftPosition}px`;
  }
  
  function updateHandlePositions() {
      const minPrice = parseInt(inputs[0].value) || 0;
      const maxPrice = parseInt(inputs[1].value) || maxValue;       
      const leftPosition = (minPrice / maxValue) * sliderWidth;
      const rightPosition = (maxPrice / maxValue) * sliderWidth;      
      handles[0].style.left = `${leftPosition}px`;
      handles[1].style.left = `${rightPosition}px`;
      bar.style.left = `${leftPosition}px`;
      bar.style.width = `${rightPosition - leftPosition}px`;
  }
  
  handles.forEach((handle, index) => {
      handle.addEventListener('mousedown', function(e) {
          isDragging = true;
          activeHandle = index;
          document.addEventListener('mousemove', handleDrag);
          document.addEventListener('mouseup', stopDrag);
          e.preventDefault();
      });
  });
  
  function handleDrag(e) {
      if (!isDragging) return;
      const sliderRect = priceSlider.getBoundingClientRect();
      let newPosition = e.clientX - sliderRect.left;
      newPosition = Math.max(0, Math.min(sliderWidth, newPosition));
      
      if (activeHandle === 0) {
          const rightHandlePosition = parseInt(handles[1].style.left) || sliderWidth;
          newPosition = Math.min(newPosition, rightHandlePosition);
      } else {
          const leftHandlePosition = parseInt(handles[0].style.left) || 0;
          newPosition = Math.max(newPosition, leftHandlePosition);
      }
      
      handles[activeHandle].style.left = `${newPosition}px`;
      updatePriceInputs();
  }   
  
  function stopDrag() {
      isDragging = false;
      document.removeEventListener('mousemove', handleDrag);
      document.removeEventListener('mouseup', stopDrag);
  }
  
  window.addEventListener('resize', function() {
      sliderWidth = priceSlider.offsetWidth;
      updateHandlePositions();
  });
  
  inputs.forEach(input => {
      input.addEventListener('change', function() {
          this.value = Math.max(0, Math.min(maxValue, parseInt(this.value) || 0));
          updateHandlePositions();
      });
  });
}

// Добавляем новую функцию для инициализации фильтров по странам
function initCountryFilters() {
  // Добавляем дата-атрибуты для товаров, указывающие страну происхождения кофе
  assignCountryData();
  
  // Добавляем обработчики для чекбоксов стран
  const countryCheckboxes = document.querySelectorAll('.country-options input[type="checkbox"]');
  countryCheckboxes.forEach(checkbox => {
      checkbox.addEventListener('change', function() {
          highlightProductsByCountry();
      });
  });
}

// Функция для назначения дата-атрибутов продуктам на основе их описания
function assignCountryData() {
  const products = document.querySelectorAll('.catalog__item');
  
  products.forEach(product => {
      const description = product.querySelector('.catalog__item-desc').textContent.toLowerCase();
      
      // Определяем страну на основе текста описания
      if (description.includes('ефіопії')) {
          product.setAttribute('data-country', 'ethiopia');
      } else if (description.includes('бразилії')) {
          product.setAttribute('data-country', 'brazil');
      } else if (description.includes('колумбії')) {
          product.setAttribute('data-country', 'colombia');
      } else if (description.includes('коста-ріки') || description.includes('коста-рики')) {
          product.setAttribute('data-country', 'costa-rica');
      } else if (description.includes('перу')) {
          product.setAttribute('data-country', 'peru');
      } else {
          product.setAttribute('data-country', 'unknown');
      }
  });
}

// Функция для выделения продуктов по выбранным странам
function highlightProductsByCountry() {
  const products = document.querySelectorAll('.catalog__item');
  const selectedCountries = [];
  
  // Получаем список выбранных стран
  document.querySelectorAll('.country-options input[type="checkbox"]:checked').forEach(checkbox => {
      const countryText = checkbox.nextElementSibling.nextElementSibling.textContent.trim().toLowerCase();
      
      // Преобразуем названия стран в соответствующие значения data-country
      if (countryText === 'бразилія') {
          selectedCountries.push('brazil');
      } else if (countryText === 'ефіопія') {
          selectedCountries.push('ethiopia');
      } else if (countryText === 'колумбія') {
          selectedCountries.push('colombia');
      } else if (countryText === 'коста-ріка') {
          selectedCountries.push('costa-rica');
      } else if (countryText === 'перу') {
          selectedCountries.push('peru');
      }
  });
  
  // Если ничего не выбрано, показываем все товары
  if (selectedCountries.length === 0) {
      products.forEach(product => {
          product.style.opacity = '1';
          product.classList.remove('country-highlighted');
      });
      return;
  }
  
  // Выделяем товары из выбранных стран
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
  
  showNotification(`Виділено продукти з обраних країн: ${selectedCountries.length} країн`);
}

function initFilterButtons() {
  const applyButton = document.querySelector('.filter__button');
  const resetButton = document.querySelector('.filter__button-reset');
  
  if (!applyButton || !resetButton) return;
  
  applyButton.addEventListener('click', function(e) {
      e.preventDefault();
      const priceInputs = document.querySelectorAll('.price-inputs input');
      const minPrice = priceInputs[0].value;
      const maxPrice = priceInputs[1].value;
      
      const milkOption = document.querySelector('input[name="milk"]:checked').id;
      
      const selectedCountries = [];
      document.querySelectorAll('.country-options input[type="checkbox"]:checked').forEach(checkbox => {
          selectedCountries.push(checkbox.nextElementSibling.nextElementSibling.textContent);
      });
      
      console.log('Применяем фильтры:', {
          ценовойДиапазон: { минимум: minPrice, максимум: maxPrice },
          молоко: milkOption,
          страны: selectedCountries
      });
      
      showNotification('Фільтри застосовані');
      filterProducts(minPrice, maxPrice, milkOption, selectedCountries);
  });
  
  resetButton.addEventListener('click', function(e) {
      e.preventDefault();
      const priceInputs = document.querySelectorAll('.price-inputs input');
      priceInputs[0].value = 0;
      priceInputs[1].value = 900;
      
      document.getElementById('any-milk').checked = true;
      
      document.querySelectorAll('.country-options input[type="checkbox"]').forEach((checkbox, index) => {
          checkbox.checked = index === 0; // Только первый (Бразилия) отмечен
      });
      
      initPriceRangeSlider();
      showNotification('Фільтри скинуто');
      resetProducts();
  });
}

// Обновляем функцию фильтрации продуктов
function filterProducts(minPrice, maxPrice, milkOption, selectedCountries) {
  const products = document.querySelectorAll('.catalog__item');
  
  products.forEach(product => {
      // Сначала убираем все выделения
      product.style.opacity = '1';
      product.classList.remove('country-highlighted', 'milk-highlighted', 'price-highlighted');
      
      // Получаем цену продукта
      const price = parseInt(product.querySelector('.catalog__price').textContent.replace(/\D/g, ''));
      const description = product.querySelector('.catalog__item-desc').textContent.toLowerCase();
      const productCountry = product.getAttribute('data-country');
      
      // Проверяем соответствие цены
      const priceMatch = price >= minPrice && price <= maxPrice;
      
      // Проверяем соответствие типа молока
      let milkMatch = true;
      if (milkOption === 'animal-milk') {
          milkMatch = description.includes('тваринним молоком');
      } else if (milkOption === 'plant-milk') {
          milkMatch = description.includes('рослинним молоком');
      } else if (milkOption === 'no-milk') {
          milkMatch = !description.includes('молок');
      }
      
      // Проверяем соответствие страны
      let countryMatch = selectedCountries.length === 0; // Если ничего не выбрано, считаем, что совпадает
      
      for (const country of selectedCountries) {
          const lowercaseCountry = country.toLowerCase();
          if ((lowercaseCountry === 'бразилія' && productCountry === 'brazil') ||
              (lowercaseCountry === 'ефіопія' && productCountry === 'ethiopia') ||
              (lowercaseCountry === 'колумбія' && productCountry === 'colombia') ||
              (lowercaseCountry === 'коста-ріка' && productCountry === 'costa-rica') ||
              (lowercaseCountry === 'перу' && productCountry === 'peru')) {
              countryMatch = true;
              break;
          }
      }
      
      // Применяем результаты фильтрации
      if (priceMatch && milkMatch && countryMatch) {
          product.style.opacity = '1';
          
          // Добавляем классы для разных типов выделения
          if (priceMatch) product.classList.add('price-highlighted');
          if (milkMatch) product.classList.add('milk-highlighted');
          if (countryMatch) product.classList.add('country-highlighted');
      } else {
          product.style.opacity = '0.4';
      }
  });
}

function initSorting() {
  const sortingSelect = document.getElementById('sorting');
  
  if (!sortingSelect) return;
  
  sortingSelect.addEventListener('change', function() {
      const selectedOption = this.value;
      console.log('Сортируем по:', selectedOption);
      simulateSorting(selectedOption);
  });
}

function simulateSorting(sortOption) {
  const productCards = Array.from(document.querySelectorAll('.catalog__item'));
  const productsContainer = document.querySelector('.catalog__list');
  
  if (!productsContainer || productCards.length === 0) return;
  
  productCards.forEach(card => card.remove());
  
  switch(sortOption) {
      case 'expensive':
          productCards.sort((a, b) => {
              const priceA = parseInt(a.querySelector('.catalog__price').textContent.replace(/\D/g, ''));
              const priceB = parseInt(b.querySelector('.catalog__price').textContent.replace(/\D/g, ''));
              return priceB - priceA;
          });
          break;
      case 'cheap':
          productCards.sort((a, b) => {
              const priceA = parseInt(a.querySelector('.catalog__price').textContent.replace(/\D/g, ''));
              const priceB = parseInt(b.querySelector('.catalog__price').textContent.replace(/\D/g, ''));
              return priceA - priceB;
          });
          break;
  }
  
  productCards.forEach(card => productsContainer.appendChild(card));
  showNotification('Сортування застосовано');
}

function initCartButtons() {
  const addToCartButtons = document.querySelectorAll('.catalog__cart-button');
  
  if (!addToCartButtons.length) return;
  
  addToCartButtons.forEach(button => {
      button.addEventListener('click', function() {
          const productCard = this.closest('.catalog__item');
          const productName = productCard.querySelector('.catalog__item-title').textContent;
          const productPrice = productCard.querySelector('.catalog__price').textContent;
          
          console.log('Добавлено в корзину:', { название: productName, цена: productPrice });
          showNotification(`"${productName}" додано до кошика`);
          animateAddToCart(this);
      });
  });
  
  // Кнопка "Придбати" в слайдере
  const slideButtons = document.querySelectorAll('.slider__button');
  slideButtons.forEach(button => {
      button.addEventListener('click', function() {
          const slideItem = this.closest('.slider__item');
          const productName = slideItem.querySelector('.slider__title').textContent;
          const productPrice = slideItem.querySelector('.slider__new-price').textContent;
          
          console.log('Добавлено в корзину из слайдера:', { название: productName, цена: productPrice });
          showNotification(`"${productName}" додано до кошика`);
      });
  });
}

function animateAddToCart(button) {
  button.classList.add('clicked');
  
  // Добавляем класс для анимации
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

function initPagination() {
  const paginationItems = document.querySelectorAll('.pagination__item a');
  const prevButton = document.querySelector('.pagination__button-back');
  const nextButton = document.querySelector('.pagination__button-next');
  
  if (!paginationItems.length) return;
  
  paginationItems.forEach(item => {
      item.addEventListener('click', function(e) {
          e.preventDefault();
          
          // Удаляем активный класс со всех элементов
          paginationItems.forEach(i => {
              i.classList.remove('padination__link__link-active');
              i.parentElement.classList.remove('pagination__item-active');
          });
          
          // Добавляем активный класс текущему элементу
          this.classList.add('padination__link__link-active');
          this.parentElement.classList.add('pagination__item-active');
          
          const page = this.textContent;
          console.log('Переход на страницу:', page);
          showNotification(`Перехід на сторінку ${page}`);
      });
  });
  
  if (prevButton) {
      prevButton.addEventListener('click', function(e) {
          e.preventDefault();
          const currentActive = document.querySelector('.pagination__item-active');
          if (!currentActive) return;
          
          const prevItem = currentActive.previousElementSibling;
          if (prevItem && prevItem.classList.contains('pagination__item')) {
              currentActive.classList.remove('pagination__item-active');
              prevItem.classList.add('pagination__item-active');
              
              const page = prevItem.querySelector('a').textContent;
              showNotification(`Перехід на сторінку ${page}`);
          }
      });
  }
  
  if (nextButton) {
      nextButton.addEventListener('click', function(e) {
          e.preventDefault();
          const currentActive = document.querySelector('.pagination__item-active');
          if (!currentActive) return;
          
          const nextItem = currentActive.nextElementSibling;
          if (nextItem && nextItem.classList.contains('pagination__item')) {
              currentActive.classList.remove('pagination__item-active');
              nextItem.classList.add('pagination__item-active');
              
              const page = nextItem.querySelector('a').textContent;
              showNotification(`Перехід на сторінку ${page}`);
          }
      });
  }
}

function showNotification(message) {
  if (!document.querySelector('.notification')) {
      const notification = document.createElement('div');
      notification.className = 'notification';
      notification.style.cssText = `
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
      `;
      document.body.appendChild(notification);
  }
  
  const notification = document.querySelector('.notification');
  notification.textContent = message;
  notification.style.transform = 'translateY(0)';
  
  setTimeout(() => {
      notification.style.transform = 'translateY(100px)';
  }, 3000);
}

function simulateFilteredProducts() {
  const productCards = document.querySelectorAll('.catalog__item');
  productCards.forEach((card, index) => {
      if (index % 2 === 0) {
          card.style.opacity = '0.3';
      } else {
          card.style.opacity = '1';
      }
  });
}

function resetProducts() {
  const productCards = document.querySelectorAll('.catalog__item');
  productCards.forEach(card => {
      card.style.opacity = '1';
      card.classList.remove('country-highlighted', 'milk-highlighted', 'price-highlighted');
  });
}

function addStyles() {
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
      
      /* Стили для ползунка цены */
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
      
      /* Стили для выделения продуктов по странам */
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
  `;
  document.head.appendChild(styleElement);
}

addStyles();
// Функція для роботи з кошиком
function initializeShoppingCart() {
    // Отримуємо всі кнопки "В кошик"
    const addToCartButtons = document.querySelectorAll('.catalog__cart-button');
    // Отримуємо елемент кошика в шапці для оновлення лічильника
    const cartIconContainer = document.querySelector('.user__list-item:last-child .user__list-link');
    
    // Перевіряємо наявність кошика в локальному сховищі, якщо немає - створюємо пустий масив
    function getCart() {
      const cartItems = localStorage.getItem('drink2goCart');
      return cartItems ? JSON.parse(cartItems) : [];
    }
    
    // Оновлення кількості товарів в кошику в іконці кошика
    function updateCartCounter() {
      const cart = getCart();
      const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
      
      // Перевіряємо, чи існує лічильник
      let cartCounter = cartIconContainer.querySelector('.cart-counter');
      
      // Якщо лічильника немає і є товари, створюємо його
      if (!cartCounter && totalItems > 0) {
        cartCounter = document.createElement('span');
        cartCounter.className = 'cart-counter';
        cartIconContainer.appendChild(cartCounter);
      }
      
      // Оновлюємо або ховаємо лічильник
      if (cartCounter) {
        if (totalItems > 0) {
          cartCounter.textContent = totalItems;
          cartCounter.style.display = 'block';
        } else {
          cartCounter.style.display = 'none';
        }
      }
    }
    
    // Додавання товару в кошик
    function addToCart(productTitle, productPrice, productImage) {
      const cart = getCart();
      
      // Перевіряємо чи є товар в кошику
      const existingProductIndex = cart.findIndex(item => item.title === productTitle);
      
      if (existingProductIndex !== -1) {
        // Якщо товар вже є в кошику, збільшуємо кількість
        cart[existingProductIndex].quantity += 1;
      } else {
        // Якщо товару немає, додаємо новий
        cart.push({
          title: productTitle,
          price: productPrice,
          image: productImage,
          quantity: 1
        });
      }
      
      // Зберігаємо оновлений кошик
      localStorage.setItem('drink2goCart', JSON.stringify(cart));
      
      // Оновлюємо лічильник на іконці кошика
      updateCartCounter();
      
      // Показуємо сповіщення про додавання товару
      showAddToCartNotification(productTitle);
    }
    
    // Функція відображення сповіщення про додавання товару
    function showAddToCartNotification(productTitle) {
      // Створюємо елемент сповіщення
      const notification = document.createElement('div');
      notification.className = 'cart-notification';
      notification.textContent = `"${productTitle}" додано до кошика`;
      
      // Додаємо стилі для сповіщення
      notification.style.position = 'fixed';
      notification.style.bottom = '20px';
      notification.style.right = '20px';
      notification.style.backgroundColor = '#7859cf';
      notification.style.color = 'white';
      notification.style.padding = '10px 20px';
      notification.style.borderRadius = '5px';
      notification.style.zIndex = '1000';
      notification.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
      
      // Додаємо сповіщення до сторінки
      document.body.appendChild(notification);
      
      // Видаляємо сповіщення через 3 секунди
      setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transition = 'opacity 0.5s';
        setTimeout(() => {
          document.body.removeChild(notification);
        }, 500);
      }, 3000);
    }
    
    // Додаємо слухачі подій для кнопок "В кошик"
    addToCartButtons.forEach(button => {
      button.addEventListener('click', function() {
        // Отримуємо дані про товар
        const productItem = this.closest('.catalog__item');
        const productTitle = productItem.querySelector('.catalog__item-title').textContent;
        const productPrice = productItem.querySelector('.catalog__price').textContent;
        const productImage = productItem.querySelector('.catalog__img').getAttribute('src');
        
        // Додаємо товар в кошик
        addToCart(productTitle, productPrice, productImage);
      });
    });
    
    // Додаємо обробник подій для кнопки кошика в шапці
    cartIconContainer.addEventListener('click', function(e) {
      // Тут можна додати код для відображення спливаючого вікна кошика
      // або переходу на сторінку кошика
      console.log('Відкрито кошик', getCart());
    });
    
    // Додаємо стилі для лічильника кошика
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
    `;
    document.head.appendChild(style);
    
    // Оновлюємо лічильник при завантаженні сторінки
    updateCartCounter();
  }
  
  // Викликаємо ініціалізацію кошика після завантаження DOM
  document.addEventListener('DOMContentLoaded', initializeShoppingCart);
  
  // Додаємо слухач події для кнопки "Придбати" в слайдері
  document.addEventListener('DOMContentLoaded', function() {
    const sliderButtons = document.querySelectorAll('.slider__button');
    
    sliderButtons.forEach(button => {
      button.addEventListener('click', function() {
        // Отримуємо дані про товар з активного слайду
        const activeSlide = document.querySelector('.slider__item.active');
        const productTitle = activeSlide.querySelector('.slider__title').textContent;
        const productPrice = activeSlide.querySelector('.slider__new-price').textContent;
        const productImage = activeSlide.querySelector('.slider__image img').getAttribute('src');
        
        // Отримуємо поточний кошик
        const cart = JSON.parse(localStorage.getItem('drink2goCart')) || [];
        
        // Перевіряємо, чи є товар у кошику
        const existingProductIndex = cart.findIndex(item => item.title === productTitle);
        
        if (existingProductIndex !== -1) {
          // Якщо товар вже є в кошику, збільшуємо кількість
          cart[existingProductIndex].quantity += 1;
        } else {
          // Якщо товару немає, додаємо новий
          cart.push({
            title: productTitle,
            price: productPrice,
            image: productImage,
            quantity: 1
          });
        }
        
        // Зберігаємо оновлений кошик
        localStorage.setItem('drink2goCart', JSON.stringify(cart));
        
        // Оновлюємо лічильник
        const cartIconContainer = document.querySelector('.user__list-item:last-child .user__list-link');
        let cartCounter = cartIconContainer.querySelector('.cart-counter');
        const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
        
        if (!cartCounter) {
          cartCounter = document.createElement('span');
          cartCounter.className = 'cart-counter';
          cartIconContainer.appendChild(cartCounter);
        }
        
        cartCounter.textContent = totalItems;
        cartCounter.style.display = totalItems > 0 ? 'block' : 'none';
        
        // Показуємо сповіщення
        const notification = document.createElement('div');
        notification.className = 'cart-notification';
        notification.textContent = `"${productTitle}" додано до кошика`;
        
        notification.style.position = 'fixed';
        notification.style.bottom = '20px';
        notification.style.right = '20px';
        notification.style.backgroundColor = '#7859cf';
        notification.style.color = 'white';
        notification.style.padding = '10px 20px';
        notification.style.borderRadius = '5px';
        notification.style.zIndex = '1000';
        notification.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
          notification.style.opacity = '0';
          notification.style.transition = 'opacity 0.5s';
          setTimeout(() => {
            document.body.removeChild(notification);
          }, 500);
        }, 3000);
      });
    });
  });
  // MODAL FUNCTIONALITY
document.addEventListener('DOMContentLoaded', function() {
    // Modal elements
    const loginButton = document.querySelector('.user__list-item:first-child .user__list-link');
    const cartButton = document.querySelector('.user__list-item:last-child .user__list-link');
    const body = document.body;
    
    // Create modal containers if they don't exist
    if (!document.getElementById('loginModal')) {
      createLoginModal();
    }
    
    if (!document.getElementById('cartModal')) {
      createCartModal();
    }
    
    // Get modals
    const loginModal = document.getElementById('loginModal');
    const cartModal = document.getElementById('cartModal');
    const closeButtons = document.querySelectorAll('.modal-close');
    
    // Event listeners for opening modals
    loginButton.addEventListener('click', function(e) {
      e.preventDefault();
      openModal(loginModal);
    });
    
    cartButton.addEventListener('click', function(e) {
      e.preventDefault();
      openModal(cartModal);
    });
    
    // Event listeners for closing modals
    closeButtons.forEach(button => {
      button.addEventListener('click', function() {
        closeModal(this.closest('.modal'));
      });
    });
    
    // Close modal when clicking outside
    window.addEventListener('click', function(e) {
      if (e.target.classList.contains('modal')) {
        closeModal(e.target);
      }
    });
    
    // Email validation for login form
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
    
    // Function to open modal
    function openModal(modal) {
      modal.style.display = 'flex';
      body.classList.add('modal-open');
    }
    
    // Function to close modal
    function closeModal(modal) {
      modal.style.display = 'none';
      body.classList.remove('modal-open');
    }
    
    // Create login modal
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
    
    // Create cart modal
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
    
    // Add to cart functionality
    const addToCartButtons = document.querySelectorAll('.catalog__cart-button');
    
    addToCartButtons.forEach(button => {
      button.addEventListener('click', function() {
        const productItem = this.closest('.catalog__item');
        const productName = productItem.querySelector('.catalog__item-title').textContent;
        const productPrice = productItem.querySelector('.catalog__price').textContent;
        const productImage = productItem.querySelector('.catalog__img').src;
        
        addToCart(productName, productPrice, productImage);
        
        // Show notification
        showNotification(`${productName} додано до кошика!`);
        
        // Update cart count
        updateCartCount();
      });
    });
    
    function addToCart(name, price, image) {
      // Check if cart is empty
      const cartEmpty = document.querySelector('.cart-empty');
      if (cartEmpty) {
        cartEmpty.remove();
      }
      
      // Create new cart item
      const cartItems = document.querySelector('.cart-items');
      const cartItemHTML = `
        <div class="cart-item">
          <img src="${image}" alt="${name}" class="cart-item-image">
          <div class="cart-item-details">
            <div class="cart-item-name">${name}</div>
            <div class="cart-item-price">${price}</div>
          </div>
          <button class="remove-item-button">×</button>
        </div>
      `;
      
      cartItems.insertAdjacentHTML('beforeend', cartItemHTML);
      
      // Add event listener to remove button
      const removeButtons = document.querySelectorAll('.remove-item-button');
      removeButtons.forEach(button => {
        button.addEventListener('click', function() {
          this.closest('.cart-item').remove();
          
          // Check if cart is empty
          if (document.querySelectorAll('.cart-item').length === 0) {
            document.querySelector('.cart-items').innerHTML = '<div class="cart-empty">Ваш кошик порожній</div>';
          }
          
          // Update cart count and total
          updateCartCount();
          updateCartTotal();
        });
      });
      updateCartTotal();
    }
    
    function updateCartTotal() {
      const cartItems = document.querySelectorAll('.cart-item');
      let total = 0;
      
      cartItems.forEach(item => {
        const priceText = item.querySelector('.cart-item-price').textContent;
        const price = parseInt(priceText.replace(/\D/g, ''));
        total += price;
      });
      
      document.querySelector('.total-amount').textContent = `${total} грн`;
    }
    
    function updateCartCount() {
      const cartItems = document.querySelectorAll('.cart-item').length;
      const cartCountElement = document.querySelector('.cart-count');
      
      if (cartCountElement) {
        cartCountElement.textContent = cartItems;
      } else if (cartItems > 0) {
        const cartLink = document.querySelector('.user__list-item:last-child .user__list-link');
        const cartCount = document.createElement('span');
        cartCount.className = 'cart-count';
        cartCount.textContent = cartItems;
        cartLink.appendChild(cartCount);
      }
    }
    function showNotification(message) {
      if (!document.getElementById('notification')) {
        const notificationHTML = `
          <div id="notification" class="notification"></div>
        `;
        document.body.insertAdjacentHTML('beforeend', notificationHTML);
      }
      
      const notification = document.getElementById('notification');
      notification.textContent = message;
      notification.classList.add('show');
      setTimeout(() => {
        notification.classList.remove('show');
      }, 3000);
    }
    if (document.querySelector('.slider')) {
      initializeSlider();
    }
    function initializeSlider() {
      const slides = document.querySelectorAll('.slider__item');
      const dots = document.querySelectorAll('.slider__dot');
      const prevButton = document.querySelector('.slider__nav-button.prev');
      const nextButton = document.querySelector('.slider__nav-button.next');
      let currentSlide = 0;
      showSlide(currentSlide);
      nextButton.addEventListener('click', () => {
        currentSlide = (currentSlide + 1) % slides.length;
        showSlide(currentSlide);
      });
      prevButton.addEventListener('click', () => {
        currentSlide = (currentSlide - 1 + slides.length) % slides.length;
        showSlide(currentSlide);
      });
      dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
          currentSlide = index;
          showSlide(currentSlide);
        });
      });
      
      function showSlide(index) {
        slides.forEach((slide, i) => {
          slide.classList.remove('active');
          dots[i].classList.remove('active');
        });
        
        slides[index].classList.add('active');
        dots[index].classList.add('active');
      }
      setInterval(() => {
        currentSlide = (currentSlide + 1) % slides.length;
        showSlide(currentSlide);
      }, 5000);
    }
  });
  // Функція для роботи з кошиком
function initializeShoppingCart() {
    // Отримуємо всі кнопки "В кошик"
    const addToCartButtons = document.querySelectorAll('.catalog__cart-button');
    // Отримуємо елемент кошика в шапці для оновлення лічильника
    const cartIconContainer = document.querySelector('.user__list-item:last-child .user__list-link');
    
    // Перевіряємо наявність кошика в локальному сховищі, якщо немає - створюємо пустий масив
    function getCart() {
      const cartItems = localStorage.getItem('drink2goCart');
      return cartItems ? JSON.parse(cartItems) : [];
    }
    
    // Оновлення кількості товарів в кошику в іконці кошика
    function updateCartCounter() {
      const cart = getCart();
      const totalItems = cart.reduce((total, item) => total + item.quantity, 0); // Рахуємо загальну кількість товарів
      
      // Перевіряємо, чи існує лічильник
      let cartCounter = cartIconContainer.querySelector('.cart-counter');
      
      // Якщо лічильника немає і є товари, створюємо його
      if (!cartCounter && totalItems > 0) {
        cartCounter = document.createElement('span');
        cartCounter.className = 'cart-counter';
        cartIconContainer.appendChild(cartCounter);
      }
      
      // Оновлюємо або ховаємо лічильник
      if (cartCounter) {
        if (totalItems > 0) {
          cartCounter.textContent = totalItems;
          cartCounter.style.display = 'block';
        } else {
          cartCounter.style.display = 'none';
        }
      }
    }
    
    // Додавання товару в кошик
    function addToCart(productTitle, productPrice, productImage) {
      const cart = getCart();
      
      // Перевіряємо чи є товар в кошику
      const existingProductIndex = cart.findIndex(item => item.title === productTitle);
      
      if (existingProductIndex !== -1) {
        // Якщо товар вже є в кошику, збільшуємо кількість
        cart[existingProductIndex].quantity += 1;
        showAddToCartNotification(`Кількість "${productTitle}" збільшено до ${cart[existingProductIndex].quantity}`);
      } else {
        // Якщо товару немає, додаємо новий
        cart.push({
          title: productTitle,
          price: productPrice,
          image: productImage,
          quantity: 1
        });
        showAddToCartNotification(`"${productTitle}" додано до кошика`);
      }
      
      // Зберігаємо оновлений кошик
      localStorage.setItem('drink2goCart', JSON.stringify(cart));
      
      // Оновлюємо лічильник на іконці кошика
      updateCartCounter();
      
      // Оновлюємо вміст модального вікна кошика
      updateCartModal();
    }
    
    // Функція відображення сповіщення про додавання товару
    function showAddToCartNotification(message) {
      // Створюємо елемент сповіщення
      const notification = document.createElement('div');
      notification.className = 'cart-notification';
      notification.textContent = message;
      
      // Додаємо стилі для сповіщення
      notification.style.position = 'fixed';
      notification.style.bottom = '20px';
      notification.style.right = '20px';
      notification.style.backgroundColor = '#7859cf';
      notification.style.color = 'white';
      notification.style.padding = '10px 20px';
      notification.style.borderRadius = '5px';
      notification.style.zIndex = '1000';
      notification.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
      
      // Додаємо сповіщення до сторінки
      document.body.appendChild(notification);
      
      // Видаляємо сповіщення через 3 секунди
      setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transition = 'opacity 0.5s';
        setTimeout(() => {
          document.body.removeChild(notification);
        }, 500);
      }, 3000);
    }
    
    // Додаємо слухачі подій для кнопок "В кошик"
    addToCartButtons.forEach(button => {
      button.addEventListener('click', function() {
        // Отримуємо дані про товар
        const productItem = this.closest('.catalog__item');
        const productTitle = productItem.querySelector('.catalog__item-title').textContent;
        const productPrice = productItem.querySelector('.catalog__price').textContent;
        const productImage = productItem.querySelector('.catalog__img').getAttribute('src');
        
        // Додаємо товар в кошик
        addToCart(productTitle, productPrice, productImage);
      });
    });
    
    // Додаємо обробник подій для кнопки кошика в шапці
    cartIconContainer.addEventListener('click', function(e) {
      e.preventDefault();
      
      // Оновлюємо вміст модального вікна кошика перед відкриттям
      updateCartModal();
      
      // Відкриваємо модальне вікно кошика
      const cartModal = document.getElementById('cartModal');
      if (cartModal) {
        openModal(cartModal);
      }
    });
    
    // Додаємо стилі для лічильника кошика
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
    `;
    document.head.appendChild(style);
    
    // Оновлюємо лічильник при завантаженні сторінки
    updateCartCounter();
  }
  
  // Функція для оновлення модального вікна кошика
  function updateCartModal() {
    const cartModal = document.getElementById('cartModal');
    if (!cartModal) return;
    
    const cartItemsContainer = cartModal.querySelector('.cart-items');
    const totalAmountElement = cartModal.querySelector('.total-amount');
    
    // Отримуємо дані з localStorage
    const cart = JSON.parse(localStorage.getItem('drink2goCart')) || [];
    
    // Очищаємо контейнер кошика
    cartItemsContainer.innerHTML = '';
    
    // Якщо кошик порожній, показуємо відповідне повідомлення
    if (cart.length === 0) {
      cartItemsContainer.innerHTML = '<div class="cart-empty">Ваш кошик порожній</div>';
      totalAmountElement.textContent = '0 грн';
      return;
    }
    
    // Загальна сума
    let totalAmount = 0;
    
    // Додаємо кожен товар з кошика
    cart.forEach((item, index) => {
      // Обробляємо ціну (видаляємо не-цифрові символи)
      const price = parseInt(item.price.replace(/\D/g, ''));
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
    
    // Оновлюємо загальну суму
    totalAmountElement.textContent = `${totalAmount} грн`;
    
    // Додаємо обробники подій для кнопок видалення та зміни кількості товару
    const removeButtons = cartModal.querySelectorAll('.remove-item-button');
    const increaseButtons = cartModal.querySelectorAll('.increase-btn');
    const decreaseButtons = cartModal.querySelectorAll('.decrease-btn');
    
    removeButtons.forEach(button => {
      button.addEventListener('click', function() {
        const cartItem = this.closest('.cart-item');
        const index = parseInt(cartItem.dataset.index);
        
        // Видаляємо товар з масиву та з DOM
        cart.splice(index, 1);
        cartItem.remove();
        
        // Перепризначаємо індекси для решти товарів
        cartModal.querySelectorAll('.cart-item').forEach((item, i) => {
          item.dataset.index = i;
        });
        
        // Якщо кошик порожній, показуємо відповідне повідомлення
        if (cart.length === 0) {
          cartItemsContainer.innerHTML = '<div class="cart-empty">Ваш кошик порожній</div>';
        }
        
        // Зберігаємо оновлений кошик
        localStorage.setItem('drink2goCart', JSON.stringify(cart));
        
        // Оновлюємо загальну суму та лічильник
        updateCartTotal();
        updateCartCounter();
      });
    });
    
    increaseButtons.forEach(button => {
      button.addEventListener('click', function() {
        const cartItem = this.closest('.cart-item');
        const index = parseInt(cartItem.dataset.index);
        const quantityElement = cartItem.querySelector('.quantity-value');
        
        // Збільшуємо кількість
        cart[index].quantity += 1;
        quantityElement.textContent = cart[index].quantity;
        
        // Оновлюємо ціну товару
        const price = parseInt(cart[index].price.replace(/\D/g, ''));
        const itemTotal = price * cart[index].quantity;
        cartItem.querySelector('.cart-item-price').textContent = `${price} грн × ${cart[index].quantity} = ${itemTotal} грн`;
        
        // Зберігаємо оновлений кошик
        localStorage.setItem('drink2goCart', JSON.stringify(cart));
        
        // Оновлюємо загальну суму та лічильник
        updateCartTotal();
        updateCartCounter();
      });
    });
    
    decreaseButtons.forEach(button => {
      button.addEventListener('click', function() {
        const cartItem = this.closest('.cart-item');
        const index = parseInt(cartItem.dataset.index);
        const quantityElement = cartItem.querySelector('.quantity-value');
        
        // Зменшуємо кількість, але не менше 1
        if (cart[index].quantity > 1) {
          cart[index].quantity -= 1;
          quantityElement.textContent = cart[index].quantity;
          
          // Оновлюємо ціну товару
          const price = parseInt(cart[index].price.replace(/\D/g, ''));
          const itemTotal = price * cart[index].quantity;
          cartItem.querySelector('.cart-item-price').textContent = `${price} грн × ${cart[index].quantity} = ${itemTotal} грн`;
          
          // Зберігаємо оновлений кошик
          localStorage.setItem('drink2goCart', JSON.stringify(cart));
          
          // Оновлюємо загальну суму та лічильник
          updateCartTotal();
          updateCartCounter();
        }
      });
    });
    
    // Функція для оновлення загальної суми
    function updateCartTotal() {
      let total = 0;
      
      cart.forEach(item => {
        const price = parseInt(item.price.replace(/\D/g, ''));
        total += price * item.quantity;
      });
      
      totalAmountElement.textContent = `${total} грн`;
    }
    
    // Функція для оновлення лічильника кошика
    function updateCartCounter() {
      const cartIconContainer = document.querySelector('.user__list-item:last-child .user__list-link');
      const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
      
      // Перевіряємо, чи існує лічильник
      let cartCounter = cartIconContainer.querySelector('.cart-counter');
      
      // Якщо лічильника немає і є товари, створюємо його
      if (!cartCounter && totalItems > 0) {
        cartCounter = document.createElement('span');
        cartCounter.className = 'cart-counter';
        cartIconContainer.appendChild(cartCounter);
      }
      
      // Оновлюємо або ховаємо лічильник
      if (cartCounter) {
        if (totalItems > 0) {
          cartCounter.textContent = totalItems;
          cartCounter.style.display = 'block';
        } else {
          cartCounter.style.display = 'none';
        }
      }
    }
  }
  
  // Викликаємо ініціалізацію кошика після завантаження DOM
  document.addEventListener('DOMContentLoaded', initializeShoppingCart);
  
  // Додаємо слухач події для кнопки "Придбати" в слайдері
  document.addEventListener('DOMContentLoaded', function() {
    const sliderButtons = document.querySelectorAll('.slider__button');
    
    sliderButtons.forEach(button => {
      button.addEventListener('click', function() {
        // Отримуємо дані про товар з активного слайду
        const activeSlide = document.querySelector('.slider__item.active');
        if (!activeSlide) return;
        
        const productTitle = activeSlide.querySelector('.slider__title').textContent;
        const productPrice = activeSlide.querySelector('.slider__new-price').textContent;
        const productImage = activeSlide.querySelector('.slider__image img').getAttribute('src');
        
        // Отримуємо поточний кошик
        const cart = JSON.parse(localStorage.getItem('drink2goCart')) || [];
        
        // Перевіряємо, чи є товар у кошику
        const existingProductIndex = cart.findIndex(item => item.title === productTitle);
        
        if (existingProductIndex === 1) {
          // Якщо товар вже є в кошику, збільшуємо кількість
          cart[existingProductIndex].quantity += 1;
          showAddToCartNotification(`Кількість "${productTitle}" збільшено до ${cart[existingProductIndex].quantity}`);
        } else {
          // Якщо товару немає, додаємо новий
          cart.push({
            title: productTitle,
            price: productPrice,
            image: productImage,
            quantity: 1
          });
          showAddToCartNotification(`"${productTitle}" додано до кошика`);
        }
        
        // Зберігаємо оновлений кошик
        localStorage.setItem('drink2goCart', JSON.stringify(cart));
        
        // Оновлюємо лічильник та модальне вікно кошика
        updateCartCounter();
        updateCartModal();
      });
    });
    
    // Функція оновлення лічильника
    function updateCartCounter() {
      const cart = JSON.parse(localStorage.getItem('drink2goCart')) || [];
      const cartIconContainer = document.querySelector('.user__list-item:last-child .user__list-link');
      const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
      
      // Перевіряємо, чи існує лічильник
      let cartCounter = cartIconContainer.querySelector('.cart-counter');
      
      // Якщо лічильника немає і є товари, створюємо його
      if (!cartCounter && totalItems > 0) {
        cartCounter = document.createElement('span');
        cartCounter.className = 'cart-counter';
        cartIconContainer.appendChild(cartCounter);
      }
      
      // Оновлюємо або ховаємо лічильник
      if (cartCounter) {
        if (totalItems > 0) {
          cartCounter.textContent = totalItems;
          cartCounter.style.display = 'block';
        } else {
          cartCounter.style.display = 'none';
        }
      }
    }
    
    // Функція відображення сповіщення про додавання товару
    function showAddToCartNotification(message) {
      // Створюємо елемент сповіщення
      const notification = document.createElement('div');
      notification.className = 'cart-notification';
      notification.textContent = message;
      
      // Додаємо стилі для сповіщення
      notification.style.position = 'fixed';
      notification.style.bottom = '20px';
      notification.style.right = '20px';
      notification.style.backgroundColor = '#7859cf';
      notification.style.color = 'white';
      notification.style.padding = '10px 20px';
      notification.style.borderRadius = '5px';
      notification.style.zIndex = '1000';
      notification.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
      
      // Додаємо сповіщення до сторінки
      document.body.appendChild(notification);
      
      // Видаляємо сповіщення через 3 секунди
      setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transition = 'opacity 0.5s';
        setTimeout(() => {
          document.body.removeChild(notification);
        }, 500);
      }, 3000);
    }
  });
  
  // MODAL FUNCTIONALITY
  document.addEventListener('DOMContentLoaded', function() {
    // Modal elements
    const loginButton = document.querySelector('.user__list-item:first-child .user__list-link');
    const cartButton = document.querySelector('.user__list-item:last-child .user__list-link');
    const body = document.body;
    
    // Create modal containers if they don't exist
    if (!document.getElementById('loginModal')) {
      createLoginModal();
    }
    
    if (!document.getElementById('cartModal')) {
      createCartModal();
    }
    
    // Get modals
    const loginModal = document.getElementById('loginModal');
    const cartModal = document.getElementById('cartModal');
    const closeButtons = document.querySelectorAll('.modal-close');
    
    // Event listeners for opening modals
    loginButton.addEventListener('click', function(e) {
      e.preventDefault();
      openModal(loginModal);
    });
    
    // Event listeners for closing modals
    closeButtons.forEach(button => {
      button.addEventListener('click', function() {
        closeModal(this.closest('.modal'));
      });
    });
    
    // Close modal when clicking outside
    window.addEventListener('click', function(e) {
      if (e.target.classList.contains('modal')) {
        closeModal(e.target);
      }
    });
    
    // Email validation for login form
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
    
    // Function to open modal
    function openModal(modal) {
      modal.style.display = 'flex';
      body.classList.add('modal-open');
      
      // Якщо це модальне вікно кошика, оновлюємо його вміст
      if (modal.id === 'cartModal') {
        updateCartModal();
      }
    }
    
    // Function to close modal
    function closeModal(modal) {
      modal.style.display = 'none';
      body.classList.remove('modal-open');
    }
    
    // Create login modal
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
    
    // Create cart modal
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
      
      // Додаємо стилі для модального вікна кошика
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
      `;
      document.head.appendChild(style);
    }
    
    // Add slider functionality if not already implemented
    if (document.querySelector('.slider')) {
      initializeSlider();
    }
    
    function initializeSlider() {
      const slides = document.querySelectorAll('.slider__item');
      const dots = document.querySelectorAll('.slider__dot');
      const prevButton = document.querySelector('.slider__nav-button.prev');
      const nextButton = document.querySelector('.slider__nav-button.next');
      let currentSlide = 0;
      
      // Show first slide
      showSlide(currentSlide);
      
      // Next button
      nextButton.addEventListener('click', () => {
        currentSlide = (currentSlide + 1) % slides.length;
        showSlide(currentSlide);
      });
      
      // Previous button
      prevButton.addEventListener('click', () => {
        currentSlide = (currentSlide - 1 + slides.length) % slides.length;
        showSlide(currentSlide);
      });
      
      // Dots
      dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
          currentSlide = index;
          showSlide(currentSlide);
        });
      });
      
      function showSlide(index) {
        slides.forEach((slide, i) => {
          slide.classList.remove('active');
          dots[i].classList.remove('active');
        });
        
        slides[index].classList.add('active');
        dots[index].classList.add('active');
      }
      
      // Auto slide
      setInterval(() => {
        currentSlide = (currentSlide + 1) % slides.length;
        showSlide(currentSlide);
      }, 5000);
    }
  });
  // Mobile menu functionality
document.addEventListener('DOMContentLoaded', function() {
  // Add mobile menu toggle
  const headerContainer = document.querySelector('.header__container');
  const menuToggle = document.createElement('button');
  menuToggle.classList.add('menu-toggle');
  menuToggle.innerHTML = '<span></span>';
  headerContainer.insertBefore(menuToggle, document.querySelector('.menu__list-block'));
  
  // Create overlay for mobile menu
  const menuOverlay = document.createElement('div');
  menuOverlay.classList.add('menu-overlay');
  document.body.appendChild(menuOverlay);
  
  // Toggle mobile menu
  menuToggle.addEventListener('click', function() {
    this.classList.toggle('active');
    document.querySelector('.menu__list-block').classList.toggle('active');
    menuOverlay.classList.toggle('active');
    document.body.classList.toggle('no-scroll');
  });
  
  // Close menu when clicking overlay
  menuOverlay.addEventListener('click', function() {
    menuToggle.classList.remove('active');
    document.querySelector('.menu__list-block').classList.remove('active');
    this.classList.remove('active');
    document.body.classList.remove('no-scroll');
  });
  
  // Create collapsible filter sections for mobile
  if (window.innerWidth <= 767) {
    const filterContainer = document.querySelector('.filter-container');
    
    if (filterContainer) {
      // Create toggle button
      const filterToggle = document.createElement('button');
      filterToggle.classList.add('filter-toggle');
      filterToggle.textContent = 'Фільтри';
      
      // Create collapse container
      const filterCollapse = document.createElement('div');
      filterCollapse.classList.add('filter-collapse');
      
      // Move all filter fieldsets into collapse container
      Array.from(filterContainer.querySelectorAll('fieldset')).forEach(fieldset => {
        filterCollapse.appendChild(fieldset);
      });
      
      // Add toggle and collapse to filter container
      filterContainer.appendChild(filterToggle);
      filterContainer.appendChild(filterCollapse);
      
      // Toggle filter visibility
      filterToggle.addEventListener('click', function() {
        filterCollapse.classList.toggle('active');
      });
    }
  }
  
  // Adjust slider for mobile
  const sliderItems = document.querySelectorAll('.slider__item');
  const prevButton = document.querySelector('.slider__nav-button.prev');
  const nextButton = document.querySelector('.slider__nav-button.next');
  const sliderDots = document.querySelectorAll('.slider__dot');
  
  let currentSlide = 0;
  
  function showSlide(index) {
    sliderItems.forEach((slide, i) => {
      slide.classList.remove('active');
      sliderDots[i].classList.remove('active');
    });
    
    sliderItems[index].classList.add('active');
    sliderDots[index].classList.add('active');
    currentSlide = index;
  }
  
  if (prevButton && nextButton) {
    prevButton.addEventListener('click', function() {
      currentSlide = currentSlide === 0 ? sliderItems.length - 1 : currentSlide - 1;
      showSlide(currentSlide);
    });
    
    nextButton.addEventListener('click', function() {
      currentSlide = currentSlide === sliderItems.length - 1 ? 0 : currentSlide + 1;
      showSlide(currentSlide);
    });
  }
  
  sliderDots.forEach((dot, index) => {
    dot.addEventListener('click', function() {
      showSlide(index);
    });
  });
  
  // Enable touch swipe for slider on mobile
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
      if (touchEndX < touchStartX) {
        // Swipe left
        currentSlide = currentSlide === sliderItems.length - 1 ? 0 : currentSlide + 1;
        showSlide(currentSlide);
      }
      if (touchEndX > touchStartX) {
        // Swipe right
        currentSlide = currentSlide === 0 ? sliderItems.length - 1 : currentSlide - 1;
        showSlide(currentSlide);
      }
    }
  }
  
  // Responsive image loading
  function loadResponsiveImages() {
    const images = document.querySelectorAll('img');
    
    images.forEach(img => {
      const source = img.parentElement.querySelector('source');
      if (source) {
        if (window.innerWidth <= 767) {
          // Load mobile size images
          img.src = img.src.replace('.png', '-mobile.png');
        }
      }
    });
  }
  
  // Call responsive functions on window resize
  window.addEventListener('resize', function() {
    if (window.innerWidth > 767) {
      document.querySelector('.menu__list-block')?.classList.remove('active');
      menuToggle.classList.remove('active');
      menuOverlay.classList.remove('active');
      document.body.classList.remove('no-scroll');
    }
  });
});