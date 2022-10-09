'use strict';
const adressesContainer = document.querySelector('.adresses-section');
const form = document.querySelector('.form');
const submitBtn = document.querySelector('.form__btn');
const input = document.querySelector('.form__input');

class App {
  #map;
  #marker;
  constructor() {
    form.addEventListener('submit', e => {
      this._handleform(e, input.value);
    });
    navigator.geolocation.getCurrentPosition(
      this._loadMap.bind(this),
      this._displayAlert
    );
  }
  _loadMap(pos) {
    const {
      coords: { latitude: lat, longitude: long },
    } = pos;
    this.#map = L.map('map').setView([lat, long], 13);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution:
        '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(this.#map);
    this.#marker = L.marker([lat, long]).addTo(this.#map);
    this._getCurrentUserData();
  }
  _displayAlert() {
    alert(
      'The map cannot be loaded , you must allow the site to access your location.'
    );
  }
  _changeInputPlaceHolder(error) {
    input.classList.add('changePlaceholderColor');
    input.placeholder = error;
    this._setBackInputToDefault();
  }
  async _handleform(e, val) {
    e.preventDefault();
    input.blur();
    input.value = '';
    if (!val) this._changeInputPlaceHolder('The field is empty');
    // else if (!regexExp.test(val))
    //   this._changeInputPlaceHolder('Invalid IP adress');
    else {
      try {
        const resp = await fetch(
          `https://api.ipdata.co/${val}?api-key=5b2a6fe76a3891894d1965fe4a500287f93024e9dbeb463987dd425a`
        );
        const data = await resp.json();
        const {
          latitude: lat,
          longitude: long,
          ip,
          country_name: country,
          city,
          time_zone: { offset: timeZone },
        } = data;
        if (!city) throw new Error();
        // Remove the current marker from the map
        this.#map.removeLayer(this.#marker);
        // Set a new marker on the map
        L.marker([lat, long]).addTo(this.#map);
        // Change the view to the where to marker is placed
        this.#map.panTo(new L.LatLng(lat, long));
        this._renderUserData(ip, country, city, timeZone);
      } catch (error) {
        this._changeInputPlaceHolder('The IP adress was not found!');
      }
    }
  }
  async _getCurrentUserData() {
    try {
      const response = await fetch(
        'https://api.ipdata.co?api-key=5b2a6fe76a3891894d1965fe4a500287f93024e9dbeb463987dd425a'
      );
      const data = await response.json();
      const {
        latitude: lat,
        longitude: long,
        ip,
        country_name: country,
        city,
        time_zone: { offset: timeZone },
      } = data;
      this._renderUserData(ip, country, city, timeZone);
    } catch (error) {
      this._changeInputPlaceHolder(
        'Something went wrong, try to reload the page!'
      );
    }
  }
  _renderUserData(ipAdress, country, city, timeZone) {
    adressesContainer.innerHTML = '';
    const html = `
    <ul class="adress">
      <li class="adress__item">
        <label class="adress__label" for="">ip adress</label>
        <p id="ipAdress" class="adress__main">${ipAdress}</p>
      </li>
      <li class="adress__item">
        <label class="adress__label" for="">Country</label>
        <p id="country" class="adress__country">${country}</p>
      </li>
      <li class="adress__item">
        <label class="adress__label" for="">City</label>
        <p id="city" class="adress__city">${city}</p>
      </li>
      <li class="adress__item">
        <label class="adress__label" for="">Timezone</label>
        <p id="timezone" class="adress__timezone">UTC${timeZone.slice(
          0,
          3
        )}:${timeZone.slice(3)}</p>
      </li>
    </ul>
    `;
    adressesContainer.insertAdjacentHTML('afterbegin', html);
  }
  _setBackInputToDefault() {
    setTimeout(() => {
      input.placeholder = 'Search for any IP address';
      input.classList.remove('changePlaceholderColor');
    }, 2000);
  }
}
const app = new App();
