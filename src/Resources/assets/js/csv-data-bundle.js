import * as FilePond from 'filepond';
import 'chart.js';
import Tagify from '@yaireo/tagify'
import jump from 'jump.js';
import de_DE from 'filepond/locale/de-de.js';

import 'filepond/dist/filepond.min.css';
import '@yaireo/tagify/dist/tagify.css';
require('../scss/project.scss');

class CSVBundle {
  static init() {
    CSVBundle.initUploadForm();
    CSVBundle.initChart();
    CSVBundle.initUser()
  }

  static initUploadForm() {
    let form = document.querySelector('form.upload');

    if(!form) {
      return;
    }

    CSVBundle.initFormSubmit();
    CSVBundle.initFormCategories();
    CSVBundle.initTagFields();
    CSVBundle.initUpload();
  }

  // form action
  static initFormSubmit() {
    let form = document.querySelector('form.upload');

    form.addEventListener('submit', (event) => {
      event.preventDefault();

      let formData = new FormData(form),
          action = form.getAttribute('action'),
          config = {
            onSuccess: CSVBundle.onChartResponse,
            onError: CSVBundle.onError
          };

      CSVBundle.doPostRequest(action, formData, config,{});
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

      CSVBundle.updateTagInputFields(tagsInputFields, e.target.value);

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
              onSuccess: CSVBundle.onAddCategoryResponse
            }
      }

      CSVBundle.doPostRequest(action, {}, config, {});
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
    CSVBundle.initRegistration();
    CSVBundle.initLogin();
    CSVBundle.initLogout();
  }

  static initLogin() {
    let form = document.querySelector('.form-login form');

    if(!form) {
      return;
    }

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      CSVBundle.initAuthorization();
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
            onSuccess: CSVBundle.onRegistrationResponse,
            onError: CSVBundle.onError
          };

      CSVBundle.doPostRequest(action, formData, config);
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
          onSuccess: CSVBundle.onTokenResponse,
          onError: CSVBundle.onError
        },
        headers = {
          "Authorization": "Basic " + btoa(email + ":" + password)
        };

    CSVBundle.doPostRequest(action,{}, config, headers);
  }

  // async responses
  static onChartResponse() {
    let data = JSON.parse(this),
        container = document.querySelector('.chart-container');

    if(data.template) {
      container.innerHTML = data.template;
    }

    if(data.chartConfig) {
      CSVBundle.initChart(data.chartConfig);
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

    CSVBundle.initTagFields();
  }

  static onRegistrationResponse() {
    let data = JSON.parse(this);

    if(data.success) {
      CSVBundle.initAuthorization();
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

      message.innerHTML = CSVBundle.getFormErrorMessage(data)
    } else {
      message.innerHTML = data.template;
      message = message.firstChild;
    }

    document.body.append(message);

    setTimeout(() => {
      document.querySelector('.message-container').remove();
    }, 5000);
  }


  static getFormErrorMessage(data) {
    let wrapper = document.querySelector('.csv-data-wrapper');
    if(!wrapper) {
      return data.message;
    }

    let config = JSON.parse(wrapper.dataset.config);
    if(!config) {
      return data.message;
    }

    return config[data.error];
  }


  // request action
  static doPostRequest(url, formData, config, headers) {
    let request = CSVBundle.createRequest(url);

    if(headers) {
      request = CSVBundle.applyAdditionalHeaders(request, headers);
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


document.addEventListener('DOMContentLoaded', CSVBundle.init());


