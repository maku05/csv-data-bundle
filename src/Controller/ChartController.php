<?php


namespace Maku05\CSVDataBundle\Controller;


use Maku05\CSVDataBundle\Util\ChartUtil;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Contracts\Translation\TranslatorInterface;
use Symfony\Component\Routing\Annotation\Route;

/**
 * @Route("/api")
 * Class CSVDataController
 * @package App\Controller
 */
class ChartController extends AbstractController
{
    /**
     * @var ChartUtil
     */
    private $chartUtil;
    /**
     * @var TranslatorInterface
     */
    private $translator;

    public function __construct(ChartUtil $chartUtil, TranslatorInterface $translator)
    {
        $this->chartUtil = $chartUtil;
        $this->translator = $translator;
    }

    /**
     * this initializes the generation of chart data
     * the data will be grouped in datasets according to the
     * given category and tag configuration
     *
     * @Route("/chart", methods={"POST"})
     */
    public function postCreateChartAction(Request $request)
    {
        $this->denyAccessUnlessGranted('ROLE_USER');

        $error = $this->hasError($request);

        if($error) {
            return $this->json([
                'error' => 'missing data',
                'template' => $this->renderView('message/message.html.twig', [
                    'status' => 'danger',
                    'message' => $error
                ])
            ], Response::HTTP_BAD_REQUEST);
        }

        $data = $request->request->all();

        $chartData = $this->chartUtil->getChartConfig($data);

        return $this->json([
            'chartConfig' => $chartData,
            'template' => $this->renderView('partials/chart.html.twig', [
              'chartConfig' => json_encode($chartData)
            ])
        ]);
    }


    /**
     * get the error message if request has error
     *
     * @param Request $request
     * @return string
     */
    protected function hasError(Request $request): ?string
    {
        if(!$request->get('csvData')) {
            return $this->translator->trans('csv.form.csvData.error');
        }

        if(!$request->get('valueColumn')) {
            return  $this->translator->trans('csv.form.valueColumn.error');
        }

        if(!$request->get('dateColumn')) {
            return $this->translator->trans('csv.form.dateColumn.error');
        }

        if(!$request->get('category')) {
            return $this->translator->trans('csv.form.category.error');
        }

        return null;
    }
}