<?php


namespace Maku05\CSVDataBundle;


use Maku05\CSVDataBundle\DependencyInjection\CSVDataExtension;
use Symfony\Component\HttpKernel\Bundle\Bundle;

class CSVDataBundle extends Bundle
{
    public function getContainerExtension()
    {
        return new CSVDataExtension();
    }
}