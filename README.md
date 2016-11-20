
# dplyrJS

A first stab at a Javascript implementation of Hadley Wickham's [dplyr
package](https://github.com/hadley/dplyr) for data manipulation in R.

Right now, only the single table operations are implementated. Joins
are on the to-do list.


## Installation

All the code is contained in `dplyr.js` for simplicity. The file
exports its content using the CommonJS module specification, so it can
be used in a NodeJS project. Eventually, I'll create an npm entry for it. 

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
                { name: 'Alice', kid_name: 'Stephan', age: 10 },
                { name: 'Bob', kid_name: 'Terri', age: 7 },
                { name: 'Charlie', kid_name: 'Ulrich', age: 12 },
                { name: 'Alice', kid_name: 'Vanessa', age: 8 },
                { name: 'Bob', kid_name: 'William', age: 15 },
                { name: 'Charlie', kid_name: 'Xavier', age: 18 },
                { name: 'Alice', kid_name: 'Yolanda', age: 3 },
                { name: 'Bob', kid_name: 'Zachary', age: 9 } ]
              ];

    var family = dataframe(tbl);

Once a data frame has been created, it can be manipulated using the
methods below.

Most methods return a new data frame, making it possible to use method
chaining to conveniently apply a sequence of operations to a data
frame. 

### _df_.length

Return the number of rows in the data frame.

    > family.length
    8

### _df_.rows( )

Return the array of rows in the data frame.

    > family.rows()
    [ { name: 'Alice', kid_name: 'Stephan', age: 10 },
      { name: 'Bob', kid_name: 'Terri', age: 7 },
      { name: 'Charlie', kid_name: 'Ulrich', age: 12 },
      { name: 'Alice', kid_name: 'Vanessa', age: 8 },
      { name: 'Bob', kid_name: 'William', age: 15 },
      { name: 'Charlie', kid_name: 'Xavier', age: 18 },
      { name: 'Alice', kid_name: 'Yolanda', age: 3 },
      { name: 'Bob', kid_name: 'Zachary', age: 9 } ]


### _df_.row( _i_ )

Return the _i_ th row in the data frame. The first row has index 0. 

    > family.row(2)
    { name: 'Charlie', kid_name: 'Ulrich', age: 12 }


### _df_.map( _f_ )

Return the array obtained by applying function _f_ to every row of the
data frame.

    > family.map(function(r) { return r.kid_name; })
    [ 'Stephan',
      'Terri',
      'Ulrich',
      'Vanessa',
      'William',
      'Xavier',
      'Yolanda',
      'Zachary' ]

### _df_.forEach( _f_ )

Call function _f_ for every row of the data frame, in order. 

    > family.forEach(function(r) { console.log(r.kid_name+" is "+r.age+" years old"); })
    Stephan is 10 years old
    Terri is 7 years old
    Ulrich is 12 years old
    Vanessa is 8 years old
    William is 15 years old
    Xavier is 18 years old
    Yolanda is 3 years old
    Zachary is 9 years old

### _df_.reduce( _f_ )
### _df_.reduce( _f_ , _init_ )

Return the result of [reducing](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/Reduce) the rows of the data frame according to
function _f_ (and optional initial value _init_ ).

The following example computes the minimum age of the children in the
`family` data frame:

    > family.reduce(function(a,r) { return Math.min(a,r.age); },100);
    3


### _df_.arrange( _field_ )
### _df_.arrange( _field_ , _descending_ )

Return a new data frame with the rows of data frame _df_ sorted by
the value of field _field_, from low to high. The sorting is
stable, meaning that relative ordering of the rows with the same value
of field _field_ is preserved. If _descending_ is specified and
`true`, sorting is done from high to low.

    > family.arrange("age").rows()
    [ { name: 'Alice', kid_name: 'Yolanda', age: 3 },
      { name: 'Bob', kid_name: 'Terri', age: 7 },
      { name: 'Alice', kid_name: 'Vanessa', age: 8 },
      { name: 'Bob', kid_name: 'Zachary', age: 9 },
      { name: 'Alice', kid_name: 'Stephan', age: 10 },
      { name: 'Charlie', kid_name: 'Ulrich', age: 12 },
      { name: 'Bob', kid_name: 'William', age: 15 },
      { name: 'Charlie', kid_name: 'Xavier', age: 18 } ]

### _df_.filter( _f_ )
### _df_.filter( [ _f_ , _field_ , ... ] )

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
    [ { name: 'Alice', kid_name: 'Stephan', age: 10 },
      { name: 'Charlie', kid_name: 'Ulrich', age: 12 },
      { name: 'Bob', kid_name: 'William', age: 15 },
      { name: 'Charlie', kid_name: 'Xavier', age: 18 } ]
    
    > family.filter([function(v) { return v >= 10; },"age"]).rows()
    [ { name: 'Alice', kid_name: 'Stephan', age: 10 },
      { name: 'Charlie', kid_name: 'Ulrich', age: 12 },
      { name: 'Bob', kid_name: 'William', age: 15 },
      { name: 'Charlie', kid_name: 'Xavier', age: 18 } ]

### _df_.distinct( )

Return a new data frame where duplicate rows in _df_ have been removed. 

### _df_.slice( _start_ , _end_ )

Return a new data frame containing only rows of _df_ from index
_start_ to index _end_ (exclusive). The first row of _df_ has index 0.

    > family.slice(3,6).rows()
    [ { name: 'Alice', kid_name: 'Vanessa', age: 8 },
      { name: 'Bob', kid_name: 'William', age: 15 },
      { name: 'Charlie', kid_name: 'Xavier', age: 18 } ]


### _df_.select( _field_ , ... )

Return a new data frame where each row only has fields _field_, ... . 

    > family.select("kid_name","age").rows()
    [ { kid_name: 'Stephan', age: 10 },
      { kid_name: 'Terri', age: 7 },
      { kid_name: 'Ulrich', age: 12 },
      { kid_name: 'Vanessa', age: 8 },
      { kid_name: 'William', age: 15 },
      { kid_name: 'Xavier', age: 18 },
      { kid_name: 'Yolanda', age: 3 },
      { kid_name: 'Zachary', age: 9 } ]

### _df_.mutate( _new_fields_ )

Return a new data frame where each row has been augmented with new
fields. The new fields are described in _new_field_ which is an object
assigning to each new field the function used to compute the value of
that new field for every row. That function can be given in two ways,
as in the [filter()](#df-filter-f) method.


### _df_.summarise( _new_fields_ )


### _df_.group_by( _field_ )


## Grouped Data Frames

Data in a data frame can be _grouped_ via the group_by() method,
yielding a _grouped data frame_. A grouped data frame allows mostly
the same operations as a data frame, but those operations will usually
apply to the groups within a grouped data frame, preserving the
grouping structure.


### _gdf_.rows()
### _gdf_.groups()
### _gdf_.group(_i_)
### _gdf_.map(_f_)
### _gdf_.forEach(_f_)
### _gdf_.reduce(_f_)
### _gdf_.reduce(_f_,_init_)
### _gdf_.arrange(_field_,[_descending_])
### _gdf_.filter(_f_)
### _gdf_.filter([_f_,_field_,...)
### _gdf_.distinct()
### _gdf_.slice(_start_,_end)
### _gdf_.select(_field_,...)
### _gdf_summarise(_descr_)
### _gdf_mutate(_descr_)
### _gdf_group_by(_field_)
### _gdf_ungroup()

