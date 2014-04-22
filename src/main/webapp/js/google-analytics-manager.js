if (!window.ANALYSIS_STATS) {
	
	window.ANALYSIS_STATS = {
		
		track : function(category, action, label) {
			_gaq.push(['_trackEvent', category, action, label]);
		},
		
		showResults : function(functionName) {
			ANALYSIS_STATS.track('ANALYSIS', 'Show Results', functionName);
		},
		
		exportData : function(functionName) {
			ANALYSIS_STATS.track('ANALYSIS', 'Export Data', functionName);
		},
		
		exportResults : function(functionName) {
			ANALYSIS_STATS.track('ANALYSIS', 'Export Results', functionName);
		}
	
	};
	
}