if (!window.WDS) {
	
	window.WDS = {
			
		/**
		 * @param payload Query parameters for WDS
		 * 
		 * This function fetch data through WDS
		 */
		getTable : function(payload, createExcel, parameter) {
			
			/** Stream the Excel through the hidden form */
            $('#datasource').val(ANALYSIS.datasource);
            $('#thousandSeparator').val(',');
            $('#decimalSeparator').val('.');
            $('#decimalNumbers').val('2');
            $('#json').val(JSON.stringify(payload));
            $('#cssFilename').val('');
            $('#valueIndex').val(null);
            document.excelForm.submit();

		},
			
		/**
		 * @param payload Parameters read from the UI
		 * @param payloads Data for the different queries
		 * @param vectors results of the previous iterations
		 * @param callback Function to call after the last iteration
		 * 
		 * Recursive function to get data vectors, one by one, 
		 * through the use of WDS
		 */
		getVectors : function(payload, payloads, vectors, parameter) {
			
			/**
			 * Convert parameters in a query suitable for WDS
			 */
			var q = WDS.payload2query(payloads[vectors.length]);
			
			/**
			 * Prepare the payload for the REST service
			 */
			var data = {};
			data.datasource = ANALYSIS.datasource;
			data.json = JSON.stringify(q);
			
			$.ajax({
				
				type : 'POST',
				url : 'http://' + ANALYSIS.baseurl + '/wds/rest/table/json',
				data : data,
				
				success : function(response) {
					
					if (response instanceof String) {
					
						/**
						 * Add current result to the others (if any)
						 */
						var vector = $.parseJSON(response);
						
						/**
						 * Stop the process if one of the vectors is empty
						 */
						if (vector.length > 0) {
						
							vectors.push(vector);
							
							/**
							 * If we have as many vectors as the queries are,
							 * start creating the script for R
							 */
							if (vectors.length == payloads.length) {
								
								ANALYSIS.createScript(payload, vectors, parameter);
								
							} 
							
							/**
							 * Otherwise iterate to fetch the remaining data
							 */
							else {
								
								WDS.getVectors(payload, payloads, vectors, parameter);
								
							}
						
						} else {
							
							alert('Your selection produced an empty result. Please try again.');
							
						}
					
					} else {
						
						/**
						 * Stop the process if one of the vectors is empty
						 */
						if (response.length > 0) {
						
							vectors.push(response);
							
							/**
							 * If we have as many vectors as the queries are,
							 * start creating the script for R
							 */
							if (vectors.length == payloads.length) {
								
								ANALYSIS.createScript(payload, vectors, parameter);
								
							} 
							
							/**
							 * Otherwise iterate to fetch the remaining data
							 */
							else {
								
								WDS.getVectors(payload, payloads, vectors, parameter);
								
							}
						
						} else {
							
							alert('Your selection produced an empty result. Please try again.');
							
						}
						
					}
					
				},
				
				error : function(err, b, c) {
					console.log(err.status + ", " + b + ", " + c);
				}
				
			});
			
		},
		
		/**
		 * @param vector As collected from the UI
		 * 
		 * This function convert a vector of parameter collected
		 * through the UI in a query suitable for WDS
		 */
		payload2query : function(p) {
			
			var q = {};
			
			q.selects = [{'aggregation': null, 'column': 'D.year', 'alias': 'Year'},
			             {'aggregation': null, 'column': 'D.value', 'alias': '\'' + p.variable_label + '\''}];
			
			q.froms = [{'column': 'Data', 'alias': 'D'}];
			
			q.wheres = [{'datatype': 'TEXT', 'column': 'D.DomainCode', 'operator': '=', 'value': p.domain, 'ins': []},
			            {'datatype': 'TEXT', 'column': 'D.AreaCode', 'operator': '=', 'value': p.country, 'ins': []},
			            {'datatype': 'TEXT', 'column': 'D.ElementCode', 'operator': '=', 'value': p.element, 'ins': []},
			            {'datatype': 'TEXT', 'column': 'D.ItemCode', 'operator': '=', 'value': p.item, 'ins': []},
			            {'datatype': 'DATE', 'column': 'D.Year', 'operator': 'IN', 'value': '', 'ins': WDS.dates2array(p)}];
			
			q.orderBys = [{'column': 'D.Year', 'direction': 'ASC'}];
			
			q.limit = null;
			q.query = null;
			q.frequency = null;
			
			return q;
			
		},
		
		dates2array : function(v) {
			var a = new Array();
			for (var i = v.from_year ; i <= v.to_year ; i++)
				a.push(parseInt(i));
			return a;
		}
		
	};
	
}