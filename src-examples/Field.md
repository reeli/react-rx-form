# Field

- name: string
- children: TChildrenRender<IFieldInnerProps>
- defaultValue?: TFieldValue
- validate?: TValidator | TValidator[]
- format?: (value: TFieldValue) => TFieldValue
  将 store 的 value 转换成用于 field input 展示的 value。比如将数字 format 成货币。一般跟 parse 成对出现。
- parse?: (value: TFieldValue) => TFieldValue
  将 filed input 提供的 value 解析成你想要存入 store 的格式。比如将货币转化成数字。一般跟 format 成对出现。
