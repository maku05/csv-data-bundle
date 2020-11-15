<?php


namespace Maku05\CSVDataBundle\Controller;


use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

/**
 * delivers pages and general dom manipulation action
 *
 * Class FrontendController
 * @package Maku05\CSVDataBundle\Controller
 */
class FrontendController extends AbstractController
{
    /**
     * @Route ("/", name="page_index")
     */
    public function getIndexPageAction()
    {
        return new Response($this->renderView('pages/index.html.twig', []));
    }

    /**
     * @Route("/registration", name="page_registration")
     */
    public function getRegistrationPageAction()
    {
        return new Response($this->renderView('pages/registration.html.twig', []));
    }

    /**
     * @Route("/chart", name="page_chart")
     */
    public function getChartPageAction()
    {
        return new Response($this->renderView('pages/chart.html.twig', []));
    }

    /**
     * get a new category input field to form
     * contains of category input and tag input field
     *
     * @Route("/form/addCategory/{count}", methods={"POST"})
     */
    public function getAddCategoryAction(int $count)
    {

        return $this->json(['template' => $this->renderView('forms/partials/category.html.twig', ['id' => $count + 1])]);
    }
}