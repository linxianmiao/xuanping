import React from 'react'
import { Radio as URadio } from '@uyun/components'
import Radio from './Radio'
import { isValueEqual } from './factory'

const URadioGroup = URadio.Group

const RadioGroup = React.forwardRef((props, ref) => {
  const { children, options, isChooseColor, value, ...restProps } = props
  const renderRadiosByChildren = () => {
    return React.Children.map(children, (child) =>
      React.cloneElement(child, {
        isChooseColor,
        checked: isValueEqual(value, child.props.value)
      })
    )
  }

  const renderRadiosByOptions = () => {
    return options.map((option) => (
      <Radio
        key={option.value}
        {...option}
        value={String(option.value)}
        isChooseColor={isChooseColor}
        checked={isValueEqual(value, option.value)}
      >
        {option.label}
      </Radio>
    ))
  }

  return (
    <URadioGroup ref={ref} value={String(props.value)} {...restProps}>
      {Array.isArray(options) ? renderRadiosByOptions() : renderRadiosByChildren()}
    </URadioGroup>
  )
})

// RadioGroup.defaultProps = {
//   options: undefined,
//   isChooseColor: false,
//   value: undefined,
//   onChange: () => {}
// }

export default RadioGroup
