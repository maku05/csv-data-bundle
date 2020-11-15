import * as FilePond from 'filepond';
import 'chart.js';
import Tagify from '@yaireo/tagify'
import jump from 'jump.js';
import de_DE from 'filepond/locale/de-de.js';

import 'filepond/dist/filepond.min.css';
import '@yaireo/tagify/dist/tagify.css';
require('../scss/project.scss');

class CSVApp {
  static init() {
    CSVApp.initForm();
    CSVApp.initChart();
    CSVApp.initUser()
  }

  static initForm() {
    let form = document.querySelector('form.upload');

    if(!form) {
      return;
    }

    CSVApp.initFormSubmit();
    CSVApp.initFormCategories();
    CSVApp.initTagFields();
    CSVApp.initUpload();
  }

  // form action
  static initFormSubmit() {
    let form = document.querySelector('form.upload');

    form.addEventListener('submit', (event) => {
      event.preventDefault();

      let formData = new FormData(form),
          action = form.getAttribute('action'),
          config = {
            onSuccess: CSVApp.onChartResponse,
            onError: CSVApp.onError
          };

      CSVApp.doPostRequest(action, formData, config,{});
    });
  }

  static initUpload() {
    let uploadFields = document.querySelectorAll('.upload-field');

    if(1 > uploadFields.length) {
      return;
    }

    uploadFields.forEach((field) => {
      let form = field.closest('form'),
          valueSelectField = form.querySelector('[name="valueColumn"]'),
          dateField = form.querySelector('[name="dateColumn"]');

      let filepondField = FilePond.create({
        multiple: false,
        server: {
          process: {
            url: '/api/upload',
            onload: (response) => {
              let data = JSON.parse(response);

              if(data.success) {
                for(const [key, value] of Object.entries((data.csvHead))) {
                  let valueOption = document.createElement('option');
                  valueOption.value = key;
                  valueOption.innerText = value;

                  let paymentColumnOption = valueOption.cloneNode(true);

                  valueSelectField.appendChild(valueOption);
                  dateField.appendChild(paymentColumnOption);
                }

                let removeOptions = document.querySelectorAll('option[value="remove"]');

                removeOptions.forEach((element) => {
                  element.remove();
                });

                let csvInput = document.querySelector('#csvDataHidden');
                csvInput.value = JSON.stringify(data.csvData);
              }
            },
          }
        },
      });

      filepondField.setOptions(de_DE);

      field.replaceWith(filepondField.element);
    });
  }

  // chart configuration
  static initChart(config) {
    let chart = document.querySelector('.chart');

    if(!chart) {
      return;
    }

    if(!config && !chart.dataset) {
      return;
    }

    if(!config) {
      config = chart.dataset.chartConfig;
    }

    if(!config) {
      return
    }

    Chart.Line(chart, config);

    jump('.chart-container', {
      duration: 500
    });

  }




  // field configuration
  static initFormCategories() {
    let form = document.querySelector('form.upload');

    if (!form) {
      return;
    }

    document.addEventListener('focusout', (e) => {
      if (!e.target) {
        return;
      }

      if (!e.target.classList.contains('category-input')) {
        return;
      }

      let container = e.target.closest('.category-container');

      if (1 > container.length) {
        return;
      }

      let tagsInputFields = container.querySelectorAll('.tag-input'),
          colorInputField = container.querySelector('.category-color');

      CSVApp.updateTagInputFields(tagsInputFields, e.target.value);

      colorInputField.name = 'category[' + e.target.value + '][color]';
    });

    document.addEventListener('click', function(e) {
      if (!e.target) {
        return;
      }

      let action = '',
          config = {};

      if (e.target.classList.contains('add-category-trigger')) {
        e.preventDefault();
        let categoryCount = document.querySelectorAll('.category-container').length;

        action = '/form/addCategory/' + categoryCount,
            config = {
              onSuccess: CSVApp.onAddCategoryResponse
            }
      }

      CSVApp.doPostRequest(action, {}, config, {});
    });

    document.addEventListener('click', function(e) {
      let dismissTrigger = e.target.parentNode;

      if (!dismissTrigger || !dismissTrigger.classList || !dismissTrigger.classList.contains('dismiss-category')) {
        return;
      }

      let categoryContainer = dismissTrigger.closest('.category-container');

      if(!categoryContainer) {
        return;
      }

      categoryContainer.remove();

      let categoryContainers = document.querySelectorAll('.category-container'),
          categoryWrapper = document.querySelector('.category-wrapper');

      if(1 === categoryContainers.length) {
        categoryWrapper.classList.remove('multiple-categories')
      }
    });
  }

  static initTagFields() {
    let tagInputFields = document.querySelectorAll('.tag-input');
    tagInputFields.forEach((element) => {
      let isInitialised = element.closest('.tagify');

      if(!isInitialised) {
        new Tagify(element);
      }
    });
  }

  static updateTagInputFields(fields, category) {
    fields.forEach((element) => {
      element.name = 'category[' + category + '][tags]'
    });
  }

  // user actions
  static initUser() {
    CSVApp.initRegistration();
    CSVApp.initLogin();
    CSVApp.initLogout();
  }

  static initLogin() {
    let form = document.querySelector('.form-login form');

    if(!form) {
      return;
    }

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      CSVApp.initAuthorization();
    });
  }

  static initRegistration() {
    let form = document.querySelector('.form-registration form');

    if(!form) {
      return;
    }

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      let formData = new FormData(form),
          action = form.getAttribute('action'),
          config = {
            onSuccess: CSVApp.onRegistrationResponse,
            onError: CSVApp.onError
          };

      CSVApp.doPostRequest(action, formData, config);
    });
  }

  static initLogout() {
    let logoutTrigger = document.querySelector('.logout-trigger');

    if(!logoutTrigger) {
      return;
    }

    logoutTrigger.addEventListener('click', (e) => {
      localStorage.removeItem('token');
      window.location.replace("/");
    });
  }

  static initAuthorization()
  {
    let form = document.querySelector('form');

    if(!form) {
      return;
    }

    let formData = new FormData(form),
        email = formData.get('email'),
        password = formData.get('password'),
        action = "/api/token",
        config = {
          onSuccess: CSVApp.onTokenResponse,
          onError: CSVApp.onError
        },
        headers = {
          "Authorization": "Basic " + btoa(email + ":" + password)
        };


    CSVApp.doPostRequest(action,{}, config, headers);
  }

  // async responses
  static onChartResponse() {
    let data = JSON.parse(this),
        container = document.querySelector('.chart-container');

    if(data.template) {
      container.innerHTML = data.template;
    }

    if(data.chartConfig) {
      CSVApp.initChart(data.chartConfig);
    }
  }

  static onAddCategoryResponse() {
    let data = JSON.parse(this);

    if(!data.template) {
      return;
    }

    let categoryWrapper = document.querySelector('.category-wrapper');

    let newField = document.createElement('div');

    newField.innerHTML = data.template;

    categoryWrapper.append(newField.firstChild);

    let categoryContainers = document.querySelectorAll('.category-container');

    if(1 < categoryContainers.length) {
      categoryWrapper.classList.add('multiple-categories');
    }

    CSVApp.initTagFields();
  }

  static onRegistrationResponse() {
    let data = JSON.parse(this);

    if(data.success) {
      CSVApp.initAuthorization();
    }
  }

  static onLoginResponse() {
    let data = JSON.parse(this);

    if(data.success) {
      initAuthorization
    }
  }

  static onTokenResponse() {
    let data = JSON.parse(this);

    if(data.token) {
      localStorage.setItem('token', data.token);
      window.location.replace('/chart');
    }
  }

  static onError() {
    let data = JSON.parse(this);

    if(!data.error) {
      return;
    }

    let message = document.createElement('div');

    if(!data.template) {
      message.classList.add('message-container');
      message.classList.add('alert');
      message.classList.add('alert-danger');
      message.innerText = data.error;

    } else {
      message.innerHTML = data.template;
      message = message.firstChild;
    }

    document.body.append(message);


    setTimeout(() => {
      document.querySelector('.message-container').remove();
    }, 5000);
  }



  // request action
  static doPostRequest(url, formData, config, headers) {
    let request = CSVApp.createRequest(url);

    if(headers) {
      request = CSVApp.applyAdditionalHeaders(request, headers);
    }

    request.onload = function() {
      if (request.status >= 200 && request.status < 400 && config.onSuccess) {
        config.onSuccess.call(request.response);
      } else if (config.onError){
        config.onError.call(request.response);
      }
    }

    request.send(formData);
  }


  static createRequest(url) {
    let request = new XMLHttpRequest();
    request.open('post', url, true);
    request.setRequestHeader("X-Requested-With", "XMLHttpRequest");

    return request;
  }

  static applyAdditionalHeaders(request, headers) {
    for(let key in headers) {
      request.setRequestHeader(key, headers[key]);
    }

    if(localStorage.getItem('token')) {
      request.setRequestHeader("Authorization", "Bearer " + localStorage.getItem('token'));
    }

    return request;
  }
}


document.addEventListener('DOMContentLoaded', CSVApp.init());


