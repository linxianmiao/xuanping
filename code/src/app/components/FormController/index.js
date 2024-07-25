import { cloneElement, useState, useRef, useMemo, useEffect, memo } from 'react'
import { debounce } from 'lodash'

export function FormDebounceInput({
  onChange: fromOnChange,
  value: formValue,
  children,
  code,
  ...args
}) {
  const [value, setValue] = useState(formValue)
  const propsRef = useRef({ onChange: fromOnChange })
  propsRef.current.onChange = fromOnChange

  useEffect(() => {
    setValue(formValue)
  }, [formValue])

  const update = useMemo(() => {
    return debounce(value => {
      // 字段自己change的时候也需要重新更新当前组件，否则props中的数据不会更新，会导致下次外部数据更新props时失效
      window.FORM_CHANGE_FIELD_CODES.add(code)
      propsRef.current.onChange(value)
      window.FORM_CHANGE_FIELD_CODES.delete(code)
    }, 500)
  }, [])

  const onChange = e => {
    const value = e.target.value
    setValue(value)
    update(value)
  }

  return cloneElement(children, { onChange, value, ...args })
}

export function FormDebounceSelect({
  onChange: fromOnChange,
  value: formValue,
  children,
  code,
  ...args
}) {
  const [value, setValue] = useState(formValue)
  const propsRef = useRef({ onChange: fromOnChange })
  propsRef.current.onChange = fromOnChange
  useEffect(() => {
    setValue(formValue)
  }, [formValue])

  const update = useMemo(() => {
    return debounce(value => {
      window.FORM_CHANGE_FIELD_CODES.add(code)
      propsRef.current.onChange(value)
      window.FORM_CHANGE_FIELD_CODES.delete(code)
    }, 300)
  }, [])

  const onChange = value => {
    setValue(value)
    update(value)
  }

  return cloneElement(children, { onChange, value, ...args })
}

export function FormDebounceDate({
  onChange: fromOnChange,
  value: formValue,
  children,
  code,
  ...args
}) {
  const [value, setValue] = useState(formValue)
  const propsRef = useRef({ onChange: fromOnChange })
  propsRef.current.onChange = fromOnChange

  useEffect(() => {
    setValue(formValue)
  }, [formValue])

  const update = useMemo(() => {
    return debounce(value => {
      window.FORM_CHANGE_FIELD_CODES.add(code)
      propsRef.current.onChange(value)
      window.FORM_CHANGE_FIELD_CODES.delete(code)
    }, 300)
  }, [])

  const onChange = value => {
    setValue(value)
    update(value)
  }

  return cloneElement(children, { onChange, value, ...args })
}

export const FormMemoField = memo(
  ({ children, field, dilver }) => {
    return cloneElement(children, { key: field.code, ...dilver })
  },
  prevProps => {
    // 返回true则该组件不会被重新渲染
    // 该组件下面子组件自己维护form表单中的值，如上述FormDebounceInput等组件  所以子组件只能维护由页面手输的数据
    // FORM_CHANGE_FIELD_CODES属性用来监听通过callback脚本setFieldsValue而改变表单中的值。若此则让其刷新
    // 遗留问题：
    //  1. 需要花点时间重构一下，若有新字段类型页面响应变慢，则需要调整多个文件。
    //  2. 确定没有其他地方可以调取setFieldsValue，否则都得放FORM_CHANGE_FIELD_CODES中监听
    return (
      window.FORM_CHANGE_FIELD_CODES.size &&
      !window.FORM_CHANGE_FIELD_CODES.has(prevProps.field.code)
    )
  }
)
