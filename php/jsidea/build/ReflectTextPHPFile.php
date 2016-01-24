<?php

namespace wfb\a;

const THIS_IS_IT = "HELLO WORLD";
interface AInterface {
}
interface AInterface2 {
}
interface AInterface3 {
}
class AClass {
}

namespace wfb\b;

function peterFunc() {
	echo "HELLO WORLD";
}
use wfb\a\AClass, wfb\a\AInterface2;

interface BInterface extends \wfb\a\AInterface, \wfb\a\AInterface2 {
}
class BClass extends AClass implements BInterface, \wfb\a\AInterface3 {
	const PETER = "HELLO WORLD";
}

namespace test;

use wfb\b\BClass;
class BaseClass extends BClass{
}

?>