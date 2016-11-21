
# dplyrJS

A first stab at a Javascript implementation of Hadley Wickham's [dplyr
package](https://github.com/hadley/dplyr) for data manipulation in R.

Only the single table operations are implemented for now. Joins
are on the to-do list.


## Installation

All the code is contained in `dplyr.js` for simplicity. The file
exports its content using the CommonJS module specification, so it can
be used in a NodeJS project. Eventually, I'll create an NPM entry for it. 

You can also use the file directly via a line 

    <script src="dplyr.js"></script>

in your HTML file, making the content of `dplyr.js` available to the
other scripts on your page.


## Data Frames

DplyrJS's main data structure is a _data frame_. A data frame
represents a table of data, where rows in the table are data points
(experiments) and columns are variables (observations). For example,

| Name | Child Name | Age |
| --- | --- | --- | 
| Alice | Stephan | 10 |
| Bob | Terri | 7 | 
| Charlie | Ulrich | 12 |
| Alice | Vanessa | 8 | 
| Bob | William | 15 | 
| Charlie | Xavier | 18 |
| Alice | Yolanda | 3 |
| Bob | Zachary | 9 |

A data frame is created by calling `dataframe` with an array of
objects, where each object represents a row of the table and the
fields of the object represent the variable values for that
row. For the above table:

    var tbl_family = [ 
                { name: 'Alice', child_name: 'Stephan', age: 10 },
                { name: 'Bob', child_name: 'Terri', age: 7 },
                { name: 'Charlie', child_name: 'Ulrich', age: 12 },
                { name: 'Alice', child_name: 'Vanessa', age: 8 },
                { name: 'Bob', child_name: 'William', age: 15 },
                { name: 'Charlie', child_name: 'Xavier', age: 18 },
                { name: 'Alice', child_name: 'Yolanda', age: 3 },
                { name: 'Bob', child_name: 'Zachary', age: 9 } ]
              ];

    var family = dataframe(tbl);

Once a data frame has been created, it can be manipulated using the
methods below.

Most methods return a new data frame, making it possible to use method
chaining to conveniently apply a sequence of operations to a data
frame. 

### _df_ . length

Return the number of rows in the data frame.

    > family.length
    8

### _df_ . rows( )

Return the array of rows in the data frame.

    > family.rows()
    [ { name: 'Alice', child_name: 'Stephan', age: 10 },
      { name: 'Bob', child_name: 'Terri', age: 7 },
      { name: 'Charlie', child_name: 'Ulrich', age: 12 },
      { name: 'Alice', child_name: 'Vanessa', age: 8 },
      { name: 'Bob', child_name: 'William', age: 15 },
      { name: 'Charlie', child_name: 'Xavier', age: 18 },
      { name: 'Alice', child_name: 'Yolanda', age: 3 },
      { name: 'Bob', child_name: 'Zachary', age: 9 } ]


### _df_ . row( _i_ )

Return the _i_ th row in the data frame. The first row has index 0. 

    > family.row(2)
    { name: 'Charlie', child_name: 'Ulrich', age: 12 }


### _df_ . map( _f_ )

Return the array obtained by applying function _f_ to every row of the
data frame.

    > family.map(function(r) { return r.child_name; })
    [ 'Stephan',
      'Terri',
      'Ulrich',
      'Vanessa',
      'William',
      'Xavier',
      'Yolanda',
      'Zachary' ]

### _df_ . forEach( _f_ )

Call function _f_ for every row of the data frame, in order. 

    > family.forEach(function(r) { console.log(r.child_name+" is "+r.age+" years old"); })
    Stephan is 10 years old
    Terri is 7 years old
    Ulrich is 12 years old
    Vanessa is 8 years old
    William is 15 years old
    Xavier is 18 years old
    Yolanda is 3 years old
    Zachary is 9 years old

### _df_ . reduce( _f_ )
### _df_ . reduce( _f_ , _init_ )

Return the result of [reducing](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/Reduce) the rows of the data frame according to
function _f_ (and optional initial value _init_ ).

The following example computes the minimum age of the children in the
`family` data frame:

    > family.reduce(function(a,r) { return Math.min(a,r.age); },100);
    3


### _df_ . arrange( _field_ )
### _df_ . arrange( _field_ , _descending_ )

Return a new data frame with the rows of data frame _df_ sorted by
the value of field _field_, from low to high. The sorting is
stable, meaning that relative ordering of the rows with the same value
of field _field_ is preserved. If _descending_ is specified and
`true`, sorting is done from high to low.

    > family.arrange("age").rows()
    [ { name: 'Alice', child_name: 'Yolanda', age: 3 },
      { name: 'Bob', child_name: 'Terri', age: 7 },
      { name: 'Alice', child_name: 'Vanessa', age: 8 },
      { name: 'Bob', child_name: 'Zachary', age: 9 },
      { name: 'Alice', child_name: 'Stephan', age: 10 },
      { name: 'Charlie', child_name: 'Ulrich', age: 12 },
      { name: 'Bob', child_name: 'William', age: 15 },
      { name: 'Charlie', child_name: 'Xavier', age: 18 } ]

### _df_ . filter( _f_ )
### _df_ . filter( [ _f_ , _field_ , ... ] )

Return a new data frame containing only the rows of _df_ satisfying a
given property. That property can be described in two ways: as a
function _f_ taking a whole row, or as an
array [ _f_ , _field_ , ...] where _f_ is a function operating on values
and field names _field_ , ... describe the fields from which to take
the values given to _f_. Function _f_ in both cases should return a
Boolean indicating whether the row satisfies the property. 

The following examples filter the `family` data frame keeping only
the children with age at most 10, using both techniques.

    > family.filter(function(r) { return r.age >= 10; }).rows()
    [ { name: 'Alice', child_name: 'Stephan', age: 10 },
      { name: 'Charlie', child_name: 'Ulrich', age: 12 },
      { name: 'Bob', child_name: 'William', age: 15 },
      { name: 'Charlie', child_name: 'Xavier', age: 18 } ]
    
    > family.filter([function(v) { return v >= 10; },"age"]).rows()
    [ { name: 'Alice', child_name: 'Stephan', age: 10 },
      { name: 'Charlie', child_name: 'Ulrich', age: 12 },
      { name: 'Bob', child_name: 'William', age: 15 },
      { name: 'Charlie', child_name: 'Xavier', age: 18 } ]

### _df_ . distinct( )

Return a new data frame where duplicate rows in _df_ have been removed. 

### _df_ . slice( _start_ , _end_ )

Return a new data frame containing only rows of _df_ from index
_start_ to index _end_ (exclusive). The first row of _df_ has index 0.

    > family.slice(3,6).rows()
    [ { name: 'Alice', child_name: 'Vanessa', age: 8 },
      { name: 'Bob', child_name: 'William', age: 15 },
      { name: 'Charlie', child_name: 'Xavier', age: 18 } ]


### _df_ . select( _field_ , ... )

Return a new data frame where each row only has fields _field_, ... . 

    > family.select("child_name","age").rows()
    [ { child_name: 'Stephan', age: 10 },
      { child_name: 'Terri', age: 7 },
      { child_name: 'Ulrich', age: 12 },
      { child_name: 'Vanessa', age: 8 },
      { child_name: 'William', age: 15 },
      { child_name: 'Xavier', age: 18 },
      { child_name: 'Yolanda', age: 3 },
      { child_name: 'Zachary', age: 9 } ]

### _df_ . mutate( _new_fields_ )

Return a new data frame where each row of _df_ has been augmented with new
fields. The new fields are described in _new_field_ which is an object
assigning to each new field the function used to compute the value of
that new field for every row. That function can be given in two ways,
as in the [filter()](#df--filter-f-) method: as a function taking the
whole row as input, or as an array with a function taking values as
inputs, and the fields to use as inputs.

     > family.mutate({
           new_age:function(r) { return r.age * 2; },
           relationship:[function(v1,v2) { return v1 + " -> " + v2; },"name","child_name"]
         }).rows()
    [ { name: 'Alice',
        child_name: 'Stephan',
        age: 10,
        new_age: 20,
        relationship: 'Alice -> Stephan' },
      { name: 'Bob',
        child_name: 'Terri',
        age: 7,
        new_age: 14,
        relationship: 'Bob -> Terri' },
      { name: 'Charlie',
        child_name: 'Ulrich',
        age: 12,
        new_age: 24,
        relationship: 'Charlie -> Ulrich' },
      { name: 'Alice',
        child_name: 'Vanessa',
        age: 8,
        new_age: 16,
        relationship: 'Alice -> Vanessa' },
      { name: 'Bob',
        child_name: 'William',
        age: 15,
        new_age: 30,
        relationship: 'Bob -> William' },
      { name: 'Charlie',
        child_name: 'Xavier',
        age: 18,
        new_age: 36,
        relationship: 'Charlie -> Xavier' },
      { name: 'Alice',
        child_name: 'Yolanda',
        age: 3,
        new_age: 6,
        relationship: 'Alice -> Yolanda' },
      { name: 'Bob',
        child_name: 'Zachary',
        age: 9,
        new_age: 18,
        relationship: 'Bob -> Zachary' } ]


### _df_ . summarise( _new_fields_ )
### _df_ . summarize( _new_fields_ )

Return a new data frame where the rows of _df_ have been summarized
into a single row with fields described in _new_fields_. 
The _new_fields_ object gives for each new field the function used to
compute the value of that new field. That function can be described in
two ways, as in the [filter()](#dffilter-f-) method: as a function
taking the whole data set as input (it is passed an object mapping
every field of _df_ to the array of values of that field in the
dataset), or as an array with a function taking arrays of values as
inputs, and the fields to use as inputs (for field _f_, the function
will be passed the array of values of field _f_ from the dataset).

If `mean()` is a function taking an array of values and returning the
mean of those values, then the following example shows how to compute a
data frame containing the mean age of all the children in `family`:

    > family.summarize({avg_age: [mean,"age"]}).rows()
    [ { avg_age: 10.25 } ]


### _df_ . group_by( _field_ , ... )

Return a [grouped data frame](#grouped-data-frames) where the groups
are formed by the distinct values of fields _field_ , ... . Within
each group, the rows are in the same relative order as in _df_.

    > family.group_by("name").rows()
    [ [ { name: 'Alice', child_name: 'Stephan', age: 10 },
        { name: 'Alice', child_name: 'Vanessa', age: 8 },
        { name: 'Alice', child_name: 'Yolanda', age: 3 } ],
      [ { name: 'Bob', child_name: 'Terri', age: 7 },
        { name: 'Bob', child_name: 'William', age: 15 },
        { name: 'Bob', child_name: 'Zachary', age: 9 } ],
      [ { name: 'Charlie', child_name: 'Ulrich', age: 12 },
        { name: 'Charlie', child_name: 'Xavier', age: 18 } ] ]


## Grouped Data Frames

Data in a data frame can be _grouped_ via the group_by() method,
yielding a _grouped data frame_. A grouped data frame allows mostly
the same operations as a data frame, but those operations will usually
apply to the groups within a grouped data frame, preserving the
grouping structure.


### _gdf_ . length

Return the number of groups in the grouped data frame.

    > family.group_by("name").length
    3


### _gdf_ . rows()

Return the array of groups in the grouped data frame, where each group is
an array of rows.

    > family.group_by("name").rows()
    [ [ { name: 'Alice', child_name: 'Stephan', age: 10 },
        { name: 'Alice', child_name: 'Vanessa', age: 8 },
        { name: 'Alice', child_name: 'Yolanda', age: 3 } ],
      [ { name: 'Bob', child_name: 'Terri', age: 7 },
        { name: 'Bob', child_name: 'William', age: 15 },
        { name: 'Bob', child_name: 'Zachary', age: 9 } ],
      [ { name: 'Charlie', child_name: 'Ulrich', age: 12 },
        { name: 'Charlie', child_name: 'Xavier', age: 18 } ] ]

### _gdf_ . groups()

Return the array of groups in the grouped data frame, where each group
is a data frame.

    > family.group_by("name").groups().forEach(function(df,i) {
          console.log("Group",i); console.log(df.rows()); 
        });
    Group 0
    [ { name: 'Alice', child_name: 'Stephan', age: 10 },
      { name: 'Alice', child_name: 'Vanessa', age: 8 },
      { name: 'Alice', child_name: 'Yolanda', age: 3 } ]
    Group 1
    [ { name: 'Bob', child_name: 'Terri', age: 7 },
      { name: 'Bob', child_name: 'William', age: 15 },
      { name: 'Bob', child_name: 'Zachary', age: 9 } ]
    Group 2
    [ { name: 'Charlie', child_name: 'Ulrich', age: 12 },
      { name: 'Charlie', child_name: 'Xavier', age: 18 } ]


### _gdf_ . group( _i_ )

Return the _i_ th group in the grouped data frame as a data frame.

    > family.group_by("name").group(1).rows();
    [ { name: 'Bob', child_name: 'Terri', age: 7 },
      { name: 'Bob', child_name: 'William', age: 15 },
      { name: 'Bob', child_name: 'Zachary', age: 9 } ]


### _gdf_ . map( _f_ )

Return the array of arrays obtained by applying function _f_ to every
row of the grouped data frame. The group structure is
preserved.

    > family.group_by("name").map(function(r) { return r.child_name; });
    [ [ 'Stephan', 'Vanessa', 'Yolanda' ],
      [ 'Terri', 'William', 'Zachary' ],
      [ 'Ulrich', 'Xavier' ] ]

### _gdf_ . forEach( _f_ )

Call function _f_ for every row of the grouped data frame, in group order (and
in order within each group).

    > family.group_by("name").forEach(function(r) {
          console.log(r.child_name+" is "+r.age+" years old"); 
        })
    Stephan is 10 years old
    Vanessa is 8 years old
    Yolanda is 3 years old
    Terri is 7 years old
    William is 15 years old
    Zachary is 9 years old
    Ulrich is 12 years old
    Xavier is 18 years old


### _gdf_ . reduce( _f_ )
### _gdf_ . reduce( _f_ , _init_ )

Return the array resulting of
[reducing](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/Reduce)
the rows of each group of the grouped data frame according to
function _f_ (and optional initial value _init_ ). 

The following example computes the minimum age of the children in each
group:

    > family.group_by("name").reduce(function(a,r) { 
          return Math.min(a,r.age);
        },100)
    [ 3, 7, 12 ]


### _gdf_ . arrange( _field_ )
### _gdf_ . arrange( _field_ , _descending_ )

Return a new grouped data frame with the rows in each group of _gdf_ sorted by
the value of field _field_, from low to high. The group structure is
preserved. The sorting is
stable, meaning that relative ordering of the rows with the same value
of field _field_ is preserved. If _descending_ is specified and
`true`, sorting is done from high to low.

    > family.group_by("name").arrange("age").rows()
    [ [ { name: 'Alice', child_name: 'Yolanda', age: 3 },
        { name: 'Alice', child_name: 'Vanessa', age: 8 },
        { name: 'Alice', child_name: 'Stephan', age: 10 } ],
      [ { name: 'Bob', child_name: 'Terri', age: 7 },
        { name: 'Bob', child_name: 'Zachary', age: 9 },
        { name: 'Bob', child_name: 'William', age: 15 } ],
      [ { name: 'Charlie', child_name: 'Ulrich', age: 12 },
        { name: 'Charlie', child_name: 'Xavier', age: 18 } ] ]

### _gdf_ . filter( _f_ )
### _gdf_ . filter( [ _f_ , _field_ ,... ] )

Return a new grouped data frame containing only the rows of _df_ satisfying a
given property. That property can be described in two ways: as a
function _f_ taking a whole row, or as an
array [ _f_ , _field_ , ...] where _f_ is a function operating on values
and field names _field_ , ... describe the fields from which to take
the values given to _f_. Function _f_ in both cases should return a
Boolean indicating whether the row satisfies the property. 

The group structure is preserved, but empty groups are discarded.

The following examples filter the `family` data frame keeping only
the children with age at most 10, using both techniques.

    > family.group_by("name").filter(function(r) { 
          return r.age >= 10;
        }).rows()
    [ [ { name: 'Alice', child_name: 'Stephan', age: 10 } ],
      [ { name: 'Bob', child_name: 'William', age: 15 } ],
      [ { name: 'Charlie', child_name: 'Ulrich', age: 12 },
        { name: 'Charlie', child_name: 'Xavier', age: 18 } ] ]
    
    > family.group_by("name").filter([function(v) { 
          return v >= 10;
        },"age"]).rows()
    [ [ { name: 'Alice', child_name: 'Stephan', age: 10 } ],
      [ { name: 'Bob', child_name: 'William', age: 15 } ],
      [ { name: 'Charlie', child_name: 'Ulrich', age: 12 },
        { name: 'Charlie', child_name: 'Xavier', age: 18 } ] ]


### _gdf_ . distinct()

Return a new grouped data frame where duplicate rows in _gdf_ have
been removed. The group structure is preserved.


### _gdf_ . slice( _start_ , _end_ )

Return a new grouped data frame in which each group is obtained from a
group of _gdf_ by keeping only rows of that group from index
_start_ to index _end_ (exclusive) within the group. The group
structure of _gdf_ is preserved.

    > family.group_by("name").slice(1,2).rows();
    [ [ { name: 'Alice', child_name: 'Vanessa', age: 8 } ],
      [ { name: 'Bob', child_name: 'William', age: 15 } ],
      [ { name: 'Charlie', child_name: 'Xavier', age: 18 } ] ]


### _gdf_ . select( _field_ , ... )

Return a new grouped data frame where each row only has fields
_field_, ... . The group structure is preserved.

    > family.group_by("name").select("child_name","age").rows();
    [ [ { child_name: 'Stephan', age: 10 },
        { child_name: 'Vanessa', age: 8 },
        { child_name: 'Yolanda', age: 3 } ],
      [ { child_name: 'Terri', age: 7 },
        { child_name: 'William', age: 15 },
        { child_name: 'Zachary', age: 9 } ],
      [ { child_name: 'Ulrich', age: 12 },
        { child_name: 'Xavier', age: 18 } ] ]


### _gdf_ . mutate( _new_fields_ )

Return a new grouped data frame where each row of _gdf_ has been augmented with new
fields. The group structure structure is preserved. The new fields are described in _new_field_ which is an object
assigning to each new field the function used to compute the value of
that new field for every row. That function can be given in two ways,
as in the [filter()](#gdf--filter-f-) method: as a function taking the
whole row as input, or as an array with a function taking values as
inputs, and the fields to use as inputs.

    > family.group_by("name").mutate({
          new_age:[function(v) { return v*2; },"age"]
        }).rows()
    [ [ { name: 'Alice', child_name: 'Stephan', age: 10, new_age: 20 },
        { name: 'Alice', child_name: 'Vanessa', age: 8, new_age: 16 },
        { name: 'Alice', child_name: 'Yolanda', age: 3, new_age: 6 } ],
      [ { name: 'Bob', child_name: 'Terri', age: 7, new_age: 14 },
        { name: 'Bob', child_name: 'William', age: 15, new_age: 30 },
        { name: 'Bob', child_name: 'Zachary', age: 9, new_age: 18 } ],
      [ { name: 'Charlie', child_name: 'Ulrich', age: 12, new_age: 24 },
        { name: 'Charlie', child_name: 'Xavier', age: 18, new_age: 36 } ] ]
    

### _gdf_ . summarize( _new_fields_ )
### _gdf_ . summarise( _new_fields_ )

Return a new grouped data frame where each group of _gdf_ has been summarized
into a single row with fields described in _new_fields_. 
The _new_fields_ object gives for each new field the function used to
compute the value of that new field. That function can be described in
two ways, as in the [filter()](#gdf--filter-f-) method: as a function
taking the group as input (it is passed an object mapping
every field of _gdf_ to the array of values of that field in the
group), or as an array with a function taking arrays of values as 
inputs, and the fields to use as inputs (for field _f_, the function
will be passed the array of values of field _f_ from the group).

If `mean()` is a function taking an array of values and returning the
mean of those values, then the following example shows how to compute a
data frame containing the mean age of children in a grouped `family`:

    > family.group_by("name").summarize({avg_age: [mean,"age"]}).rows()
    [ [ { avg_age: 7 } ],
      [ { avg_age: 10.333333333333334 } ],
      [ { avg_age: 15 } ] ]


### _gdf_ . group_by( _field_ , ... )

Return a grouped data frame where every group of _gdf_ has been futher
grouped by the distinct values of _field_ , ... . 

    > family.group_by("name").group_by("child_name").rows()
    [ [ { name: 'Alice', child_name: 'Stephan', age: 10 } ],
      [ { name: 'Alice', child_name: 'Vanessa', age: 8 } ],
      [ { name: 'Alice', child_name: 'Yolanda', age: 3 } ],
      [ { name: 'Bob', child_name: 'Terri', age: 7 } ],
      [ { name: 'Bob', child_name: 'William', age: 15 } ],
      [ { name: 'Bob', child_name: 'Zachary', age: 9 } ],
      [ { name: 'Charlie', child_name: 'Ulrich', age: 12 } ],
      [ { name: 'Charlie', child_name: 'Xavier', age: 18 } ] ]


### _gdf_ . ungroup()

Return a new data frame where the grouping of _gdf_ has been
removed. The relative order of the rows in the new data frame is
preserved from _gdf_.

    > family.group_by("name").ungroup().rows()
    [ { name: 'Alice', child_name: 'Stephan', age: 10 },
      { name: 'Alice', child_name: 'Vanessa', age: 8 },
      { name: 'Alice', child_name: 'Yolanda', age: 3 },
      { name: 'Bob', child_name: 'Terri', age: 7 },
      { name: 'Bob', child_name: 'William', age: 15 },
      { name: 'Bob', child_name: 'Zachary', age: 9 },
      { name: 'Charlie', child_name: 'Ulrich', age: 12 },
      { name: 'Charlie', child_name: 'Xavier', age: 18 } ]


