<?php


namespace Maku05\CSVDataBundle\Controller;


use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Contracts\Translation\TranslatorInterface;

/**
 * delivers pages and general dom manipulation action
 *
 * Class FrontendController
 * @package Maku05\CSVDataBundle\Controller
 */
class FrontendController extends AbstractController
{
    /**
     * @var TranslatorInterface
     */
    protected TranslatorInterface $translator;

    public function __construct(TranslatorInterface $translator)
    {
        $this->translator = $translator;
    }

    /**
     * @Route ("/", name="page_index")
     */
    public function getIndexPageAction()
    {
        return new Response($this->renderView('pages/index.html.twig', ['config' => $this->getBasicConfig()]));
    }

    /**
     * @Route("/registration", name="page_registration")
     */
    public function getRegistrationPageAction()
    {
        return new Response($this->renderView('pages/registration.html.twig', ['config' => $this->getBasicConfig()]));
    }

    /**
     * @Route("/chart", name="page_chart")
     */
    public function getChartPageAction()
    {
        return new Response($this->renderView('pages/chart.html.twig', ['config' => $this->getBasicConfig()]));
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

    /**
     * get basic data needed for message handling in javascript
     * @return string
     */
    public function getBasicConfig(): string
    {
        return json_encode([
            'data_insufficient' => $this->translator->trans('csv.form.registration.error.dataInsufficient'),
            'password_length' =>$this->translator->trans('csv.form.registration.error.passwordLength'),
            'wrong_password' =>$this->translator->trans('csv.form.general.error.wrongPassword'),
            'no_user' =>$this->translator->trans('csv.form.general.error.noUser'),
            'password_unequal' =>$this->translator->trans('csv.form.registration.error.passwordUnequal'),
        ]);
    }
}