( function(){
	var handle;

	handle = {
		// MOD_CLS : 'dshop-module',
		INSTANCEID_ATTR : 'data-instanceid',
		TEMPLATENAME_ATTR : 'data-templatename',
		MODULENAME_ATTR : 'data-modulename',
		TPL_SUFFIX : 'tpl',
		kayakLocalKey : 'kayak'
		//TPL_SUFFIX : 'html',
		// MODULES_DIR : 'modules',
		// MAIN_FIX : '.main'
	}

	define( 'kayak/core/config', function( require, exports, module ) {
		module.exports = handle;
	} );
} )();