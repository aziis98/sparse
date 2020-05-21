
<img src="logo.png" width="330">

# Sparse

A stack based javascript parsing library.

## Example

Se this [example](examples/text-formatting.ts) of a simple text formatter, this is able to parse text like `This is *an* _example_ with a link to [https://github.com][GitHub]` and returns

```javascript
[
    'This is ', 
    Bold('an'),
    ' ',
    Italic('example'), 
    ' with a link to ', 
    Link('https://github.com', 'GitHub')
]
```

## Documentation

[TODO]














