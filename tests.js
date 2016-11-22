
/************************************************************ 
 * testing
 *
 * Run 'node tests.js' to run the test suite
 *
 */
 

var d = require("./dplyr.js");

function test () {

    var data = [
	{a:1, b:1, c:"Alpha"},
	{a:1, b:2, c:"Bravo"},
	{a:1, b:3, c:"Charlie"},
	{a:2, b:1, c:"Delta"},
	{a:2, b:2, c:"Echo"},
	{a:2, b:3, c:"Foxtrot"},
	{a:3, b:1, c:"Golf"},
	{a:3, b:2, c:"Hotel"},
	{a:3, b:3, c:"India"},
	{a:1, b:1, c:"Juliet"},
	{a:1, b:2, c:"Kilo"},
	{a:1, b:3, c:"Lima"},
	{a:2, b:1, c:"Mike"},
	{a:2, b:2, c:"November"},
	{a:2, b:3, c:"Oscar"},
	{a:3, b:1, c:"Papa"},
	{a:3, b:2, c:"Quebec"},
	{a:3, b:3, c:"Romeo"},
	{a:1, b:1, c:"Sierra"},
	{a:1, b:2, c:"Tango"},
	{a:1, b:3, c:"Uniform"},
	{a:2, b:1, c:"Victor"},
	{a:2, b:2, c:"Whiskey"},
	{a:2, b:3, c:"X-ray"},
	{a:3, b:1, c:"Yankee"},
	{a:3, b:2, c:"Zulu"}
    ];

    var eq_obj = function(ob1,ob2) {
	if (!ob1 || !ob2) {
	    return false;
	}
	if (Object.keys(ob1).length !== Object.keys(ob2).length) {
	    return false;
	}
	return Object.keys(ob1).every(function(k) { 
	    return (ob1[k] === ob2[k]);
	});
    }
		
    var eq_arr = function(ar1,ar2) { 
	if (ar1.length !== ar2.length) { 
	    return false;
	}
	return ar1.every(function(ob1,i) {
	    return eq_obj(ob1,ar2[i]);
	});
    }

    var eq_arr_arr = function(arar1,arar2) {
	if (arar1.length !== arar2.length) { 
	    return false;
	}
	return arar1.every(function(ar1,i) {
	    return eq_arr(ar1,arar2[i]);
	});
    }

    var test_df = function(name,f,exp) {
	var res = f();
	if (eq_arr(res,exp)) {
	    console.log("Test",name,": ok");
	} else {
	    console.log("Test",name,": FAILED");
	    console.log("Result:  ");
	    console.log(res);
	    console.log("Expected:");
	    console.log(exp);
	}
    }

    var test_gdf = function(name,f,exp) {
	var res = f();
	if (eq_arr_arr(res,exp)) {
	    console.log("Test",name,": ok");
	} else {
	    console.log("Test",name,": FAILED");
	    console.log("Result:  ");
	    console.log(res);
	    console.log("Expected:");
	    console.log(exp);
	}
    }
	    

    test_df("DF rows()",
	    function() { 
		var df = d.dataframe(data.slice(0,4));
		return df.rows();
	    },
	    [{a:1,b:1,c:"Alpha"},
	     {a:1, b:2, c:"Bravo"},
	     {a:1, b:3, c:"Charlie"},
	     {a:2, b:1, c:"Delta"}]);

    test_df("DF row()",
	    function() { 
		var df = d.dataframe(data.slice(0,4));
		return [df.row(2)];
	    },
	    [{a:1,b:3,c:"Charlie"}]);

    test_df("DF map()",
	    function() { 
		var df = d.dataframe(data.slice(0,4));
		return df.map(function(r) { return {x:r.c};});
	    },
	    [{x:"Alpha"},{x:"Bravo"},{x:"Charlie"},{x:"Delta"}]);

    test_df("DF forEach()",
	    function() { 
		var df = d.dataframe(data.slice(0,4));
		var result = [];
		df.forEach(function(r) { result.push({x:r.c}); });
		return result;
	    },
	    [{x:"Alpha"},{x:"Bravo"},{x:"Charlie"},{x:"Delta"}]);

    test_df("DF reduce()",
	    function() { 
		var df = d.dataframe(data.slice(0,4));
		return df.reduce(function(a,r) { 
		    return a.concat([{x:r.c}]); 
		},[]);
	    },
	    [{x:"Alpha"},{x:"Bravo"},{x:"Charlie"},{x:"Delta"}]);

    test_df("DF arrange()",
	    function() { 
		var df = d.dataframe(data.slice(0,5))
		return df.arrange("b").rows();
	    },
	    [{a:1, b:1, c:"Alpha"},
             {a:2, b:1, c:"Delta"},
	     {a:1, b:2, c:"Bravo"},
	     {a:2, b:2, c:"Echo"},
	     {a:1, b:3, c:"Charlie"}]);
	    
    test_df("DF arrange() descending",
	    function() { 
		var df = d.dataframe(data.slice(0,5));
		return df.arrange("b",true).rows();
	    },
	    [{a:1, b:3, c:"Charlie"},
	     {a:1, b:2, c:"Bravo"},
	     {a:2, b:2, c:"Echo"},
	     {a:1, b:1, c:"Alpha"},
	     {a:2, b:1, c:"Delta"}]);

    test_df("DF filter() row function",
	    function() { 
		var df = d.dataframe(data);
		return df.filter(function(r) { return r.b===2; }).rows();
	    },
	    [
		{a:1, b:2, c:"Bravo"},
		{a:2, b:2, c:"Echo"},
		{a:3, b:2, c:"Hotel"},
		{a:1, b:2, c:"Kilo"},
		{a:2, b:2, c:"November"},
		{a:3, b:2, c:"Quebec"},
		{a:1, b:2, c:"Tango"},
		{a:2, b:2, c:"Whiskey"},
		{a:3, b:2, c:"Zulu"}
	    ]);

    test_df("DF filter() value function",
	    function() { 
		var df = d.dataframe(data);
		return df.filter([function(v) { return v===2; },"b"]).rows();
	    },
	    [
		{a:1, b:2, c:"Bravo"},
		{a:2, b:2, c:"Echo"},
		{a:3, b:2, c:"Hotel"},
		{a:1, b:2, c:"Kilo"},
		{a:2, b:2, c:"November"},
		{a:3, b:2, c:"Quebec"},
		{a:1, b:2, c:"Tango"},
		{a:2, b:2, c:"Whiskey"},
		{a:3, b:2, c:"Zulu"}
	    ]);

    test_df("DF distinct()",
	    function() { 
		var df = d.dataframe(data.slice(0,4).concat(data.slice(0,4)));
		return df.distinct().rows();
	    },
	    [{a:1, b:1,c:"Alpha"},
	     {a:1, b:2, c:"Bravo"},
	     {a:1, b:3, c:"Charlie"},
	     {a:2, b:1, c:"Delta"}]);

    test_df("DF slice()",
	    function() { 
		var df = d.dataframe(data);
		return df.slice(3,6).rows();
	    },
	    [{a:2, b:1, c:"Delta"},
	     {a:2, b:2, c:"Echo"},
	     {a:2, b:3, c:"Foxtrot"}]);

    test_df("DF select()",
	    function() { 
		var df = d.dataframe(data.slice(0,4));
		return df.select("a","c").rows();
	    },
	    [{a:1, c:"Alpha"},
	     {a:1, c:"Bravo"},
	     {a:1, c:"Charlie"},
	     {a:2, c:"Delta"}]);
	    
    test_df("DF summarize() row function",
	    function() { 
		var sum = function(vs) { return vs.reduce(function(a,b) { return a+b; },0); }
		var df = d.dataframe(data.slice(0,4));
		return df.summarize({"sum_a":function(R) { return sum(R.a); }}).rows();
	    },
	    [ {sum_a: 5} ]);

    test_df("DF summarize() value function",
	    function() { 
		var sum = function(vs) { return vs.reduce(function(a,b) { return a+b; },0); }
		var df = d.dataframe(data.slice(0,4));
		return df.summarize({"sum_a":[sum,"a"]}).rows();
	    },
	    [ {sum_a: 5} ]);

    test_df("DF summarize() multiple",
	    function() { 
		var sum = function(vs) { return vs.reduce(function(a,b) { return a+b; },0); }
		var df = d.dataframe(data.slice(0,4));
		return df.summarize({"sum_a":[sum,"a"],"sum_b":[sum,"b"]}).rows();
	    },
	    [ {sum_a: 5, sum_b: 7 } ]);

    test_df("DF mutate() row function",
	    function() {
		var df = d.dataframe(data.slice(0,4));
		return df.mutate({"a+b":function(r) { return r.a+r.b; }}).rows();
	    },
	    [{a:1, b:1,c:"Alpha","a+b":2},
	     {a:1, b:2, c:"Bravo","a+b":3},
	     {a:1, b:3, c:"Charlie","a+b":4},
	     {a:2, b:1, c:"Delta","a+b":3}]);
	    
    test_df("DF mutate() value function",
	    function() {
		var df = d.dataframe(data.slice(0,4));
		return df.mutate({"a+b":[function(v1,v2) { return v1+v2 },"a","b"]}).rows();
	    },
	    [{a:1, b:1,c:"Alpha","a+b":2},
	     {a:1, b:2, c:"Bravo","a+b":3},
	     {a:1, b:3, c:"Charlie","a+b":4},
	     {a:2, b:1, c:"Delta","a+b":3}]);
		
    test_df("DF mutate() multiple ",
	    function() {
		var df = d.dataframe(data.slice(0,4));
		return df.mutate({"a+b":[function(v1,v2) { return v1+v2 },"a","b"],
				  "new_c":[function(v) { return "*"+v+"*"; },"c"]}).rows();
	    },
	    [{a:1, b:1,c:"Alpha","a+b":2,new_c:"*Alpha*"},
	     {a:1, b:2, c:"Bravo","a+b":3,new_c:"*Bravo*"},
	     {a:1, b:3, c:"Charlie","a+b":4,new_c:"*Charlie*"},
	     {a:2, b:1, c:"Delta","a+b":3,new_c:"*Delta*"}]);

    test_gdf("DF group_by()",
	     function() { 
		 var df = d.dataframe(data.slice(0,7));
		 return df.group_by("b").rows();
	     },
	     [ [{a:1, b:1, c:"Alpha"},
		{a:2, b:1, c:"Delta"},
		{a:3, b:1, c:"Golf"}],
	       [{a:1, b:2, c:"Bravo"},
		{a:2, b:2, c:"Echo"}],
	       [{a:1, b:3, c:"Charlie"},
		{a:2, b:3, c:"Foxtrot"}]]);
	    
    test_gdf("DF group_by() multiple",
	     function() { 
		 var df = d.dataframe(data.slice(0,7));
		 return df.group_by("b","a").rows();
	     },
	     [ [{a:1, b:1, c:"Alpha"}],
	       [{a:1, b:2, c:"Bravo"}],
	       [{a:1, b:3, c:"Charlie"}],
	       [{a:2, b:1, c:"Delta"}],
	       [{a:2, b:2, c:"Echo"}],
	       [{a:2, b:3, c:"Foxtrot"}],
	       [{a:3, b:1, c:"Golf"}]]);

    test_gdf("DF group_by() nothing",
	     function() { 
		 var df = d.dataframe(data.slice(0,7));
		 return df.group_by().rows();
	     },
	     [ [ {a:1, b:1, c:"Alpha"},
		 {a:1, b:2, c:"Bravo"},
		 {a:1, b:3, c:"Charlie"},
		 {a:2, b:1, c:"Delta"},
		 {a:2, b:2, c:"Echo"},
		 {a:2, b:3, c:"Foxtrot"},
		 {a:3, b:1, c:"Golf"}]]);

    test_df("DF ungroup()",
	    function() { 
		var df = d.dataframe(data.slice(0,4));
		return df.ungroup().rows();
	    },
	    [{a:1, b:1,c:"Alpha"},
	     {a:1, b:2, c:"Bravo"},
	     {a:1, b:3, c:"Charlie"},
	     {a:2, b:1, c:"Delta"}]);

    test_gdf("GDF rows()",
	     function() {
		 var gdf = d.dataframe(data.slice(0,6)).group_by("b");
		 return gdf.rows();
	     },
	     [ [{a:1, b:1, c:"Alpha"},
		{a:2, b:1, c:"Delta"}],
	       [{a:1, b:2, c:"Bravo"},
		{a:2, b:2, c:"Echo"}],
	       [{a:1, b:3, c:"Charlie"},
		{a:2, b:3, c:"Foxtrot"}]]);

    test_gdf("GDF groups()",
	     function() { 
		 var gdf = d.dataframe(data.slice(0,6)).group_by("b");
		 return gdf.groups().map(function(df) { return df.rows(); });
	     },
	     [ [{a:1, b:1, c:"Alpha"},
		{a:2, b:1, c:"Delta"}],
	       [{a:1, b:2, c:"Bravo"},
		{a:2, b:2, c:"Echo"}],
	       [{a:1, b:3, c:"Charlie"},
		{a:2, b:3, c:"Foxtrot"}]]);

    test_df("GDF group()",
	     function() { 
		 var gdf = d.dataframe(data.slice(0,6)).group_by("b");
		 return gdf.group(1).rows();
	     },
	     [ {a:1, b:2, c:"Bravo"},
	       {a:2, b:2, c:"Echo"}]);
		 
    test_gdf("GDF map()",
	     function() { 
		 var gdf = d.dataframe(data.slice(0,6)).group_by("b");
		 return gdf.map(function(r) { return {x:r.c};});
	     },
	     [[{x:"Alpha"},{x:"Delta"}],
	      [{x:"Bravo"},{x:"Echo"}],
	      [{x:"Charlie"},{x:"Foxtrot"}]]);

    test_df("GDF forEach()",
	    function() { 
		var gdf = d.dataframe(data.slice(0,6)).group_by("b");
		var result = [];
		gdf.forEach(function(r) { result.push({x:r.c}); });
		return result;
	    },
	    [{x:"Alpha"},{x:"Delta"},{x:"Bravo"},{x:"Echo"},{x:"Charlie"},
	     {x:"Foxtrot"}]);

    test_gdf("GDF reduce()",
	    function() { 
		var gdf = d.dataframe(data.slice(0,6)).group_by("b");
		return gdf.reduce(function(a,r) { 
		    return a.concat([{x:r.c}]); 
		},[]);
	    },
	     [[{x:"Alpha"},{x:"Delta"}],
	      [{x:"Bravo"},{x:"Echo"}],
	      [{x:"Charlie"},{x:"Foxtrot"}]]);

    test_gdf("GDF arrange() grouped field",
	     function() { 
		 var gdf = d.dataframe(data.slice(0,6)).group_by("b");
		 return gdf.arrange("b").rows();
	     },
	     [[{a:1, b:1, c:"Alpha"},
               {a:2, b:1, c:"Delta"}],
	      [{a:1, b:2, c:"Bravo"},
	       {a:2, b:2, c:"Echo"}],
	      [{a:1, b:3, c:"Charlie"},
	       {a:2, b:3, c:"Foxtrot"}]]);
	     
    test_gdf("GDF arrange() grouped field descending",
	    function() { 
		var gdf = d.dataframe(data.slice(0,6)).group_by("b");
		return gdf.arrange("b",true).rows();
	    },
	    [[{a:1, b:3, c:"Charlie"},
	      {a:2, b:3, c:"Foxtrot"}],
	     [{a:1, b:2, c:"Bravo"},
	      {a:2, b:2, c:"Echo"}],
	     [{a:1, b:1, c:"Alpha"},
              {a:2, b:1, c:"Delta"}]]);
	     
    test_gdf("GDF arrange() non grouped field",
	     function() { 
		 var gdf = d.dataframe(data.slice(0,6)).group_by("b");
		 return gdf.arrange("a").rows();
	     },
	     [[{a:1, b:1, c:"Alpha"},
               {a:2, b:1, c:"Delta"}],
	      [{a:1, b:2, c:"Bravo"},
	       {a:2, b:2, c:"Echo"}],
	      [{a:1, b:3, c:"Charlie"},
	       {a:2, b:3, c:"Foxtrot"}]]);
	     
    test_gdf("GDF arrange() non-grouped field descending",
	    function() { 
		var gdf = d.dataframe(data.slice(0,6)).group_by("b");
		return gdf.arrange("a",true).rows();
	    },
             [[{a:2, b:1, c:"Delta"},
	       {a:1, b:1, c:"Alpha"}],
	      [{a:2, b:2, c:"Echo"},
	       {a:1, b:2, c:"Bravo"}],
	      [{a:2, b:3, c:"Foxtrot"},
	       {a:1, b:3, c:"Charlie"}]]);

    test_gdf("GDF filter() row function",
	    function() { 
		var gdf = d.dataframe(data.slice(0,6)).group_by("b");
		return gdf.filter(function(r) { return r.a===2; }).rows();
	    },
	     [[{a:2, b:1, c:"Delta"}],
	      [{a:2, b:2, c:"Echo"}],
	      [{a:2, b:3, c:"Foxtrot"}]]);

    test_gdf("GDF filter() value function",
	    function() { 
		var gdf = d.dataframe(data.slice(0,6)).group_by("b");
		return gdf.filter([function(v) { return v===2; },"a"]).rows();
	    },
	     [[{a:2, b:1, c:"Delta"}],
	      [{a:2, b:2, c:"Echo"}],
	      [{a:2, b:3, c:"Foxtrot"}]]);

    test_gdf("GDF filter() empty",
	    function() { 
		var gdf = d.dataframe(data.slice(0,6)).group_by("b");
		return gdf.filter(function(r) { return r.b===2; }).rows();
	    },
	     [[{a:1, b:2, c:"Bravo"},
	       {a:2, b:2, c:"Echo"}]]);


    test_gdf("GDF distinct()",
	    function() { 
		var gdf = d.dataframe(data.slice(0,4).concat(data.slice(0,4)))
		    .group_by("b");
		return gdf.distinct().rows();
	    },
	    [[{a:1, b:1,c:"Alpha"},
	      {a:2, b:1, c:"Delta"}],
	     [{a:1, b:2, c:"Bravo"}],
	     [{a:1, b:3, c:"Charlie"}]]);

    test_gdf("GDF slice()",
	     function() { 
		 var gdf = d.dataframe(data.slice(0,9)).group_by("b");
		 return gdf.slice(1,3).rows();
	    },
	     [[{a:2, b:1, c:"Delta"},
	       {a:3, b:1, c:"Golf"}],
	      [{a:2, b:2, c:"Echo"},
	       {a:3, b:2, c:"Hotel"}],
	      [{a:2, b:3, c:"Foxtrot"},
	       {a:3, b:3, c:"India"}]]);

    test_gdf("GDF select()",
	    function() { 
		var gdf = d.dataframe(data.slice(0,6)).group_by("b");
		return gdf.select("a","c").rows();
	    },
	    [[{a:1, c:"Alpha"},
	      {a:2, c:"Delta"}],
	     [{a:1, c:"Bravo"},
	      {a:2, c:"Echo"}],
	     [{a:1, c:"Charlie"},
	      {a:2, c:"Foxtrot"}]]);

    test_gdf("GDF summarize() row function",
	    function() { 
		var sum = function(vs) { return vs.reduce(function(a,b) { return a+b; },0); }
		var gdf = d.dataframe(data.slice(0,6)).group_by("b");
		return gdf.summarize({"sum_a":function(R) { return sum(R.a); }}).rows();
	    },
	     [ [{sum_a: 3}],
	       [{sum_a: 3}],
	       [{sum_a: 3}]]);

    test_gdf("GDF summarize() value function",
	    function() { 
		var sum = function(vs) { return vs.reduce(function(a,b) { return a+b; },0); }
		var gdf = d.dataframe(data.slice(0,6)).group_by("b");
		return gdf.summarize({"sum_a":[sum,"a"]}).rows();
	    },
	     [ [{sum_a: 3}],
	       [{sum_a: 3}],
	       [{sum_a: 3}]]);

    test_gdf("GDF summarize() multiple",
	     function() { 
		 var sum = function(vs) { return vs.reduce(function(a,b) { return a+b; },0); }
		 var gdf = d.dataframe(data.slice(0,6)).group_by("b");
		 return gdf.summarize({"sum_a":[sum,"a"],
				       "sum_b":[sum,"b"]}).rows();
	    },
	     [ [{sum_a: 3, sum_b: 2}],
	       [{sum_a: 3, sum_b: 4}],
	       [{sum_a: 3, sum_b: 6}]]);

    test_gdf("GDF mutate() row function",
	     function() {
		 var gdf = d.dataframe(data.slice(0,6)).group_by("b");
		 return gdf.mutate({"a+b":function(r) { return r.a+r.b; }}).rows();
	    },
	     [[{a:1, b:1, c:"Alpha","a+b":2},
	       {a:2, b:1, c:"Delta","a+b":3}],
	      [{a:1, b:2, c:"Bravo","a+b":3},
	       {a:2, b:2, c:"Echo","a+b":4}],
	      [{a:1, b:3, c:"Charlie","a+b":4},
	       {a:2, b:3, c:"Foxtrot","a+b":5}]]);


    test_gdf("GDF mutate() value function",
	    function() {
		var gdf = d.dataframe(data.slice(0,6)).group_by("b");
		return gdf.mutate({"a+b":[function(v1,v2) { return v1+v2 },"a","b"]}).rows();
	    },
	     [[{a:1, b:1, c:"Alpha","a+b":2},
	       {a:2, b:1, c:"Delta","a+b":3}],
	      [{a:1, b:2, c:"Bravo","a+b":3},
	       {a:2, b:2, c:"Echo","a+b":4}],
	      [{a:1, b:3, c:"Charlie","a+b":4},
	       {a:2, b:3, c:"Foxtrot","a+b":5}]]);

    test_gdf("GDF mutate() multiple ",
	     function() {
		 var gdf = d.dataframe(data.slice(0,6)).group_by("b");
		 return gdf.mutate({"a+b":[function(v1,v2) { return v1+v2 },"a","b"],
				    "new_c":[function(v) { return "*"+v+"*"; },"c"]}).rows();
	    },
	     [[{a:1, b:1, c:"Alpha","a+b":2,"new_c":"*Alpha*"},
	       {a:2, b:1, c:"Delta","a+b":3,"new_c":"*Delta*"}],
	      [{a:1, b:2, c:"Bravo","a+b":3,"new_c":"*Bravo*"},
	       {a:2, b:2, c:"Echo","a+b":4,"new_c":"*Echo*"}],
	      [{a:1, b:3, c:"Charlie","a+b":4,"new_c":"*Charlie*"},
	       {a:2, b:3, c:"Foxtrot","a+b":5,"new_c":"*Foxtrot*"}]]);

    test_gdf("GDF group_by()",
	     function() { 
		 var gdf = d.dataframe(data.slice(0,6)).group_by("b");
		 return gdf.group_by("a").rows();
	     },
	     [ [{a:1, b:1, c:"Alpha"}],
	       [{a:2, b:1, c:"Delta"}],
	       [{a:1, b:2, c:"Bravo"}],
	       [{a:2, b:2, c:"Echo"}],
	       [{a:1, b:3, c:"Charlie"}],
	       [{a:2, b:3, c:"Foxtrot"}]]);
	    
    test_gdf("GDF group_by() nothing",
	     function() { 
		 var gdf = d.dataframe(data.slice(0,6)).group_by("b");
		 return gdf.group_by().rows();
	     },
	     [[{a:1, b:1, c:"Alpha"},
	       {a:2, b:1, c:"Delta"}],
	      [{a:1, b:2, c:"Bravo"},
	       {a:2, b:2, c:"Echo"}],
	      [{a:1, b:3, c:"Charlie"},
	       {a:2, b:3, c:"Foxtrot"}]]);

    test_df("GDF ungroup()",
	    function() { 
		var gdf = d.dataframe(data.slice(0,6)).group_by("b");
		return gdf.ungroup().rows();
	    },
	    [{a:1, b:1, c:"Alpha"},
	     {a:2, b:1, c:"Delta"},
	     {a:1, b:2, c:"Bravo"},
	     {a:2, b:2, c:"Echo"},
	     {a:1, b:3, c:"Charlie"},
	     {a:2, b:3, c:"Foxtrot"}]);


    /* new operations */

    test_df("DF mutate_window() row function",
	    function() { 
		var rev = function(vs) { return vs.map(function(x) { return x;}).reverse(); };
		var df = d.dataframe(data.slice(0,4));
		return df.mutate_window({"rev_c":function(R) { return rev(R.c); }}).rows();
	    },
	    [{a:1, b:1,c:"Alpha",rev_c:"Delta"},
	     {a:1, b:2, c:"Bravo",rev_c:"Charlie"},
	     {a:1, b:3, c:"Charlie",rev_c:"Bravo"},
	     {a:2, b:1, c:"Delta",rev_c:"Alpha"}]);

    test_df("DF mutate_window() value function",
	    function() { 
		var rev = function(vs) { return vs.map(function(x) { return x;}).reverse(); };
		var df = d.dataframe(data.slice(0,4));
		return df.mutate_window({"rev_c":[rev,"c"]})
		    .rows();
	    },
	    [{a:1, b:1,c:"Alpha",rev_c:"Delta"},
	     {a:1, b:2, c:"Bravo",rev_c:"Charlie"},
	     {a:1, b:3, c:"Charlie",rev_c:"Bravo"},
	     {a:2, b:1, c:"Delta",rev_c:"Alpha"}]);

    test_df("DF mutate_window() multiple",
	    function() { 
		var rev = function(vs) { return vs.map(function(x) { return x;}).reverse(); };
		var df = d.dataframe(data.slice(0,4));
		return df.mutate_window({
                          "rev_c":[rev,"c"],
      		          "first_b":[function(vs) { 
			                return vs.map(function(v) { return vs[0]; }); 
		                     },"b"]
		        })
		    .rows();
	    },
	    [{a:1, b:1,c:"Alpha",rev_c:"Delta",first_b:1},
	     {a:1, b:2, c:"Bravo",rev_c:"Charlie",first_b:1},
	     {a:1, b:3, c:"Charlie",rev_c:"Bravo",first_b:1},
	     {a:2, b:1, c:"Delta",rev_c:"Alpha",first_b:1}]);

    test_gdf("GDF mutate_window() row function",
	     function() {
		 var rev = function(vs) { return vs.map(function(x) { return x;}).reverse(); };
		 var gdf = d.dataframe(data.slice(0,6)).group_by("b");
		 return gdf.mutate_window({"rev_c":function(R) { return rev(R.c); }}).rows();
	    },
	     [[{a:1, b:1, c:"Alpha", rev_c:"Delta"},
	       {a:2, b:1, c:"Delta", rev_c:"Alpha"}],
	      [{a:1, b:2, c:"Bravo", rev_c:"Echo"},
	       {a:2, b:2, c:"Echo", rev_c:"Bravo"}],
	      [{a:1, b:3, c:"Charlie", rev_c:"Foxtrot"},
	       {a:2, b:3, c:"Foxtrot", rev_c:"Charlie"}]]);


    test_gdf("GDF mutate() value function",
	    function() {
		var rev = function(vs) { return vs.map(function(x) { return x;}).reverse(); };
		var gdf = d.dataframe(data.slice(0,6)).group_by("b");
		return gdf.mutate_window({"rev_c":[rev,"c"]}).rows();
	    },
	     [[{a:1, b:1, c:"Alpha", rev_c:"Delta"},
	       {a:2, b:1, c:"Delta", rev_c:"Alpha"}],
	      [{a:1, b:2, c:"Bravo", rev_c:"Echo"},
	       {a:2, b:2, c:"Echo", rev_c:"Bravo"}],
	      [{a:1, b:3, c:"Charlie", rev_c:"Foxtrot"},
	       {a:2, b:3, c:"Foxtrot", rev_c:"Charlie"}]]);

    test_gdf("GDF mutate() multiple ",
	     function() {
		 var rev = function(vs) { return vs.map(function(x) { return x;}).reverse(); };
		 var gdf = d.dataframe(data.slice(0,6)).group_by("b");
		 return gdf.mutate_window({
                          "rev_c":[rev,"c"],
      		          "first_c":[function(vs) { 
			                return vs.map(function(v) { return vs[0]; }); 
		                     },"c"]
                 }).rows();
	     },
	     [[{a:1, b:1, c:"Alpha", rev_c:"Delta", first_c:"Alpha"},
	       {a:2, b:1, c:"Delta", rev_c:"Alpha", first_c:"Alpha"}],
	      [{a:1, b:2, c:"Bravo", rev_c:"Echo", first_c:"Bravo"},
	       {a:2, b:2, c:"Echo", rev_c:"Bravo", first_c:"Bravo"}],
	      [{a:1, b:3, c:"Charlie", rev_c:"Foxtrot", first_c:"Charlie"},
	       {a:2, b:3, c:"Foxtrot", rev_c:"Charlie", first_c:"Charlie"}]]);

}

test();

