import React from 'react'
import RadioButton from './RadioButton'

const RadioButtonGroup = React.forwardRef((props, ref) => {
  const { options, value, isChooseColor, onChange, ...restProps } = props
  const renderRadiosByOptions = () => {
    return options.map((option, i) => {
      return (
        <RadioButton
          {...option}
          disabled={props.disabled}
          key={i}
          style={{ marginRight: 10 }}
          isChooseColor={isChooseColor}
          checked={value === `${option.value}`}
          onChange={onChange}
        >
          {option.label}
        </RadioButton>
      )
    })
  }

  return (
    <div ref={ref} {...restProps}>
      {Array.isArray(options) ? renderRadiosByOptions() : null}
    </div>
  )
})

// RadioButtonGroup.defaultProps = {
//   options: undefined,
//   isChooseColor: false,
//   value: undefined,
//   onChange: () => {},
// }

export default RadioButtonGroup
