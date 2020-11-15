<?php


namespace Maku05\CSVDataBundle\Util;


use Symfony\Contracts\Translation\TranslatorInterface;

class ChartUtil
{
    /**
     * @var TranslatorInterface
     */
    private $translator;

    public function __construct(TranslatorInterface $translator)
    {
        $this->translator = $translator;
    }

    /**
     * get the config needed to initialize chart
     *
     * @param string $csvData
     * @param array $categories
     * @param string $valueColumn
     * @param string $dateColumn
     * @return array
     */
    public function getChartConfig(array $data): array
    {
        $config = [
            'data' => $this->getChartData($data),
            'options' => $this->getDefaultChartOptionsConfig()
        ];

        return $config;
    }


    /**
     * get data for chart
     * data consists of configuration of the chart axis
     * and data for each line in the chart
     *
     * @param string $csvData
     * @param array $categories
     * @param string $valueColumn
     * @param string $dateColumn
     * @return array
     */
    protected function getChartData(array $formData): array
    {
        $data = $this->getDefaultChartDataConfig();

        $datasets    = $this->getChartDatasets($formData);
        $cleanedData = [];

        foreach ($datasets as $dataset) {
            $cleanedData[] = $dataset;
        }

        $data['datasets'] = $cleanedData;

        return $data;
    }


    /**
     * get the datasets (points) for a line in the chart
     * @param array $data
     * @return array[]
     */
    public function getChartDatasets(array $data): array
    {
        $csvData       = $data['csvData'];
        $categories        = $this->getCategories($data['category']);
        $valueColumn = $data['valueColumn'];
        $dateColumn = $data['dateColumn'];

        $datasets = $this->getDefaultDataSetsForCategories($categories);
        $data     = json_decode($csvData, true);

        foreach ($data as $row) {
            $found = false;
            $time  = strtotime($row[$dateColumn]);
            $month = (int)date("n", $time) - 1; // array starts at index 0

            foreach ($categories as $category) {
                if(empty($category['tags'])) {
                    continue;
                }

                if (!$this->isCategoryValue($row, $category['tags'])) {
                    continue;
                }

                $this->updateDataSets($datasets, $category['name'], $month, $row[$valueColumn]);
                $found = true;
            }

            if (!$found) {
                $this->updateDataSets($datasets, $this->translator->trans('csv.chart.category.default'), $month, $row[$valueColumn]);
            }
        }

        return $datasets;
    }

    /**
     * get category configuration
     *
     * @param array $categories
     * @return array
     */
    protected function getCategories(array $categories): array
    {
        $config = [
            [
            'name' => $this->translator->trans('csv.chart.category.default'),
            'color' => '#555555',
            'tags' => []
            ]
        ];

        foreach($categories as $key => $category) {
            if(!is_array($category)) {
                continue;
            }

            $config[] = [
              'name' => $key,
              'color' => isset($category['color']) ? $category['color'] : '#555555',
              'tags' => $this->getCategoryTags($category)
            ];
        }


        return $config;
    }

    /**
     * get the tag values to a category
     *
     * @param array $category
     * @return array
     */
    protected function getCategoryTags(array $category): array
    {
        $tags = [];
        $tagData = json_decode($category['tags'], true);

        foreach($tagData as $tag) {
            $tags[] = $tag['value'];
        }

        return $tags;
    }


    /**
     * calculate the monthly values of a dataset
     *
     * @param array $dataset
     * @param $key
     * @param $index
     * @param $value
     */
    protected function updateDataSets(array &$datasets, string $label, $index, $value): void
    {
        if(null === ($value = $this->getValue($value))) {
            return;
        }

        foreach($datasets as $key => $dataset) {
            if($label != $dataset['label']) {
                continue;
            }

            $datasets[$key]['data'][$index] += $value;
        }
    }

    /**
     * check if value is negative
     * transform it to positive
     *
     * if positive already just return since its not a deposit
     *
     * @param $value
     * @return int|null
     */
    public function getValue($value):? int
    {
        if (false !== strpos($value, "-")) {
            return (float) $value * -1;
        }

        return null;
    }


    /**
     * check if the given tags of a category match the data
     *
     * @param string $value
     * @param array $categories
     * @return bool
     */
    protected function isCategoryValue(array $row, array $tags): bool
    {
        $isCategoryValue = false;

        foreach ($row as $value) {
            foreach ($tags as $tag) {
                if ('' == $tag || '' == $value) {
                    continue;
                }

                if (false === strpos(strtolower($value), strtolower($tag))) {
                    continue;
                }

                $isCategoryValue = true;
            }
        }

        return $isCategoryValue;
    }

    /**
     * get the default configuration for the data of the chart
     *
     * @return array
     */
    public function getDefaultChartDataConfig(): array
    {
        return [
            'type' => 'line',
            'indexLabelFontSize' => 16,
            'showInLegend' => true,
            'labels' => [
                $this->translator->trans('csv.chart.months.january'),
                $this->translator->trans('csv.chart.months.february'),
                $this->translator->trans('csv.chart.months.march'),
                $this->translator->trans('csv.chart.months.april'),
                $this->translator->trans('csv.chart.months.may'),
                $this->translator->trans('csv.chart.months.june'),
                $this->translator->trans('csv.chart.months.july'),
                $this->translator->trans('csv.chart.months.august'),
                $this->translator->trans('csv.chart.months.september'),
                $this->translator->trans('csv.chart.months.october'),
                $this->translator->trans('csv.chart.months.november'),
                $this->translator->trans('csv.chart.months.december')
            ],
            'fill' => false
        ];
    }

    /**
     * get the default datasets configurations for the given categories
     * add an else-dataset to catch all values that do not match a category
     *
     * @param array $categories
     * @return array
     */
    protected function getDefaultDataSetsForCategories(array $categories): array
    {
        $datasets = [];

        foreach($categories as $category) {
            $datasets[] = [
                'label' => $category['name'],
                'borderColor' => $category['color'],
                'data' => array_fill(0,12,0),
                'yAxisId' => 'amount'
            ];
        }

        return $datasets;
    }


    /**
     * get the default configuration for the chart
     *
     * @return array
     */
    protected function getDefaultChartOptionsConfig()
    {
        return [
            'responsive' => true,
            'hoverMode' => 'index',
            'stacked' => false,
            'title' => [
                'display' => true,
                'text' => $this->translator->trans('csv.chart.title')
            ],
            'scales' => [
                'yAxes' => [
                    'type' => 'linear',
                    'display' => true,
                    'position' => 'left',
                    'id' => 'amount'
                ]
            ]
        ];
    }

    /**
     * prepare the data from csv as an array
     *
     * @param $file
     * @return array
     */
    public function getCsvData($file): array
    {
        $csvData = [];

        if (($handle = fopen($file, "r")) !== FALSE) {
            while (($data = fgetcsv($handle, 0, ";")) !== FALSE) {
                $rowData = [];
                foreach($data as $value) {
                    $rowData[] = $value;
                }

                $csvData[] = $rowData;
            }
            fclose($handle);
        }

        return $csvData;
    }
}