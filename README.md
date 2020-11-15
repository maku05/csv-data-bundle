# CSV Data Bundle

## description

This bundle let's you analyse data from a csv file by different categories and tags set by the user. The data can be displayed in a line chart. 

## features
- csv-data analysation by categories
- user can define multiple categories the csv data will be analyzed by
- to define a category multiple tags can be set
- the csv-data will be analysed by the given tags and grouped by the corresponding category
- the data will be displayed in a line chart sorted by month and category
- the per month value of a category is the sum of the single values found to the tags of a category 
- [maku05/user-authentication-bundle](https://github.com/maku05/user-authentication-bundle) is used for user handling
- this bundle requires [symfony/webpack-encore-bundle](https://github.com/symfony/webpack-encore-bundle) support

## installation

### step one

`composer require maku05/csv-data-bundle`


### update translation.yml

`config/packages/translation.yaml` in the translator section add:  

```
paths:
    - '%kernel.project_dir%/vendor/maku05/finance-data-bundle/src/Resources/translations'
```

### update twig.yml

`config/packages/twig.yaml` in the translator section add:

```
paths:
   - '%kernel.project_dir%/vendor/maku05/finance-data-bundle/src/Resources/views'
```  

### update webpack config

to you `webpack.config.js` add the bundle entry

```js
 .addEntry('csv-data-bundle', './vendor/maku05/csv-data-bundle/src/Resources/assets/js/csv-data-bundle.js')
```

## TODO

- tests
- move modifying of config files to symfony recipe
- multifile support
- support different file formats






