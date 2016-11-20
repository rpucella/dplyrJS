
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


## Usage

DplyrJS's main data structure is a _data frame_. A data frame
represents a table of data, where rows in the table are data points
(experiments) and columns are variables (observations). 

    ((example))

A data frame is created by calling `dataframe` with an array of
objects, where each object represents a row of the table and maps the
variables to their value for that row.

    var tbl = [ 
                { ... }
                       
              ];

    var df = dataframe(tbl);

Once a data frame has been created, it can be manipulated using the
available methods.


### _df_`.rows()`

Return the arrays of rows in the data frame

