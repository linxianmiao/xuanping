import React, { useState, useEffect, Component } from 'react'
import { toJS } from 'mobx'
import { inject, observer } from 'mobx-react'
import { Radio, Select } from '@uyun/components'

const RadioGroup = Radio.Group
const { Option } = Select

@inject('formSetGridStore')
@observer
export default class TimeValidate extends Component {
  static defaultProps = {
    fieldCode: '',  // 本字段code
    value: {},
    onChange: () => {}
  }

  handleTypeChange = type => {
    this.props.onChange({ type, fieldCode: undefined, fieldName: undefined })
  }

  handleFieldChange = (fieldCode, option) => {
    const { type } = this.props.value
    this.props.onChange({ type, fieldCode, fieldName: option.props.children })
  }

  renderTimeSelect = () => {
    const { fieldCode, value } = this.props
    const { allTimeFields } = this.props.formSetGridStore

    return (
      <Select
        style={{ width: 200 }}
        placeholder="请选择指定时间"
        value={value.fieldCode}
        onChange={this.handleFieldChange}
      >
        {
          allTimeFields
            .filter(field => field.code !== fieldCode)
            .map(field => <Option key={field.code}>{field.name}</Option>)
        }
      </Select>
    )
  }

  render() {
    const { value } = this.props
    const { type } = value

    return (
      <RadioGroup value={type} onChange={e => this.handleTypeChange(e.target.value)}>
        <Radio value={1}>大于当前时间</Radio>
        <br/>
        <Radio value={2}>小于当前时间</Radio>
        <br/>
        <Radio value={3}>大于指定时间</Radio>
        {
          type === 3 && this.renderTimeSelect()
        }
        <br/>
        <Radio value={4}>小于指定时间</Radio>
        {
          type === 4 && this.renderTimeSelect()
        }
      </RadioGroup>
    )
  }
}

// const TimeValidate = ({
//   value = {},
//   onChange = () => {}
// }) => {
//   const { type, time } = value
//   const [fields, setFields] = useState([])

//   const queryFields = async () => {
//     const res = await axios.get(API.get_all_field, { params: { type: 'dateTime' } })

//     console.log(res)
//   }

//   const handleTypeChange = type => {
//     onChange({ type, time: undefined })
//   }

//   const radioStyle = {
//     // display: 'block',
//     height: '30px',
//     lineHeight: '30px'
//   }

//   return (
//     <RadioGroup value={type} onChange={e => handleTypeChange(e.target.value)}>
//       <Radio style={radioStyle} value={1}>大于当前时间</Radio>
//       <br/>
//       <Radio style={radioStyle} value={2}>小于当前时间</Radio>
//       <br/>
//       <Radio style={radioStyle} value={3}>大于指定时间</Radio>
//       {
//         type === 3 && (
//           <Select
            
//           >

//           </Select>
//         )
//       }
//       <br/>
//       <Radio style={radioStyle} value={4}>小于指定时间</Radio>
//     </RadioGroup>
//   )
// }

// export default TimeValidate
