<?php  if ( ! defined('BASEPATH')) exit('No direct script access allowed');

/**
 * ExpressionEngine - by EllisLab
 *
 * @package		ExpressionEngine
 * @author		ExpressionEngine Dev Team
 * @copyright	Copyright (c) 2003 - 2011, EllisLab, Inc.
 * @license		http://expressionengine.com/user_guide/license.html
 * @link		http://expressionengine.com
 * @since		Version 2.0
 * @filesource
 */
 
// ------------------------------------------------------------------------

/**
 * dashEE Module Install/Update File
 *
 * @package		ExpressionEngine
 * @subpackage	Addons
 * @category	Module
 * @author		Chris Monnat
 * @link		http://chrismonnat.com
 */

class Dashee_upd {
	
	public $version;
	
	private $_EE;
	private $_model;
	
	/**
	 * Constructor
	 */
	public function __construct()
	{
		$this->_EE =& get_instance();
		
        $this->_EE->load->add_package_path(PATH_THIRD .'dashee/');

        $this->_EE->load->model('dashee_model');
        $this->_model = $this->_EE->dashee_model;
        
        $this->version = $this->_model->get_package_version();
	}
	
	// ----------------------------------------------------------------
	
	/**
	 * Installation Method
	 *
	 * @return 	boolean 	TRUE
	 */
	public function install()
	{
		return $this->_model->install_module();
	}

	// ----------------------------------------------------------------
	
	/**
	 * Uninstall
	 *
	 * @return 	boolean 	TRUE
	 */	
	public function uninstall()
	{
		return $this->_model->uninstall_module();
	}
	
	// ----------------------------------------------------------------
	
	/**
	 * Module Updater
	 *
	 * @return 	boolean 	TRUE
	 */	
	public function update($current = '')
	{
		return $this->_model->update_package($current);	
	}
	
}
/* End of file upd.dashee.php */
/* Location: /system/expressionengine/third_party/dashee/upd.dashee.php */