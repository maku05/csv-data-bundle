<?php


namespace Maku05\CSVDataBundle\Controller;

use Maku05\CSVDataBundle\Util\ChartUtil;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\FileBag;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

/**
 * @Route("/api")
 *
 * Class UploadController
 * @package App\Controller
 */
class UploadController extends AbstractController
{
    /**
     * @var ChartUtil
     */
    protected ChartUtil $chartUtil;

    public function __construct(ChartUtil $chartUtil)
    {
        $this->chartUtil = $chartUtil;
    }


    /**
     * when csv file is uploaded get the header and the data component
     * entries in header can be selected to define in which column the values are stored
     * and in which the date entry of this value
     *
     * @Route("/upload", methods={"POST"})
     *
     * @param Request $request
     */
    public function postUploadAction(Request $request)
    {
        /**
         * @var FileBag $file
         */
        $fileBag = $request->files;

        $file = $fileBag->get('filepond');
        $data = $this->chartUtil->getCsvData($file);

        $head = $data[0];
        unset($data[0]);

        return $this->json([
            'success' => 'file uploaded',
            'csvHead' => $head,
            'csvData' => $data
        ], Response::HTTP_OK);
    }
}