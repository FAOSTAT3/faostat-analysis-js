if (!window.ANALYSIS_COLLECTOR) {
	
	/**
	 * Query for each vector
	 * http://fenixapps.fao.org/wds/api?out=html&db=faostatproddiss&select=D.year,D.value&from=data[D]&where=D.areacode(2),D.itemcode(15),D.elementcode(5312),D.domaincode('QC')&orderby=D.year
	 */
	window.ANALYSIS_COLLECTOR = {
		
		/**
		 * This is the function that builds the payload
		 */
		collect : function() {
			
			try {
				
				/**
				 * Validate the UI
				 */
				ANALYSIS_COLLECTOR.isValidSelection();
				
				/**
				 * Initiate the output
				 */
				var payload = {};
				payload.variables = new Array();
				
				/**
				 * Collect user choices for the dependent variable
				 */
				payload.dependent_variable = ANALYSIS_COLLECTOR.collectVariable(0);
				
				/**
				 * Iterate over variables
				 */
				for (var i = 0 ; i < ANALYSIS.variable_indices.length ; i++) {
					if (ANALYSIS.variable_indices[i] != 0) {
						var v = ANALYSIS_COLLECTOR.collectVariable(ANALYSIS.variable_indices[i]);
						payload.variables.push(v);
					}
				}
				
				/**
				 * Return the payload
				 */
				return payload;
			
			} catch (err) {
				
				throw(err);
				
			}
			
		},
		
		isValidSelection : function() {
			ANALYSIS.variable_indices.sort();
			for (var i = 0 ; i < ANALYSIS.variable_indices.length ; i++) {
				var id = ANALYSIS.variable_indices[i];
				var msg = null;
				switch (id) {
					case 0 : msg = ' for the Dependent Variable.'; break; 	
					default: msg = ' for the Independent Variable ' + id; break;
				}
				if ($('#groups_list_' + id).jqxComboBox('getSelectedItem').index == 0)
					throw('Please select a Group' + msg);
				if ($('#domains_list_' + id).jqxComboBox('getSelectedItem').index == 0)
					throw('Please select a Domain' + msg);
				if ($('#countries_list_' + id).jqxComboBox('getSelectedItem').index == 0)
					throw('Please select a Country' + msg);
				if ($('#elements_list_' + id).jqxComboBox('getSelectedItem').index == 0)
					throw('Please select an Element' + msg);
				if ($('#items_list_' + id).jqxComboBox('getSelectedItem').index == 0)
					throw('Please select an Item' + msg);
				try {
					if ($('#variable_list_' + id).jqxComboBox('getSelectedItem').index == 0)
						throw('Please select which is the variable' + msg);
				} catch (err) {
					throw('Please select which is the variable' + msg);
				}
			}
		},
		
		collectVariable : function(id) {
			var v = {};
			var group = $('#groups_list_' + id).jqxComboBox('getSelectedItem');
			var domain = $('#domains_list_' + id).jqxComboBox('getSelectedItem');
			var element = $('#elements_list_' + id).jqxComboBox('getSelectedItem');
			var item = $('#items_list_' + id).jqxComboBox('getSelectedItem');
			var country = $('#countries_list_' + id).jqxComboBox('getSelectedItem');
			var variable = $('#variable_list_' + id).jqxComboBox('getSelectedItem');
			var from_year = $('#from_year_list').jqxComboBox('getSelectedItem');
			var to_year = $('#to_year_list').jqxComboBox('getSelectedItem');
            var years = ANALYSIS_COLLECTOR.years();
			v.group = group.originalItem.code;
			v.domain = domain.originalItem.code;
			v.element = element.originalItem.code;
			v.item = item.originalItem.code;
			v.country = country.originalItem.code;
			v.variable_label = variable.label;
//			v.from_year = from_year.value;
//			v.to_year = to_year.value;
            v.from_year = years[0];
            v.to_year = years[years.length - 1];
			return v;
		},
		
		collect_UNIVARIATE : function() {
			
			var domains = ANALYSIS_COLLECTOR.collectVariable_UNIVARIATE('domains_list');
			var countries = ANALYSIS_COLLECTOR.collectVariable_UNIVARIATE('countries_list');
			var elements = ANALYSIS_COLLECTOR.collectVariable_UNIVARIATE('elements_list');
			var items = ANALYSIS_COLLECTOR.collectVariable_UNIVARIATE('items_list');
			var payload = {};
			
			payload.selects = [{'aggregation': null, 'column': 'D.Year', 'alias': 'Year'},
			                   {'aggregation': null, 'column': 'A.AreaName' + ANALYSIS.lang, 'alias': 'Country'},
			                   {'aggregation': null, 'column': 'E.ElementName' + ANALYSIS.lang, 'alias': 'Element'},
			                   {'aggregation': null, 'column': 'I.ItemName' + ANALYSIS.lang, 'alias': 'Item'},
			                   {'aggregation': null, 'column': 'D.Value', 'alias': 'Value'}];
			
			payload.froms = [{'column': 'Data', 'alias': 'D'},
			                 {'column': 'Item', 'alias': 'I'},
			                 {'column': 'Element', 'alias': 'E'},
			                 {'column': 'Area', 'alias': 'A'}];
			
			payload.wheres = [{'datatype': 'TEXT', 'column': 'D.DomainCode', 'operator': 'IN', 'value': '', 'ins': domains},
			                  {'datatype': 'TEXT', 'column': 'D.AreaCode', 'operator': 'IN', 'value': '', 'ins': countries},
			                  {'datatype': 'TEXT', 'column': 'D.ElementCode', 'operator': 'IN', 'value': '', 'ins': elements},
			                  {'datatype': 'TEXT', 'column': 'D.ItemCode', 'operator': 'IN', 'value': '', 'ins': items},
//			                  {'datatype': 'DATE', 'column': 'D.Year', 'operator': 'IN', 'value': '', 'ins': ANALYSIS_COLLECTOR.yearsArray()},
                              {'datatype': 'DATE', 'column': 'D.Year', 'operator': 'IN', 'value': '', 'ins': ANALYSIS_COLLECTOR.years()},
			                  {'datatype': 'DATE', 'column': 'D.AreaCode', 'operator': '=', 'value': 'A.AreaCode', 'ins': []},
			                  {'datatype': 'DATE', 'column': 'D.ElementCode', 'operator': '=', 'value': 'E.ElementCode', 'ins': []},
			                  {'datatype': 'DATE', 'column': 'D.ItemCode', 'operator': '=', 'value': 'I.ItemCode', 'ins': []}];
			
			payload.orderBys = [{'column': 'D.Year', 'direction': 'ASC'}];
			
			payload.limit = null;
			payload.query = null;
			payload.frequency = null;
			
			return payload;
			
		},
		
		yearsArray : function() {
			var from_year = ($('#from_year_list').jqxComboBox('getSelectedItem')).value;
			var to_year = ($('#to_year_list').jqxComboBox('getSelectedItem')).value;
			var a = new Array();
			for (var i = from_year ; i <= to_year ; i++)
				a.push(parseInt(i));
			return a;
		},

        /**
         * @author      Simone Murzilli
         * @returns     {Array}
         *
         * Get years from the slider
         */
        years: function() {
            var ins = new Array;
            var values = $('#analysis_years').rangeSlider('values');
            for(var i = values.min; i <= values.max; i++ )
                ins.push(i);
            return ins;
        },
		
		collectVariable_UNIVARIATE : function(gridCode) {
			var indexes = $('#' + gridCode).jqxGrid('getselectedrowindexes');
			var rows = $('#' + gridCode).jqxGrid('getrows');
			var buffer = new Array();
			for (var i = 0 ; i < rows.length ; i++) {
				if($.inArray(i, indexes) > -1) {
					if (gridCode == 'domains_list')
						buffer.push('\'' + rows[i].code + '\'');
					else
						buffer.push(rows[i].code);
				}
			}
			return buffer;
		}
	
	};
	
}