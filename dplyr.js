
/************************************************************
 * A data manipulation library inspired by R's dplyr
 *
 * See: 
 *  https://github.com/hadley/dplyr
 *  https://www.rstudio.com/wp-content/uploads/2015/02/data-wrangling-cheatsheet.pdf
 *
 */



// TODO:
//
// - how do we deal with undefined entries?
// - cloning / deepcopy


function dataframe (rows) {

    function DplyrException (message) {
	this.name = "DplyrException";
	this.message = message;
    }

    // convert arguments into an array
    function arr (args) {
	var result = [];
	for (var i=0; i<args.length; i++) {
	    result.push(args[i]);
	}
	return result;
    }

    function lift (arg) { 
	if (typeof arg === "function") {
	    return arg;
	}
	var fun = arg[0];
	var fields = arg.slice(1);
	return function(r) {
	    return fun.apply(null,fields.map(function(f) { return r[f]; }));
	}
    }

    
    /**************************************************
     * DATAFRAMES
     *
     * Functions rows, map, forEach, reduce, row
     * basically treat a dataframe as a javascript array
     *
     */

    // never touch the _rows() field
    // when filtering or reordering or grouping
    // everything is done by playing with the _order field
    //
    // what to do about modifications (mutate, transmute, etc)
    // maybe eventually modify lazily?
    // record the change to be made, and make it the first
    // time the data is accessed?

    function DF (rows,order) {

	// should really check that we're given array of objects

	this._rows = rows;
	if (!order) {
	    order = rows.map(function(r,i) { return i; });
	}
	this._order = order;
	this.length = order.length;
    }

    DF.prototype.rows = function () {
	var result = [];
	for (var i=0; i<this.length; i++) {
	    result.push(this._rows[this._order[i]]);
	}
	return result;
    }

    DF.prototype.map = function (f) {
	var that = this;
	return this._order.map(function(i) {
	    return f(that._rows[i]);
	});
    }
    
    DF.prototype.forEach = function (f) {
	var that = this;
	this._order.forEach(function(i,index_i) {
	    f(that._rows[i],index_i);
	});
    }
    
    DF.prototype.reduce = function (f,init) {
	var that = this;
	return this._order.reduce(function(pV,cV,cI,a) {
	    return f(pV,that._rows[cV],cI,a);
	},init);
    }
    
    DF.prototype.row = function (index) {
	return this._rows[this._order[index]];
    }
    



    /***************************************************
     * GROUPED DATAFRAMES 
     *
     * There can only be one level of grouping
     * Grouping an already grouped dataframe 
     * merges the two groupings
     *
     * Functions rows returns an array of arrays
     * 
     * Functions map, forEach, reduce treat a grouped dataframe 
     * as an array of arrays and apply their function to
     * each row in each group, preserving the grouping
     * 
     * Function groups and group treat the grouped dataframe
     * as an array of dataframes, turning each group is turned 
     * into a dataframe itself
     *
     */


    function GDF (rows,gfields,gorder) {

	this._rows = rows;
	this._group_order = gorder;
	this.length = gorder.length;
	this._group_fields = gfields;
    }


    GDF.prototype.rows = function () {
	var that = this;
	return that._group_order.map(function(g) { 
	    return g.map(function(j) {
		return that._rows[j];
	    });
	});
    }
    

    GDF.prototype.map = function (f) {
	var that = this;
	return that._group_order.map(function(g) {
		return g.map(function(i) {
			return f(that._rows[i]);
		    });
	    });
    }
    
    GDF.prototype.forEach = function (f) {
	var that = this;
	that._group_order.forEach(function(g,index_g) {
	    g.forEach(function(i,index_i) {
		return f(that._rows[i],index_g,index_i);
	    });
	});
    }
    
    GDF.prototype.reduce = function (f,init) {
	var that = this;
	return that._group_order.map(function(g) { 
		return g.reduce(function(pV,cV,cI,a) {
			return f(pV,that._rows[cV],cI,a);
		    },init);
	    });
    }

    GDF.prototype.groups = function() {
	var that = this;
	return that._group_order.map(function(g) {
	    return new DF (that._rows,g)
	});
    }

    GDF.prototype.group = function(i) {
	var that = this;
	if (i<0 || i>= that._group_order.length) {
	    return undefined;
	}
	return new DF (that._rows,that._group_order[i]);
    }


    
    /****** DPLYR FUNCTIONALITY ******/

    // to sort via multiple fields, you can sort, then group
    // then recursively sort, then ungroup

    DF.prototype.arrange = function(field,desc) {
	var that = this;
	
	var mult = 1;    // sorting direction controlled by a multiplier
	if (desc) {
	    mult = -1;
	}
	
	var result = that._order.map(function(i) { return {index:i,
							   value:that._rows[i][field]};});
	result.sort(function(a,b) { 
	    // this is fast but unstable
	    //return mult * (+(a.value > b.value) || +(a.value == b.value) - 1); 
	    return (a.value > b.value) ? mult : ((a.value < b.value) ? -mult : (2 * +(a.index > b.index))-1);
	});
	return new DF(this._rows,result.map(function(d) { return d.index; }));
    }

    GDF.prototype.arrange = function(field,desc) { 
	var that = this;
	
	var mult = 1;    // sorting direction controlled by a multiplier
	if (desc) {
	    mult = -1;
	}

	if (this._group_fields.some(function(f) { return f===field; })) { 
	    // we're sorting by a grouping field
	    // pluck out a representative from each group
	    var result = that._group_order.map(function(g,i) { return {index:i,
								       value:that._rows[g[0]][field]}; });
	    result.sort(function(a,b) { 
		// stable sort
		//return mult * (+(a.value > b.value) || +(a.value == b.value) - 1); 
		return (a.value > b.value) ? mult : ((a.value < b.value) ? -mult : (2 * +(a.index > b.index))-1);
	    });
	    return new GDF(this._rows,this._group_fields,result.map(function(d) { return that._group_order[d.index]; }));
	}

	var new_group_order = that._group_order.map(function(g) { 
	    var result = g.map(function(i) { return {index:i,
						     value:that._rows[i][field]};});
	    result.sort(function(a,b) { 
		// stable sort
		// return mult * (+(a.value > b.value) || +(a.value == b.value) - 1); 
		return (a.value > b.value) ? mult : ((a.value < b.value) ? -mult : (2 * +(a.index > b.index))-1);
	    });
	    return result.map(function(d) { return d.index; });
	});
	return new GDF(this._rows,this._group_fields,new_group_order);
    }

	
    
    DF.prototype.filter = function(f) {
	var that = this;
	var actual_f = lift(f);
	result = [];
	this._order.forEach(function(i) {
	    if (actual_f(that._rows[i])) {
		result.push(i);
	    }
	});
	return new DF(this._rows,result);
    }

    GDF.prototype.filter = function(f) {
	var that = this;
	var actual_f = lift(f);
	var result = [];
	this._group_order.map(function(g) {
	    var gresult = [];
	    g.forEach(function(i) {
		if (actual_f(that._rows[i])) {
		    gresult.push(i);
		}
	    });
	    if (gresult.length > 0) {
		result.push(gresult);
	    }
	});
	
	return new GDF(this._rows,this._group_fields,result);
    }


    var equalObj = function(current,target) {
	if (Object.keys(current).length!==Object.keys(target).length) {
	    return false;
	}
	return Object.keys(current).every(function(k) { 
	    return (current[k] === target[k]);
	});
    };

    var find = function(current,result) {
	for (var j=0; j<result.length; j++) {
	    var target = result[j];
	    if (equalObj(current,target)) {
		return true;
	    }
	}
	return false;
    };



    /* distinct */

    DF.prototype.distinct = function () {
	// use a hash as a first stab at checking equality?
	result = []
	found = []
	for (var i=0; i<this.length;i++) {
	    var current = this._rows[this._order[i]];
	    if (!(find(current,found))) {
		found.push(current);
		result.push(this._order[i]);
	    }
	}
	return new DF(this._rows,result);
    }

    GDF.prototype.distinct = function() { 
	var that = this;

	var gresult = this._group_order.map(function(g) { 
	    var result = []
	    var found = []
	    for (var i=0; i<g.length;i++) {
		var current = that._rows[g[i]];
		if (!(find(current,found))) {
		    found.push(current);
		    result.push(g[i]);
		}
	    }
	    return result;
	});
	return new GDF(this._rows,this._group_fields,gresult);
    }



    /* slice */
    
    DF.prototype.slice = function(min,max) {
	return new DF(this._rows,this._order.slice(min,max));
    }

    GDF.prototype.slice = function(min,max) { 
	var group_order = this._group_order.map(function(g) { 
	    return g.slice(min,max);
	});
	return new GDF(this._rows,this._group_fields,group_order);
    }


    /* select */

    DF.prototype.select = function() {
	var fields = arr(arguments);
	var new_r;
	return new DF(this._rows.map(function(r) { new_r = {}; fields.forEach(function(f) { new_r[f] = r[f]; }); return new_r; }),
		      this._order);
    }

    GDF.prototype.select = function() { 
	var fields = arr(arguments);
	var new_r;
	return new GDF(this._rows.map(function(r) { new_r = {}; fields.forEach(function(f) { new_r[f] = r[f]; }); return new_r; }),
		       this._group_fields,
		       this._group_order);

    }
    


    /* summarise */


    DF.prototype.summarise = function(descr) {
	var that = this;

	// gather the fields we need -- null if all 
	var requiredFieldsList = null;

	var requiredFields = function(r) {
	    return requiredFieldsList ? requiredFieldsList : Object.keys(r);
	}

	var aggregate = {};

	that._order.forEach(function(i) {
	    var r = that._rows[i];
	    requiredFields(r).forEach(function(f) {
		if (aggregate[f]) {
		    aggregate[f].push(r[f]);
		} else {
		    aggregate[f] = [r[f]];
		}
	    });
	});
	
	
	result = {};
	Object.keys(descr).forEach(function(k) {
	    var f = lift(descr[k]);
	    result[k] = f(aggregate);
	});

	return new DF([result]);
    }

    DF.prototype.summarize = DF.prototype.summarise;

    GDF.prototype.summarise = function(descr) {
	var that = this;

	// gather the fields we need -- null if all 
	var requiredFieldsList = null;

	var requiredFields = function(r) {
	    return requiredFieldsList ? requiredFieldsList : Object.keys(r);
	}

	var gaggregates = [];

	that._group_order.forEach(function(g) {
	    var aggregate = {};
	    g.forEach(function(i) {
		var r = that._rows[i];
		requiredFields(r).forEach(function(f) {
		    if (aggregate[f]) {
			aggregate[f].push(r[f]);
		    } else {
			aggregate[f] = [r[f]];
		    }
		});
	    });
	    gaggregates.push(aggregate);
	});
	
	gresults = [];
	gaggregates.forEach(function(aggregate) {
	    var result = {};
	    Object.keys(descr).forEach(function(k) {
		//console.log("Key=",k);
		var f = lift(descr[k]);
		result[k] = f(aggregate);
	    });
	    gresults.push(result);
	});

	return new GDF(gresults,this._group_fields,gresults.map(function(r,i) { return [i]; }));
    }

    GDF.prototype.summarize = GDF.prototype.summarise;


    /* mutate */

    DF.prototype.mutate = function (descr) {
	var that = this;
	
	var lifted_descr = {};
	Object.keys(descr).forEach(function(k) {
	    lifted_descr[k] = lift(descr[k]);
	});
	
	var result = [];
	var count = 0;
	var order = [];
	that._order.forEach(function(i) {
	    var r = that._rows[i];
	    var new_r = {};
	    for (k in r) {
		new_r[k] = r[k];
	    }
	    Object.keys(descr).forEach(function(k) {
		new_r[k] = lifted_descr[k](r);
	    });
	    result.push(new_r);
	    order.push(count);
	    count += 1;
	});

	return new DF(result,order);
    }
	    
    GDF.prototype.mutate = function (descr) { 
	var that = this;
	
	var lifted_descr = {};
	Object.keys(descr).forEach(function(k) {
	    lifted_descr[k] = lift(descr[k]);
	});

	var result = [];
	var group_order = [];
	var count = 0;
	that._group_order.forEach(function(g) { 
	    var order = [];
	    g.forEach(function(i) { 
		var r = that._rows[i];
		var new_r = {};
		for (k in r) {
		    new_r[k] = r[k];
		}
		Object.keys(descr).forEach(function(k) {
		    new_r[k] = lifted_descr[k](r);
		});
		result.push(new_r);
		order.push(count);
		count += 1;
	    });
	    group_order.push(order);
	});

	return new GDF(result,this._group_fields,group_order);
    }



    /* group_by */

    function make_groups (rows,order,fields) {
	var dict = {}
	var groups = [];
	var v;
	var r;
	var group;

	// go through every row
	// go through every grouping field
	// record in a nested dictionary whether we have
	//   seen the particular combination of grouping
	//   field values -- if so, record the row index
	//   in the nested dictionary -- if not, record
	//   the row index in the nested dictionary and
	//   record that we've just created a new group
	// (that last one is to make sure the order of
	//   the groups matches the original order of the
	//   first row found in each group)
	// then we construct that appropriate array of
	//   array of indices by going through the
	//   recorded groups and plucking the saved
	//   indices from the nested dictionary
	
	for (var i=0; i<order.length; i++) {
	    r = rows[order[i]];
	    d = dict;
	    // building the group valuation
	    group = [];
	    for (var j=0; j<fields.length; j++) {
		v = r[fields[j]];
		group.push(v);
		if (v in d) {
		    d = d[v];
		} else {
		    d[v] = {};
		    d = d[v];
		}
	    }
	    if ("rows" in d) {
		d.rows.push(order[i]);
	    } else {
		d.rows = [order[i]];
		groups.push(group);
	    }
	}
	var resulting_groups = [];
	for (var i = 0; i<groups.length; i++) {
	    d = dict;
	    for (j = 0; j<fields.length; j++) {
		d = d[groups[i][j]];
	    }
	    resulting_groups.push(d.rows);
	}
	return resulting_groups;
    }


    DF.prototype.group_by = function () {

	// preserve order of the values in the grouping fields
	var fields = arr(arguments);

	result = make_groups(this._rows,this._order,fields);
	
        return new GDF (this._rows,fields,result);

    }


    GDF.prototype.group_by = function () { 
	var that = this;
	var fields = arr(arguments);
	
	var group_order = [];
	this._group_order.forEach(function(g) { 
	    var groups = make_groups(that._rows,g,fields);
	    groups.forEach(function(g) { 
		group_order.push(g);
	    });
	});
	return new GDF(this._rows,
		       this._group_fields.concat(fields),
		       group_order);
    }


    /* ungroup */

    DF.prototype.ungroup = function () { 
	return this;
    }

    GDF.prototype.ungroup = function () {
	var result = [];
	this._group_order.forEach(function(g) {
	    g.forEach(function(i) {
		result.push(i);
	    });
	});
	return new DF(this._rows,result);
    } 


    DF.prototype.prototype = function () {
	return DF.prototype;
    }

    GDF.prototype.prototype = function () {
	return GDF.prototype;
    }
    
    return new DF(rows);
}




/************************************************************
 * Helper functions for summarise
 *
 */

function sum (vs) {
    return vs.reduce(function (a,b) { return a+b; },0);
}

function n (vs) {
    return vs.length;
}

function n_distinct (vs) {
    var seen = {};
    var result = 0;
    for (var i=0; i<vs.length; i++) {
	if (!(vs in seen)) {
	    seen[vs] = 1;
	    result += 1;
	}
    }
    return result;
}

function first (vs) {
    return vs[0];
}

function last (vs) {
    return vs[vs.length-1];
}

function min (vs) {
    result = vs[0];
    for (var i=0; i<vs.length; i++) {
	if (vs[i] < result) {
	    result = vs[i];
	}
    }
    return result;
}

function max (vs) {
    result = vs[0];
    for (var i=0; i<vs.length; i++) {
	if (vs[i] > result) {
	    result = vs[i];
	}
    }
    return result;
}


var DF_prototype = dataframe([]).prototype()

var GDF_prototype = dataframe([]).group_by("").prototype()


/************************************************************
 * for nodejs
 *
 */

if (exports) {
    exports.dataframe = dataframe;
    exports.DF_prototype = DF_prototype;
    exports.GDF_prototype = GDF_prototype;
}
