### FieldArray Props

- **name**: string [required]

  FieldArray 的名称

- **initLength**: number [optional]

  当前 FieldArray 的长度

### FieldArray Inner Props

- **fields**: string[]

  一个数组，数据里面的每个 item 是根据 FieldArray 的 `name` 以及 item 的 `index` 生成的字符串

- **add**: Function
