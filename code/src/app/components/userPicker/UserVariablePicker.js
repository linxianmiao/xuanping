import React from 'react'
import { inject, observer } from 'mobx-react'
import { Checkbox, Row, Radio } from '@uyun/components'

import BasicPicker from './basicPicker'
const RadioGroup = Radio.Group
const variableList = [
  {
    id: 'curr_depart',
    name: '当前用户所在部门'
  },
  {
    id: 'curr_group',
    name: '当前用户所在用户组'
  }
]

@inject('userPickStore')
@observer
export class UserVariablePicker extends BasicPicker {
  render() {
    const { selectedRowKeys, type, selectionType } = this.props
    const value = selectedRowKeys.includes('curr_depart') ? 'curr_depart' : selectedRowKeys.includes('curr_group') ? 'curr_group' : undefined
    // console.log('value', value)
    // return variableList.map(item => {
    //   return (
    //     <Row key={item.id} style={{ margin: '10px 0' }}>
    //       <Checkbox
    //         checked={selectedRowKeys.indexOf(item.id) > -1}
    //         onChange={e => {
    //           this.onSelect([{ ...item }], e.target.checked, type)
    //         }}
    //       >
    //         {item.name}
    //       </Checkbox>
    //     </Row>
    //   )
    // })

    return (
      <RadioGroup onChange={e => {
        const item = variableList.filter(d => d.id === e.target.value)
        const notSelectedItems = variableList.filter(d => d.id !== e.target.value).map(d => d.id) || []
        this.onSelect(item, true, type, notSelectedItems)
      }}>
        {
          variableList.map(item => <Radio key={item.id} value={item.id} >{item.name}</Radio>)
        }
      </RadioGroup>
    )
  }
}

export default UserVariablePicker
