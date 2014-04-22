if (!window.ANALYSIS) {
	
	window.ANALYSIS = {
		
		/**
		 * 'E' for English, 'F' for French or 'S' for Spanish
		 */
		lang : 'E',

        /*
         This setting is used to integrate FAOSTAT Analysis with the Gateway.
         It can't be stored in the JSON configuration file because it is
         used to locate the JSON configuration file.
         */
        prefix : 'http://localhost:8080/faostat-analysis-js/',
		
		/**
		 * e.g. 'G1' (Linear Regression)
		 */
		function_group_code : '',
		
		/**
		 * e.g. F4
		 */
		function_code : '',
		
		/**
		 * e.g. FAOSTATPROD
		 */
		datasource : '',
		
		/**
		 * e.g. localhost:8080
		 */
		baseurl : '',
		
		/**
		 * e.g. localhost:8080
		 */
		baseurl_r : '',
		
		/**
		 * e.g. localhost:8080
		 */
		baseurl_bletchley : '',
		
		/**
		 * To be used to collect parameters
		 */
		variable_indices : new Array(),
		
		/**
		 * Custom FAOSTAT theme
		 */
		theme : 'faostat',
			
		/**
		 * @param lang Language for the UI, it can be 'E' (default), 
		 * 'F' or 'S'
		 * 
		 * Read settings and initiate the module.
		 * 
		 */
        init : function(groupCode, domainCode, lang) {

            /**
			 * Language: as parameter or from the URL
			 */
			if (lang != null && lang.length > 0) {
				ANALYSIS.lang = lang;
			}
			var tmp = $.url().param('lang');
			if (tmp != null && tmp.length > 0)
				ANALYSIS.lang = tmp;
			
			/**
			 * Read and store settings for web-services
			 */
            $.getJSON(ANALYSIS.prefix + 'config/faostat-analysis-configuration.json', function(data) {
                var settings = data;
                if (typeof data == 'string')
                    settings = $.parseJSON(data);
                ANALYSIS.datasource = settings.datasource;
                ANALYSIS.baseurl = settings.baseurl;
                ANALYSIS.baseurl_bletchley = settings.baseurl_bletchley;
                ANALYSIS.baseurl_r = settings.baseurl_r;
            });
			
			/**
			 * Initiate multi-language
			 */
			var I18NLang = '';
			switch (ANALYSIS.lang) {
				case 'F' : I18NLang = 'fr'; break;
				case 'S' : I18NLang = 'es'; break;
				default: I18NLang = 'en'; break;
			}
			$.i18n.properties({
				name: 'I18N',
				path: ANALYSIS.prefix + 'I18N/',
				mode: 'both',
				language: I18NLang
			});
			
			/**
			 * Load the structure in the 'container' DIV
			 */
			$('#container').load(ANALYSIS.prefix + 'structure.html', function() {
				ANALYSIS.initStructure();
			});
			
		},
		
		/**
		 * Initiate the structure of the UI.
		 */
		initStructure : function() {
			
			/**
			 * Load the welcome image.
			 */
			var img = '<img style="margin-left: 200px;" src="' + ANALYSIS.prefix + 'images/analysisWelcome_' + ANALYSIS.lang + '.png' + '">';
            document.getElementById('content').innerHTML = img;
			
			/**
			 * Load the JSON that defines the available functions
			 */
			$.getJSON(ANALYSIS.prefix + 'config/functions.json', function(data) {
				ANALYSIS.initTree(data);
			});
			
		},
		
		/**
		 * Initiate the tree with the content of the JSON
		 */
		initTree : function(data) {
			
			/**
			 * Initiate JQWidgets Tree
			 */
			$('#tree').jqxTree({
				width: '200',
				theme: ANALYSIS.theme
			});
			
			/**
			 * Remove tree panel border color
			 */
			$('#tree').css('border-color', '#FFFFFF');
			
			/**
			 * Add leaves
			 */
			$.each(data, function(k, v) {
				$('#tree').jqxTree('addTo', { label: v[ANALYSIS.lang + '_label'], value: k, id: k});
			});
			
			/**
			 * Add children to the main leaves
			 */
			var leaves = $('#tree').jqxTree('getItems');
			for (var i = 0 ; i < leaves.length ; i++) {
				var code = leaves[i].id;
				try {
					$.each(data[code].functions, function(k, v) {
						$('#tree').jqxTree('addTo', { label: v[ANALYSIS.lang + '_label'], value: k }, leaves[i].element);
					});
				} catch (err) {
					
				}
			}
			
			/**
			 * Expand the tree.
			 */
			$('#tree').jqxTree('expandAll');
			
			/**
			 * Implement the selection event
			 */
			$('#tree').bind('select', function (event) {
				
				var args = event.args;
		        var item = $('#tree').jqxTree('getItem', args.element);
		        
		        /**
		         * Children: functions
		         */
		        if (item.parentElement != null && item.hasItems == false) {
		        	
		        	/**
		        	 * Remember selected function code
		        	 */
		        	ANALYSIS.function_code = item.value;
		        	
		        	/**
		        	 * Re-load the interface only if it is not the one that is currently selected
		        	 */
		        	if (item.parentId != ANALYSIS.function_group_code) {
		        		
		        		/**
		        		 * Remember the group selection
		        		 */
		        		ANALYSIS.function_group_code = item.parentId;
		        		
		        		/**
		        		 * Load the appropriate interface according to the group
		        		 */
		        		switch (item.parentId) {
		        		
		        			/**
		        			 * G1 - Linear Regression
		        			 */
		        			case 'G1':
		        				$('#content').load(ANALYSIS.prefix + 'linear-regression.html', function() {
					        		ANALYSIS.initLinearRegressionUI(item.value, $.i18n.prop('_' + item.value));
					        	});
		        			break;
		        			
		        			/**
		        			 * G2 - Univariate Statistics
		        			 */
		        			case 'G2':
		        				$('#content').load(ANALYSIS.prefix + 'univariate-statistics.html', function() {
		        					ANALYSIS.initUnivariateStatisticsUI(item.value, $.i18n.prop('_' + item.value));
					        	});
		        			break;
		        			
		        		}
		        		
		        	} else {
//		        		var function_name = '<div class="function_name">' + $.i18n.prop('_' + item.value) + '</div>';
                        var function_name = $.i18n.prop('_' + item.value);
		    			document.getElementById('function_name').innerHTML = $.function_name;
                        $('#function_name').css('display', 'inline-block');
		        	}
		        	
		        } 
		        
		        /**
		         * Main leaves: groups
		         */
		        else {
		        	
		        	var img = '<img style="margin-left: 200px;" src="' + ANALYSIS.prefix + 'images/analysisWelcome_' + ANALYSIS.lang + '.png' + '">';
					document.getElementById('content').innerHTML = img;
		        	
		        }
		        
			});
			
		},
		
		initUnivariateStatisticsUI : function(code, label) {

            // hide results
            $('#result-wrapper').css('display', 'none');
			
			/**
			 * Multi-language
			 */
			document.getElementById('variables_label').innerHTML = $.i18n.prop('_variables');
			document.getElementById('groups_list').innerHTML = $.i18n.prop('_groups');
			document.getElementById('domains_list').innerHTML = $.i18n.prop('_domains');
			document.getElementById('countries_list').innerHTML = $.i18n.prop('_countries');
			document.getElementById('items_list').innerHTML = $.i18n.prop('_items');
			document.getElementById('elements_list').innerHTML = $.i18n.prop('_elements');
//			document.getElementById('timeperiod_label').innerHTML = $.i18n.prop('_timeperiod');
//			document.getElementById('from_year_label').innerHTML = $.i18n.prop('_from_year');
//			document.getElementById('to_year_label').innerHTML = $.i18n.prop('_to_year');
			$('#select_all_countries_button').attr('value', $.i18n.prop('_select_all'));
			$('#deselect_all_countries_button').attr('value', $.i18n.prop('_deselect_all'));
			$('#select_all_items_button').attr('value', $.i18n.prop('_select_all'));
			$('#deselect_all_items_button').attr('value', $.i18n.prop('_deselect_all'));
			$('#select_all_elements_button').attr('value', $.i18n.prop('_select_all'));
			$('#deselect_all_elements_button').attr('value', $.i18n.prop('_deselect_all'));
			document.getElementById('cols_label').innerHTML = $.i18n.prop('_columns');
			document.getElementById('rows_label').innerHTML = $.i18n.prop('_rows');
			document.getElementById('sub_rows_label').innerHTML = $.i18n.prop('_sub_rows');
//			document.getElementById('pivot_config_label').innerHTML = $.i18n.prop('_pivot_configuration');
			
			/**
			 * Read function's parameters
			 */
//			var function_name = '<div class="function_name">' + label + '</div>';
            var function_name = label;
			document.getElementById('function_name').innerHTML = function_name;
            $('#function_name').css('display', 'inline-block');
			
			/**
			 * Create the years lists
			 */
			var years_source = new Array();
			for (var i = 1961 ; i < 2051 ; i++)
				years_source.push(i);
			$('#from_year_list').jqxComboBox({source: years_source, width: '100%', height: '25px', theme: ANALYSIS.theme});
			$('#to_year_list').jqxComboBox({source: years_source, width: '100%', height: '25px', theme: ANALYSIS.theme});
			$('#from_year_list').jqxComboBox('selectIndex', 39);
			$('#to_year_list').jqxComboBox('selectIndex', 49);
			
			/**
			 * Initiate Buttons
			 */
			$('.add_remove_button').jqxButton({width: '100%', theme: ANALYSIS.theme});
			
			/**
			 * Add functionalities to the buttons
			 */
			$('#show_results_button').bind('click', function() {
				ANALYSIS.showResults_UNIVARIATE();
			});
			$('#clear_selection_button').bind('click', function() {
				ANALYSIS.clearSelection_UNIVARIATE();
			});
			$('#export_data_button').bind('click', function() {
				ANALYSIS.exportData_UNIVARIATE();
			});
			$('#export_results_button').bind('click', function() {
				ANALYSIS.exportResults_UNIVARIATE();
			});
			
			/**
			 * Translate buttons
			 */
			$('#clear_selection_button').attr('value', $.i18n.prop('_clear_selection'));
			$('#export_results_button').attr('value', $.i18n.prop('_export_results'));
			$('#export_data_button').attr('value', $.i18n.prop('_export_data'));
			$('#show_results_button').attr('value', $.i18n.prop('_show_results'));
			
			/**
			 * Initiate the combo boxes for output settings
			 */
			var source = [{'code': $.i18n.prop('_countries'), 'label': $.i18n.prop('_countries')},
			              {'code': $.i18n.prop('_elements'), 'label': $.i18n.prop('_elements')},
			              {'code': $.i18n.prop('_items'), 'label': $.i18n.prop('_items')}];
			$('#columns_list').jqxComboBox({source: source, width: '100%', height: '25px', theme: ANALYSIS.theme, selectedIndex: 0});
			$('#rows_list').jqxComboBox({source: source, width: '100%', height: '25px', theme: ANALYSIS.theme, selectedIndex: 1});
			$('#sub_rows_list').jqxComboBox({source: source, width: '100%', height: '25px', theme: ANALYSIS.theme, selectedIndex: 2});
			
			/**
			 * Initiate grids
			 */
			ANALYSIS.initGrid('groups_list', 'groups', $.i18n.prop('_groups'), null);
			$('#domains_list').jqxGrid({width: '130px', height: '200px',source: [], columns: [{text: $.i18n.prop('_domain'), datafield: 'label'}], theme: ANALYSIS.theme});
			$('#countries_list').jqxGrid({width: '130px', height: '200px',source: [], columns: [{text: $.i18n.prop('_country'), datafield: 'label'}], theme: ANALYSIS.theme});
			$('#items_list').jqxGrid({width: '130px', height: '200px',source: [], columns: [{text: $.i18n.prop('_item'), datafield: 'label'}], theme: ANALYSIS.theme});
			$('#elements_list').jqxGrid({width: '130px', height: '200px',source: [], columns: [{text: $.i18n.prop('_element'), datafield: 'label'}], theme: ANALYSIS.theme});
			
			/**
			 * Initiate '(De)Select All' buttons
			 */
			$('.select_all_button').jqxButton({ width: '55px', theme: ANALYSIS.theme});
			$('#select_all_countries_button').bind('click', function() {ANALYSIS.selectAll('countries_list', true);});
			$('#deselect_all_countries_button').bind('click', function() {ANALYSIS.selectAll('countries_list', false);});
			$('#select_all_items_button').bind('click', function() {ANALYSIS.selectAll('items_list', true);});
			$('#deselect_all_items_button').bind('click', function() {ANALYSIS.selectAll('items_list', false);});
			$('#select_all_elements_button').bind('click', function() {ANALYSIS.selectAll('elements_list', true);});
			$('#deselect_all_elements_button').bind('click', function() {ANALYSIS.selectAll('elements_list', false);});

            // timerange of the years
            $("#analysis_years").rangeSlider({bounds:{min: 1961, max: 2050}}, {defaultValues: {min: 1992, max: 2011}}, {step: 1});
            $("#analysis_years").bind("valuesChanged", function(e, data){
//                FAOSTATCompare.compare();
            });
			
		},
		
		showResults_UNIVARIATE : function() {
			var payload = ANALYSIS_COLLECTOR.collect_UNIVARIATE();
			WDS.getTable(payload, false, 'html');
			/**
			 * Google Analytics
			 */
			ANALYSIS_STATS.showResults('Function: cast, Parameter (if any): ' + ANALYSIS.function_code);
		},
		
		exportData_UNIVARIATE : function() {
			var payload = ANALYSIS_COLLECTOR.collect_UNIVARIATE();
			WDS.getTable(payload, true, 'excel');
			/**
			 * Google Analytics
			 */
			ANALYSIS_STATS.exportData('Function: cast, Parameter (if any): ' + ANALYSIS.function_code);
		},
		
		exportResults_UNIVARIATE : function() {
			var payload = ANALYSIS_COLLECTOR.collect_UNIVARIATE();
			WDS.getTable(payload, false, 'excel');
			/**
			 * Google Analytics
			 */
			ANALYSIS_STATS.exportResults('Function: cast, Parameter (if any): ' + ANALYSIS.function_code);
		},
		
		createExcel_UNIVARIATE : function(table) {
			var data = {};
			data.json = JSON.stringify(table);
			$.ajax({
				type : 'POST',
				url : 'http://' + ANALYSIS.baseurl_r + '/r/rest/eval/export/data',
				data : data,
				success : function(response) {
					var idx_1 = ('onLoad=\'location.replace("').length + response.indexOf('onLoad=\'location.replace("');
					var idx_2 = response.indexOf('")', idx_1);
					var url = response.substring(idx_1, idx_2);
					var w = window.open(url);
					if (!w)
						alert($.i18n.prop('_popup_message'));
				},
				error : function(err, b, c) {
					console.log(err.status + ", " + b + ", " + c);
				}
			});
		},
		
		transpose : function(table, parameter) {
			
			/**
			 * Cols of the new matrix are the rows of the old
			 * one and vice-vers
			 */
			var rows = table.length;
			var cols = table[0].length;
			
			/**
			 * Initiate the matrix
			 */
			var t = new Array(cols);
			for (var i = 0 ; i < cols ; i++) 
				t[i] = new Array(rows);
			
			/**
			 * Fill the matrix
			 */
			for (var i = 0 ; i < table.length ; i++) {
				for (var j = 0 ; j < table[i].length ; j++) {
					t[j][i] = table[i][j];
				}
			}
			
			/**
			 * Create the script
			 */
			ANALYSIS.createUnivariateScript(t, parameter);
			
		},
		
		createUnivariateScript : function(transposedMatrix, parameter) {
			
			var columns = ($('#columns_list').jqxComboBox('getSelectedItem')).value;
			var rows = ($('#rows_list').jqxComboBox('getSelectedItem')).value;
			var sub_rows = ($('#sub_rows_list').jqxComboBox('getSelectedItem')).value;
			
			var s = '';
			s += ANALYSIS.createRVectorFromArray($.i18n.prop('_years'), transposedMatrix[0], true);
			s += ANALYSIS.createRVectorFromArray($.i18n.prop('_countries'), transposedMatrix[1], true);
			s += ANALYSIS.createRVectorFromArray($.i18n.prop('_elements'), transposedMatrix[2], true);
			s += ANALYSIS.createRVectorFromArray($.i18n.prop('_items'), transposedMatrix[3], true);
			s += ANALYSIS.createRVectorFromArray($.i18n.prop('_values'), transposedMatrix[4], false);
			s += 'library(reshape); ';
			s += 'data = data.frame(' + $.i18n.prop('_years') + ', ' + $.i18n.prop('_countries') + ', ' + $.i18n.prop('_elements') + ', ' + $.i18n.prop('_items') + ', ' + $.i18n.prop('_values') + '); ';
			s += 'data2 = cast(data, ' + columns + ' ~ ' + rows + ' + ' + sub_rows + ', fun.aggregate = ' + ANALYSIS.function_code + ', value="' + $.i18n.prop('_values') + '"); ';
			ANALYSIS.evalScript(s, parameter);
			
		},
		
		createRVectorFromArray : function(label, v, wrap) {
            var data = v;
            if (typeof v == 'string')
                data = $.parseJSON(v);
            var l = label.replace(/ /g,"_");
			var s = l  + ' = c(';
			for (var i = 0 ; i < v.length ; i++) {
				if (wrap)
					s += '\'' + v[i] + '\'';
				else
					s += v[i];
				if (i < data.length - 1)
					s += ', ';
			}
			s += '); ';
			return s;
		},
		
		clearSelection_UNIVARIATE : function() {
			var c = confirm($.i18n.prop('_clear_message'));
			if (c) {
				ANALYSIS.selectAll('groups_list', false);
				ANALYSIS.selectAll('domains_list', false);
				ANALYSIS.selectAll('countries_list', false);
				ANALYSIS.selectAll('elements_list', false);
				ANALYSIS.selectAll('items_list', false);
			}
		},
		
		selectAll : function(gridCode, select) {
			var rows = $('#' + gridCode).jqxGrid('getrows');
			for (var i = 0 ; i < rows.length ; i++) {
	           	if (select) {
	           		$('#' + gridCode).jqxGrid('selectrow', i);
	           	} else {
	           		$('#' + gridCode).jqxGrid('unselectrow', i);
	           	}
	        }
		},
		
		initGrid : function(gridCode, csCode, gridLabel, groupCode) {
			var url = 'http://' + ANALYSIS.baseurl  + '/wds/rest/' + csCode + '/' + ANALYSIS.datasource + '/' + ANALYSIS.lang;
			if (groupCode != null)
				url = 'http://' + ANALYSIS.baseurl  + '/wds/rest/' + csCode + '/' + ANALYSIS.datasource + '/' + groupCode + '/' + ANALYSIS.lang;
			$.ajax({
				type: 'GET',
				url: url,
				dataType: 'json',
				success : function(response) {
					var data = new Array();
					var buffer = new Array();
					var counter = 0;
					for (var i = 0 ; i < response.length ; i++) {
						if ($.inArray(response[i][0], buffer) < 0) {
							buffer.push(response[i][0]);
							var row = {};
							row['code'] = response[i][0];
							row['label'] = response[i][1];
							data[counter++] = row;
						}
					}
					var source = {
						localdata: data,
			            datatype: 'array'
			        };
					var dataAdapter = new $.jqx.dataAdapter(source);
		            $('#' + gridCode).jqxGrid({
		            	width: '130px',
		                height: '200px',
		                source: dataAdapter,
		                columns: [{text: gridLabel, datafield: 'label'}],
		                theme: ANALYSIS.theme
		            });
		            if (groupCode == null) {
			            $('#' + gridCode).bind('rowselect', function (event) {
			            	var args = event.args;
			            	ANALYSIS.selectAll('countries_list', false);
			            	ANALYSIS.selectAll('elements_list', false);
			            	ANALYSIS.selectAll('items_list', false);
			            	$('#domains_list').jqxGrid('clear');
			            	$('#countries_list').jqxGrid('clear');
			            	$('#elements_list').jqxGrid('clear');
			            	$('#items_list').jqxGrid('clear');
			            	ANALYSIS.initGrid('domains_list', 'domains', 'Domains', args.row.code);
			            });
		            } else {
		            	$('#domains_list').bind('rowselect', function (event) {
			            	var args = event.args;
			            	ANALYSIS.initCountryElementItemGrid('countries_list', 'countries', args.row.code, $.i18n.prop('_countries'));
			            	ANALYSIS.initCountryElementItemGrid('elements_list', 'elements', args.row.code, $.i18n.prop('_elements'));
			            	ANALYSIS.initCountryElementItemGrid('items_list', 'items', args.row.code, $.i18n.prop('_items'));
			            });
		            }
				},
				error : function(err, b, c) {
					console.log(err + ' - ' + b + ' - ' + c);
				}
			});
		},
		
		initCountryElementItemGrid : function(gridCode, csCode, domainCode, gridLabel) {
			$.ajax({
				type: 'GET',
				url: 'http://' + ANALYSIS.baseurl_bletchley + '/bletchley/rest/codes/' + csCode + '/' + ANALYSIS.datasource + '/' + domainCode + '/' + ANALYSIS.lang,
				dataType: 'json',
				success : function(response) {
					var data = new Array();
					for (var i = 0 ; i < response.length ; i++) {
						var row = {};
						row['code'] = response[i].code;
						if (csCode == 'elements') {
							row['label'] = response[i].label + ' (' + response[i].unit + ')';
						} else {
							row['label'] = response[i].label;
						}
						data[i] = row;
					}
					var source = {
						localdata: data,
			            datatype: "array"
			        };
					var dataAdapter = new $.jqx.dataAdapter(source);
		            $('#' + gridCode).jqxGrid({
		            	width: '130px',
		                height: '200px',
		                source: dataAdapter,
		                columns: [{text: gridLabel, datafield: 'label'}],
		                selectionmode: 'multiplerowsextended',
		                theme: ANALYSIS.theme
		            });
				},
				error : function(err, b, c) {
					console.log(err + ' - ' + b + ' - ' + c);
				}
			});
		},
		
		initLinearRegressionUI : function(code, label) {

            // hide results
            $('#result-wrapper').css('display', 'none');
			
			/**
			 * Read function's parameters
			 */
//			var function_name = '<div class="function_name">' + label + '</div>';
            var function_name = label;
			document.getElementById('function_name').innerHTML = function_name;
            $('#function_name').css('display', 'inline-block');
			
			/**
			 * Translations
			 */
//			document.getElementById('timeperiod_label').innerHTML = $.i18n.prop('_timeperiod');
//			document.getElementById('from_year_label').innerHTML = $.i18n.prop('_from_year');
//			document.getElementById('to_year_label').innerHTML = $.i18n.prop('_to_year');
			
			/**
			 * Load HTML for the Dependent Variable
			 */
			$('#dependent_variable').load(ANALYSIS.prefix + 'dependent-variable.html', function() {
				
				/**
				 * Translations
				 */
				document.getElementById('dependent_variable_label').innerHTML = $.i18n.prop('_dependent_variable');
				document.getElementById('group_label').innerHTML = $.i18n.prop('_group');
				document.getElementById('domain_label').innerHTML = $.i18n.prop('_domain');
				document.getElementById('country_label').innerHTML = $.i18n.prop('_country');
				document.getElementById('item_label').innerHTML = $.i18n.prop('_item');
				document.getElementById('element_label').innerHTML = $.i18n.prop('_element');
				document.getElementById('which_is_your_dependent_variable_label').innerHTML = $.i18n.prop('_which_is_your_dependent_variable');
				
				/**
				 * Create the years lists
				 */
				var years_source = new Array();
				for (var i = 1961 ; i < 2051 ; i++)
					years_source.push(i);
				$('#from_year_list').jqxComboBox({source: years_source, width: '100%', height: '21px', theme: ANALYSIS.theme});
				$('#to_year_list').jqxComboBox({source: years_source, width: '100%', height: '21px', theme: ANALYSIS.theme});
				$('#from_year_list').jqxComboBox('selectIndex', 39);
				$('#to_year_list').jqxComboBox('selectIndex', 49);
				
				/**
				 * Fill the groups list
				 */
				ANALYSIS.buildGroupsOrDomainsList('groups', null, '_0');
				
				/**
				 * Initiate other combo-boxes
				 */
				$('#domains_list_0').jqxComboBox({source: [], width: '100%', height: '21px', theme: ANALYSIS.theme});
				$('#countries_list_0').jqxComboBox({source: [], width: '100%', height: '21px', theme: ANALYSIS.theme});
				$('#elements_list_0').jqxComboBox({source: [], width: '100%', height: '21px', theme: ANALYSIS.theme});
				$('#items_list_0').jqxComboBox({source: [], width: '100%', height: '21px', theme: ANALYSIS.theme});
				
				/**
				 * Upgrade the variable list
				 */
				$('#countries_list_0').bind('change', function(e) {ANALYSIS.upgradeVariableList(0);});
				$('#elements_list_0').bind('change', function(e) {ANALYSIS.upgradeVariableList(0);});
				$('#items_list_0').bind('change', function(e) {ANALYSIS.upgradeVariableList(0);});
				
				/**
				 * Initiate the Variable combo-box
				 */
				$('#variable_list_0').jqxComboBox({
					source: ANALYSIS.pleaseSelectDataSource(), 
					width: '100%', 
					height: '21px',
					selectedIndex: 0,
					theme: ANALYSIS.theme
				});
				
				/**
				 * Take note of this...
				 */
				ANALYSIS.variable_indices.push(0);
				
        	});
			
			/**
			 * Add the first independent variable
			 */
			ANALYSIS.addVariableAgent(0, true);
			
			/**
			 * Add functionalities to the buttons
			 */
			$('#show_results_button').bind('click', function() {
				ANALYSIS.showResults_LM('html');
			});
			$('#export_results_button').bind('click', function() {
				ANALYSIS.showResults_LM('excel');
			});
			$('#clear_selection_button').bind('click', function() {
				ANALYSIS.clearSelection_LM();
			});
			
			/**
			 * Translate buttons
			 */
			$('#clear_selection_button').attr('value', $.i18n.prop('_clear_selection'));
			$('#export_results_button').attr('value', $.i18n.prop('_export_results'));
			$('#export_data_button').attr('value', $.i18n.prop('_export_data'));
			$('#show_results_button').attr('value', $.i18n.prop('_show_results'));

            // timerange of the years
            $("#analysis_years").rangeSlider({bounds:{min: 1961, max: 2050}}, {defaultValues: {min: 1992, max: 2011}}, {step: 1});
            $("#analysis_years").bind("valuesChanged", function(e, data){
//                FAOSTATCompare.compare();
            });
			
		},
		
		/**
		 * Collect parameters and show results
		 */
		showResults_LM : function(parameter) {
			
			try {
				
				/**
				 * Collect parameters from the UI
				 */
				var payload = ANALYSIS_COLLECTOR.collect();
				
				/**
				 * Create a payload suitable for WDS
				 */
				var payloads = new Array();
				payloads.push(payload.dependent_variable);
				for (var i = 0 ; i < payload.variables.length ; i++)
					payloads.push(payload.variables[i]);
				
				/**
				 * Fetch data through WDS
				 */
				WDS.getVectors(payload, payloads, new Array(), parameter);
				
				/**
				 * Google Analytics
				 */
				ANALYSIS_STATS.showResults('Function: lm, Parameter (if any):');
				
			} catch (err) {
				alert(err);
			}
			
		},
		
		/**
		 * @param vectors Data fetch through WDS
		 * 
		 * Generate the script for R
		 */
		createScript : function(payload, vectors, parameter) {
			
			try {
				
				var variables = ANALYSIS.validateVectors(vectors);
				
				var script = '';
				switch(ANALYSIS.function_code) {
					case 'lm' :
						script = ANALYSIS.createScript_LM(payload, variables);
					break;
					case 'cor' :
						script = ANALYSIS.createScript_COR(payload, variables);
					break;
					case 'cov' :
						script = ANALYSIS.createScript_COV(payload, variables);
					break;
					default: 
						throw('\'' + ANALYSIS.function_code + '\''  + $.i18n.prop('_has_not_been_implemented_yet'));
					break;
				}
				ANALYSIS.evalScript(script, parameter);
				
			} catch (err) {
				
				alert(err);
				
			}
			
		},
		
		createScript_COV : function(payload, variables) {
			var script = '';
			script += ANALYSIS.createRVector(payload.dependent_variable.variable_label, variables[0]);
			for (var i = 1 ; i < variables.length ; i++) {
				script += ANALYSIS.createRVector(payload.variables[i - 1].variable_label, variables[i]);
			}
			script += 'library(IDPmisc); data = data.frame(';
			script += (payload.dependent_variable.variable_label).replace(/ /g,"_") + ', ';
			for (var i = 1 ; i < variables.length ; i++) {
				script += (payload.variables[i - 1].variable_label).replace(/ /g,"_");
				if (i < variables.length - 1)
					script += ', ';
			}
			script += '); ';
			script += 'c = cov(data);';
			return script;
		},
		
		createScript_COR : function(payload, variables) {
			var script = '';
			script += ANALYSIS.createRVector(payload.dependent_variable.variable_label, variables[0]);
			for (var i = 1 ; i < variables.length ; i++) {
				script += ANALYSIS.createRVector(payload.variables[i - 1].variable_label, variables[i]);
			}
			script += 'library(IDPmisc); data = data.frame(';
			script += (payload.dependent_variable.variable_label).replace(/ /g,"_") + ', ';
			for (var i = 1 ; i < variables.length ; i++) {
				script += (payload.variables[i - 1].variable_label).replace(/ /g,"_");
				if (i < variables.length - 1)
					script += ', ';
			}
			script += '); ';
			script += 'c = cor(data);';
			return script;
		},
		
		createScript_LM : function(payload, variables) {
			var script = '';
			script += ANALYSIS.createRVector(payload.dependent_variable.variable_label, variables[0]);
			for (var i = 1 ; i < variables.length ; i++) {
				script += ANALYSIS.createRVector(payload.variables[i - 1].variable_label, variables[i]);
			}
			script += 'l = lm(' + (payload.dependent_variable.variable_label).replace(/ /g,"_") + ' ~ ';
			for (var i = 1 ; i < variables.length ; i++) {
				script += (payload.variables[i - 1].variable_label).replace(/ /g,"_");
				if (i < variables.length - 1)
					script += ' + ';
			}
			script += '); s = summary(l); observed = ' + (payload.dependent_variable.variable_label).replace(/ /g,"_") + '; ';
            return script;
		},
		
		/**
		 * @param script R script
		 * @param parameter 'html' or 'excel'
		 */
		evalScript : function(script, parameter) {
			
			var function_code = 'cast';
			if (ANALYSIS.function_code == 'lm' || ANALYSIS.function_code == 'cor' || ANALYSIS.function_code == 'cov')
				function_code = ANALYSIS.function_code;
			
			var data = {};
			data.script = script;
			data['function'] = function_code;
			data.parameter = parameter;
			
			$.ajax({
				
				type : 'POST',
				url : 'http://' + ANALYSIS.baseurl_r + '/r/rest/eval',
				data : data,
				
				success : function(response) {

                    if (parameter == 'html') {

                        $('#result-wrapper').css('display', 'inline');
                        $('#result_area').empty();
                        $('#result_area').append("<div class='obj-box' id='result-box'>No data to display - Please make another selection</div>");

                        if (function_code == 'lm') {

                            var idx_1 = response.indexOf('<table');
                            var idx_2 = '</table>'.length + response.indexOf('</table>', idx_1);
                            var s = response.substring(idx_1, idx_2);
                            document.getElementById('result-box').innerHTML = s;

                            var idx_3 = response.indexOf('<iframe', idx_2);
                            var idx_4 = '</iframe>'.length + response.indexOf('</iframe>', idx_3);
                            var s2 =  '<div align="center" class="obj-box" id="result-box">' + response.substring(idx_3, idx_4) + '</div>';
                            $('#result_area').append(s2);

                            var idx_5 = response.indexOf('<iframe', idx_4);
                            var idx_6 = '</iframe>'.length + response.indexOf('</iframe>', idx_5);
                            var s3 =  '<div align="center" class="obj-box" id="result-box">' + response.substring(idx_5, idx_6) + '</div>';
                            $('#result_area').append(s3);

                            var idx_7 = response.indexOf('<iframe', idx_6);
                            var idx_8 = '</iframe>'.length + response.indexOf('</iframe>', idx_7);
                            var s4 =  '<div align="center" class="obj-box" id="result-box">' + response.substring(idx_7, idx_8) + '</div>';
                            $('#result_area').append(s4);

                            var idx_9 = response.indexOf('<iframe', idx_8);
                            var idx_10 = '</iframe>'.length + response.indexOf('</iframe>', idx_9);
                            var s5 =  '<div align="center" class="obj-box" id="result-box">' + response.substring(idx_9, idx_10) + '</div>';
                            $('#result_area').append(s5);

                        } else {

                            var s = '<div id="result-box" class="obj-box">' + response + '</div>';
                            document.getElementById('result_area').innerHTML = s;

                        }
					
					} else {
						
						var idx_1 = ('onLoad=\'location.replace("').length + response.indexOf('onLoad=\'location.replace("');
						var idx_2 = response.indexOf('")', idx_1);
						var url = response.substring(idx_1, idx_2);
						var w = window.open(url);
						if (!w)
							alert($.i18n.prop('_popup_message'));
						
					}
					
				},
				
				error : function(err, b, c) {
					console.log(err.status + ", " + b + ", " + c);
				}
				
			});

		},
		
		/**
		 * @param label Name for the vector in R
		 * @param v Data
		 * 
		 * Format data for R
		 */
		createRVector : function(label, v) {
			var data = v;
            if (typeof v == 'string')
                data = $.parseJSON(v);
            var l = label.replace(/ /g,"_");
			var s = l  + ' = c(';
			for (var i = 0 ; i < data.length ; i++) {
				s += data[i][1];
				if (i < data.length - 1)
					s += ', ';
			}
			s += '); ';
            return s;
		},
		
		/**
		 * @param vectors Data fetch through WDS
		 * @returns {Boolean} Acknowledgement
		 * 
		 * We need the vectors to be of the same length
		 */
		validateVectors : function(vectors) {
			return vectors;
		},
		
		/**
		 * Clear user selection
		 */
		clearSelection_LM : function() {
			var c = confirm($.i18n.prop('_clear_message'));
			if (c) {
				for (var i = 0 ; i < ANALYSIS.variable_indices.length ; i++) {
					var id = ANALYSIS.variable_indices[i];
					$('#groups_list_' + id).jqxComboBox('selectIndex', 0);
					$('#variable_list_' + id).jqxComboBox('selectIndex', 0);
					$('#domains_list_' + id).jqxComboBox('clear'); 
					$('#countries_list_' + id).jqxComboBox('clear');
					$('#elements_list_' + id).jqxComboBox('clear');
					$('#items_list_' + id).jqxComboBox('clear');
				}
			}
		},
		
		upgradeVariableList : function(list_id) {
			var pleaseSelect = {'code': null, 'label': $.i18n.prop('_please_select')};
			var country = $('#countries_list_' + list_id).jqxComboBox('getSelectedItem'); 
			var element = $('#elements_list_' + list_id).jqxComboBox('getSelectedItem');
			var item = $('#items_list_' + list_id).jqxComboBox('getSelectedItem');
			$('#variable_list_' + list_id).jqxComboBox('clear'); 
			$('#variable_list_' + list_id).jqxComboBox('addItem', pleaseSelect);
			$('#variable_list_' + list_id).jqxComboBox('addItem', country);
			$('#variable_list_' + list_id).jqxComboBox('addItem', element);
			$('#variable_list_' + list_id).jqxComboBox('addItem', item);
			$('#variable_list_' + list_id).jqxComboBox('selectIndex', 0); 
		},
		
		pleaseSelectDataSource : function() {
			var data = [];
			var tmp = {};
			tmp.code = null;
			tmp.label = $.i18n.prop('_please_select');
			data.push(tmp);
			return data;
		},
		
		removeVariableAgent : function(currentIDX) {
			$('#fieldset_' + currentIDX).remove();
			var idx = ANALYSIS.variable_indices.indexOf(currentIDX);
			ANALYSIS.variable_indices.splice(idx, 1);
		},
		
		/**
		 * @param currentIDX e.g. 1
		 * @param hideRemoveVariableButton This is used for the 1st independent variable only, because it can't be removed
		 * 
		 * This function create the independent variable box.
		 * 
		 */
		addVariableAgent : function(currentIDX, hideRemoveVariableButton) {
			
			/**
			 * Generate a new ID
			 */
			var nextIDX = 1 + parseInt(currentIDX);
			
			/**
			 * Take note of this...
			 */
			ANALYSIS.variable_indices.push(nextIDX);
			
			/**
			 * Load the HTML for the structure
			 */
			$.ajax({
				
				type: 'GET',
				url: ANALYSIS.prefix + 'independent-variable-x.html',
				dataType: 'html',
				
				success : function(response) {
					
					/**
					 * Add the new box to the existing ones
					 */
//					$('#linear_regression_table > tbody:last').append(response);
                    $('#linear_regression_table').append(response);
					
					/**
					 * Change '_x' with the current id for all the ID's
					 */
					$('#remove_variable_button_td_x').attr('id', 'remove_variable_button_td_' + nextIDX);
					$('#fieldset_x').attr('id', 'fieldset_' + nextIDX);
					$('#seq_x').attr('id', 'seq_' + nextIDX);
					$('#variable_list_x').attr('id', 'variable_list_' + nextIDX);
					$('#remove_variable_button_x').attr('id', 'remove_variable_button_' + nextIDX);
					$('#buttons_x').attr('id', 'buttons_' + nextIDX);
					$('#groups_list_x').attr('id', 'groups_list_' + nextIDX);
					$('#domains_list_x').attr('id', 'domains_list_' + nextIDX);
					$('#countries_list_x').attr('id', 'countries_list_' + nextIDX);
					$('#elements_list_x').attr('id', 'elements_list_' + nextIDX);
					$('#items_list_x').attr('id', 'items_list_' + nextIDX);
					$('#add_variable_button_x').attr('id', 'add_variable_button_' + nextIDX);
					$('#remove_variable_button_x').attr('id', 'remove_variable_button_' + nextIDX);
					$('#domains_list_' + nextIDX).jqxComboBox({source: [], width: '100%', height: '25px', theme: ANALYSIS.theme});
					$('#countries_list_' + nextIDX).jqxComboBox({source: [], width: '100%', height: '25px', theme: ANALYSIS.theme});
					$('#elements_list_' + nextIDX).jqxComboBox({source: [], width: '100%', height: '25px', theme: ANALYSIS.theme});
					$('#items_list_' + nextIDX).jqxComboBox({source: [], width: '100%', height: '25px', theme: ANALYSIS.theme});
					
					/**
					 * Change ID's and translate labels
					 */
					$('#independent_variable_x').attr('id', 'independent_variable_' + nextIDX);
					$('#group_label_x').attr('id', 'group_label_' + nextIDX);
					$('#domain_label_x').attr('id', 'domain_label_' + nextIDX);
					$('#country_label_x').attr('id', 'country_label_' + nextIDX);
					$('#item_label_x').attr('id', 'item_label_' + nextIDX);
					$('#element_label_x').attr('id', 'element_label_' + nextIDX);
					$('#which_is_your_independent_variable_label_x').attr('id', 'which_is_your_independent_variable_label_' + nextIDX);
					console.log(nextIDX);
                    document.getElementById('independent_variable_' + nextIDX).innerHTML = $.i18n.prop('_independent_variable') + '<div class="variable-number">' + nextIDX + '</div>';
					document.getElementById('group_label_' + nextIDX).innerHTML = $.i18n.prop('_group');
					document.getElementById('domain_label_' + nextIDX).innerHTML = $.i18n.prop('_domain');
					document.getElementById('country_label_' + nextIDX).innerHTML = $.i18n.prop('_country');
					document.getElementById('item_label_' + nextIDX).innerHTML = $.i18n.prop('_item');
					document.getElementById('element_label_' + nextIDX).innerHTML = $.i18n.prop('_element');
					document.getElementById('which_is_your_independent_variable_label_' + nextIDX).innerHTML = $.i18n.prop('_which_is_your_independent_variable');
					
					/**
					 * Load groups
					 */
					ANALYSIS.buildGroupsOrDomainsList('groups', null, '_' + nextIDX);
					
					/**
					 * Initiate buttons
					 */
					$('.add_remove_button').jqxButton({width: '100%', theme: ANALYSIS.theme});
					$('#add_variable_button_' + nextIDX).bind('click', function() {
						ANALYSIS.addVariableAgent(nextIDX, false);
					});
					
					$('#add_variable_button_' + nextIDX).attr('value', $.i18n.prop('_add_variable'));
					$('#remove_variable_button_' + nextIDX).attr('value', $.i18n.prop('_remove_variable'));
					
					/**
					 * Hide the remove button, 1st independent variable only
					 */
					if (hideRemoveVariableButton) {
						$('#remove_variable_button_td_' + nextIDX).css('display', 'none');
					}
					
					$('#remove_variable_button_' + nextIDX).bind('click', function() {
						ANALYSIS.removeVariableAgent(nextIDX);
					});
					
					/**
					 * Initiate the Variable combo-box
					 */
					$('#variable_list_' + nextIDX).jqxComboBox({
						source: ANALYSIS.pleaseSelectDataSource(), 
						width: '100%', 
						height: '25px', 
						selectedIndex: 0,
						theme: ANALYSIS.theme
					});

                    /**
					 * Upgrade the variable list
					 */
					$('#countries_list_' + nextIDX).bind('change', function(e) {ANALYSIS.upgradeVariableList(nextIDX);});
					$('#elements_list_' + nextIDX).bind('change', function(e) {ANALYSIS.upgradeVariableList(nextIDX);});
					$('#items_list_' + nextIDX).bind('change', function(e) {ANALYSIS.upgradeVariableList(nextIDX);});
					
				},
				error : function(err, b, c) {
					console.log(err + ' - ' + b + ' - ' + c);
				}
				
			});
			
		},
		
		buildGroupsOrDomainsList : function(code, groupCode, suffix) {
			
			var url = 'http://' + ANALYSIS.baseurl  + '/wds/rest/' + code + '/' + ANALYSIS.datasource + '/' + ANALYSIS.lang;
			if (groupCode != null)
				url = 'http://' + ANALYSIS.baseurl  + '/wds/rest/' + code + '/' + ANALYSIS.datasource + '/' + groupCode + '/' + ANALYSIS.lang;

            console.log(url);
            console.log(code);
            console.log(groupCode);
			
			$.ajax({
				
				type: 'GET',
				url: url,
				dataType: 'json',
				
				success : function(response) {
				
					/**
					 * Initiate variables
					 */
					var data = [];
					var buffer = new Array();
					
					/**
					 * Courtesy message
					 */
					var tmp = {};
					tmp.code = null;
					tmp.label = $.i18n.prop('_please_select');
					data.push(tmp);
					
					/**
					 * Fill the array for the combo-box
					 */
					for (var i = 0 ; i < response.length ; i++) {
						if ($.inArray(response[i][0], buffer) < 0) {
							buffer.push(response[i][0]);
							var tmp = {};
							tmp.code = response[i][0];
							tmp.label = response[i][1];
							data.push(tmp);
						}
					}
					
					/**
					 * Create JQWidgets combo-box
					 */
					$('#' + code + '_list' + suffix).jqxComboBox({ 
						source: data, 
						selectedIndex: 0, 
						width: '100%', 
						height: '25px',
						theme: ANALYSIS.theme
					});
					
					/**
					 * Fill the Groups list...
					 */
					if (code == 'groups') {
						$('#' + code + '_list' + suffix).bind('change', function (event) {
							var args = event.args;
							ANALYSIS.buildGroupsOrDomainsList('domains', args.item.originalItem.code, suffix);
						}); 
					} 
					
					/**
					 * ...or the other ones
					 */
					else {
						$('#' + code + '_list' + suffix).bind('change', function (event) {
							var args = event.args;
							ANALYSIS.fillDropDownList(args.item.originalItem.code, 'countries', suffix);
							ANALYSIS.fillDropDownList(args.item.originalItem.code, 'elements', suffix);
							ANALYSIS.fillDropDownList(args.item.originalItem.code, 'items', suffix);
						});
					}
					
				},
				
				error : function(err, b, c) {
					console.log(err + ' - ' + b + ' - ' + c);
				}
				
			});
			
		},
		
		fillDropDownList : function(group_code, list_code, suffix) {
			
			$.ajax({
				
				type: 'GET',
				url: 'http://' + ANALYSIS.baseurl_bletchley  + '/bletchley/rest/codes/' + list_code + '/' + ANALYSIS.datasource  + '/' + group_code + '/' + ANALYSIS.lang,
				dataType: 'json',
				
				success : function(response) {
					
					/**
					 * Insert a courtesy message
					 */
					response.splice(0, 0, {'code': null, 'label': $.i18n.prop('_please_select')});
					
					/**
					 * Fill the combo-box
					 */
					$('#' + list_code + '_list' + suffix).jqxComboBox({ 
						source: response, 
						selectedIndex: 0, 
						width: '100%', 
						height: '25px',
						theme: ANALYSIS.theme
					});
					
				},
				
				error : function(err, b, c) {
					console.log(err + ' - ' + b + ' - ' + c);
				}
				
			});
			
		}
	
	};
	
}