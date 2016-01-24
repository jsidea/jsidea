<?php

namespace jsidea\build;

const R_KIND = 'kind';
const R_NAME = 'name';
const R_USE_ALIAS = 'alias';
const R_NAMESPACE_USE = 'use';
const R_CONTEXT_IMPLEMENTS = 'implements';
const R_CONTEXT_EXTENDS = 'extends';
class ReflectUtil {
	public static function file_get_php_classes($filepath) {
		$php_code = file_get_contents ( $filepath );
		$classes = self::get_php_classes ( $php_code );
		return $classes;
	}
	public static function get_php_classes($php_code) {
		$tokens_all = token_get_all ( $php_code );
		$count = count ( $tokens_all );
		$index = 0;
		
		// the global namespace
		$namespace = array ();
		$namespace [R_KIND] = T_NAMESPACE;
		$namespace [R_NAME] = '';
		$namespace [R_NAMESPACE_USE] = array ();
		
		//TODO: sort tokens by "use"-statements directly under namespaces first (?)
		
		// the context can be a namespace, a class, a interface or a trait
		$context = &$namespace;
		$has_namespace = false;
		$match = function () use($count, $tokens_all, &$index) {
			$args = func_get_args ();
			$args_length = count ( $args );
			if ($args_length > 0 && $index + $args_length < $count) {
				$tokens = array ();
				for($i = 0; $i < $args_length; ++ $i) {
					if ($tokens_all [$i + $index] [0] != $args [$i]) {
						return false;
					}
					$tokens [] = $tokens_all [$i + $index];
				}
				$index += $args_length;
				return $tokens;
			} else {
				return false;
			}
			return false;
		};
		
		$qname = function ($namespace, $name) {
			$name = trim ( $name );
			if ($name [0] == '\\') {
				$short_name = substr ( $name, 1 );
				// $key = array_search ( $short_name, $namespace ['use'] );
				// if ($key === false) {
				// $namespace ['use'] [] = $short_name;
				// }
				// echo "AHH";
				return $short_name;
			}
			if (isset ( $namespace [R_NAMESPACE_USE] )) {
				foreach ( $namespace [R_NAMESPACE_USE] as $use ) {
					$use_name = $use [R_NAME];
					if ($name == $use [R_USE_ALIAS]) {
						return $use_name;
					}
				}
				return ($namespace && $namespace [R_NAME]) ? $namespace [R_NAME] . '\\' . $name : $name;
			} else {
				
				return ($namespace && $namespace [R_NAME]) ? $namespace [R_NAME] . '\\' . $name : $name;
			}
		};
		
		$declarations = array ();
		for($index = 0; $index < $count; $index ++) {
			if (
			// namespace
			($tokens = $match ( T_NAMESPACE, T_WHITESPACE ))) {
				$has_namespace = true;
				$namespace_name = '';
				do {
					$token = $tokens_all [$index];
					if ($token == ';' || $token == '{') {
						break;
					}
					$namespace_name .= is_array ( $token ) ? $token [1] : $token;
				} while ( ++ $index < $count );
				$namespace_name = trim ( $namespace_name );
				
				if ($namespace_name) {
					$declarations [] = array ();
					$namespace = &$declarations [count ( $declarations ) - 1];
					
					// $namespace = array ();
					
					$namespace [R_KIND] = T_NAMESPACE;
					$namespace [R_NAME] = $namespace_name;
					$namespace [R_NAMESPACE_USE] = array ();
					
					$context = &$namespace;
				}
			}
			
			if (
			// in namespace only
			$context [R_KIND] == T_NAMESPACE && 
			// use
			($tokens = $match ( T_USE, T_WHITESPACE ))) {
				$use_names = '';
				do {
					$token = $tokens_all [$index];
					if ($token == ';') {
						break;
					}
					$use_names .= is_array ( $token ) ? $token [1] : $token;
				} while ( ++ $index < $count );
				
				$use_names_array = explode ( ',', $use_names );
				for($i = 0; $i < count ( $use_names_array ); ++ $i) {
					$e = explode ( ' as ', trim ( $use_names_array [$i] ) );
					$use_array = array ();
					$use_array [R_NAME] = trim ( $e [0] );
					if (count ( $e ) > 1)
						$use_array [R_USE_ALIAS] = trim ( $e [1] );
					else {
						$expl = explode ( '\\', $e [0] );
						$use_name = array_pop ( $expl );
						$use_array [R_USE_ALIAS] = trim ( $use_name );
					}
					$namespace [R_NAMESPACE_USE] [] = $use_array;
				}
			}
			
			if (
			// class
			($tokens = $match ( T_CLASS, T_WHITESPACE, T_STRING )) || 
			// interfae
			($tokens = $match ( T_INTERFACE, T_WHITESPACE, T_STRING )) || 
			// trait
			($tokens = $match ( T_TRAIT, T_WHITESPACE, T_STRING ))) {
				$name = $tokens [2] [1];
				$declarations [] = array ();
				$context = &$declarations [count ( $declarations ) - 1];
				$context [R_KIND] = $tokens [0] [0];
				$context [R_NAME] = $qname ( $namespace, $name );
			}
			if (
			// extends
			($tokens = $match ( T_EXTENDS, T_WHITESPACE )) || 
			// implements
			($tokens = $match ( T_IMPLEMENTS, T_WHITESPACE ))) {
				$extends_names = '';
				do {
					$token = $tokens_all [$index];
					if ($token == '{') {
						break;
					}
					if (is_array ( $token ) && $token [0] == T_IMPLEMENTS) {
						$index --;
						break;
					}
					$extends_names .= is_array ( $token ) ? $token [1] : $token;
				} while ( $index ++ < $count );
				$names = explode ( ',', trim ( $extends_names ) );
				$res = array ();
				foreach ( $names as $name ) {
					
					$name = trim ( $name );
					if ($name [0] == '\\') {
						$short_name = substr ( $name, 1 );
						// $key = array_search ( $short_name, $namespace ['use'] );
						// if ($key === false) {
						// $namespace ['use'] [] = $short_name;
						// }
						$res [] = $short_name;
					} else {
						$res [] = $qname ( $namespace, $name );
					}
				}
				if ($tokens [0] [0] == T_EXTENDS) {
					$context [R_CONTEXT_EXTENDS] = $res;
				} else {
					$context [R_CONTEXT_IMPLEMENTS] = $res;
				}
			}
			
			if (
			// in namespace only
			$context [R_KIND] == T_NAMESPACE && 
			// constant
			(($tokens = $match ( T_CONST, T_WHITESPACE, T_STRING )) || 
			// function
			($tokens = $match ( T_FUNCTION, T_WHITESPACE, T_STRING )))) {
				$name = $tokens [2] [1];
				$declarations [] = array ();
				$constant = &$declarations [count ( $declarations ) - 1];
				$constant [R_KIND] = $tokens [0] [0];
				$constant [R_NAME] = $qname ( $namespace, $name );
			}
		}
		
		// resolve token values by the constant name
		$constants_grouped = get_defined_constants ( true );
		$tokenizer_constants = $constants_grouped ['tokenizer'];
		$name_lookup = array ();
		foreach ( $tokenizer_constants as $key => $value ) {
			if ($key [0] === 'T' && $key [1] === '_') {
				$name_lookup [$value] = $key;
			}
		}
		if (! $has_namespace) {
			array_unshift ( $declarations, $namespace );
		}
		foreach ( $declarations as &$declaration ) {
			$declaration [R_KIND] = $name_lookup [$declaration [R_KIND]];
			// if (isset ( $declaration ['use'] ) && ! $declaration ['use'])
			// unset ( $declaration ['use'] );
		}
		
		return $declarations;
	}
}

print_r ( ReflectUtil::file_get_php_classes ( __DIR__ . '/ReflectTextPHPFile.php' ) );
// print_r ( ReflectUtil::file_get_php_classes ( __DIR__ . '/Build.php' ) );
// print_r ( ReflectUtil::file_get_php_classes ( __DIR__ . '/../model/Source.php' ) );

?>