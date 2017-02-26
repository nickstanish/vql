# Vizi Querying Language
________________

## Example data sets

**Source Name:**
git

**Schema Data:**
_Simple object_

```
{
	pulls.open: 35,
	pulls.closed: 49,
	commits: 100
}
```

____________

**Source Name:**
purchases

**Schema Data:**
_Collection_

```
[
	{
		date: "today",
		subTotal: 50.0,
		taxPercentage: 7.0,
		store.nthCustomer: 9783
	},
	{
		date: "today",
		subTotal: 126.0,
		taxPercentage: 7.0, store.nthCustomer: 9784
	}
]
```


## Single Value Queries

**example result:**

```
{
	result: <value>
}
```

### Writing Queries



#### Simple

Access the source using `$<source name>`

Syntax
```
$<source>.<key>
```

Example
```
$git.pulls.open
```
or
```
$git."pulls"."open"
```
or
```
$git["pulls"]["open"]
```

Result
```
84
```

#### Simple Operations

Syntax
```
$<source1>.<key> <operator> $<source2>.<key>
```

Example
```
$git.pulls.open + $git.pulls.closed
```

Result
```
35
```

#### Simple with Collection

Access a specific index in a collection.

Syntax
```
$<source>[<index>].<key>
```

Example
```
$purchases[0].store.nthCustomer
```

Result
```
9783
```

#### Aggregating a Collection

You can aggregate over a collection within the latest document (snapshot of source data). At this time, aggregating across multiple **documents** in the database is not supported.

Available Aggregation Functions:
```
min(collection, "property")
max(collection, "property")
sum(collection, "property")
avg(collection, "property")
count(collection)
```

Syntax
```
Grouping: <function>($<source>[.<attributes>], "<property>")
```

Example
```
Equation: sum($purchases, "subTotal")
```

Result
```
176
```


## Multiple Value Queries (grouping)

Use the variable `group` to access a group's data.

**example result:**

```
{
	result: [
		{
			name: <groupName1>,
			value: <groupValue1>
		},
		{
			name: <groupName2>,
			value: <groupValue2>
		},
		{
			name: <groupName3>,
			value: <groupValue3>
		}
	]
}
```

Syntax
```
Equation: <function>( group, "property to aggregate on" )
Grouping Collection: $<source>[.<properties>]
Grouping Property: "<property>"
```
